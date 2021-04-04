import { v4 as uuid } from 'uuid';
import * as _ from 'lodash';

export interface ShelfData {
  key: string;
  current: any;
  previous: any;
}

export type ShelfEventHandler = (data: ShelfData) => void;

export interface ShelfEventSubscription {
  subscriptionId: string;
  callback: ShelfEventHandler;
}

export interface ShelfSubscription {
  id: string;
  unsubscribeShelf: () => void;
}

export type ShelfSubscriptionData = {
  data: ShelfData;
  subscriptions: Map<string, ShelfEventSubscription>;
};

export const setShelf = (subscriptionKey: string, data: any) => {
  ShelfManager.setShelf(subscriptionKey, data);
};

export const subscribeShelf = (
  subscriptionKey: string,
  callback: ShelfEventHandler,
  triggerNow = false,
): ShelfSubscription => {
  return ShelfManager.subscribeShelf(subscriptionKey, callback, triggerNow);
};

export const getShelfData = (subscriptionKey: string): any => {
  return ShelfManager.getShelfData(subscriptionKey);
};

class ShelfManager {
  private static shelf: Map<string, ShelfSubscriptionData> = new Map();

  static setShelf(subscriptionKey: string, data: any) {
    if (subscriptionKey) {
      let shelf = this.shelf.get(subscriptionKey);
      const newDataClone = _.cloneDeep(data);
      if (shelf) {
        shelf.data.previous = _.cloneDeep(shelf.data.current);
        shelf.data.current = newDataClone;
      } else {
        shelf = {
          data: {
            key: subscriptionKey,
            current: newDataClone,
            previous: null,
          },
          subscriptions: new Map(),
        };
        this.shelf.set(subscriptionKey, shelf);
      }

      shelf.subscriptions.forEach((eventSub: ShelfEventSubscription) => {
        if (shelf) {
          eventSub.callback(shelf.data);
        }
      });
    }
  }

  static subscribeShelf(subscriptionKey: string, callback: ShelfEventHandler, triggerNow = false): ShelfSubscription {
    const id = uuid();
    if (subscriptionKey && callback) {
      const subscriptionData = this.shelf.get(subscriptionKey);
      if (subscriptionData) {
        subscriptionData.subscriptions.set(id, { subscriptionId: id, callback });

        if (triggerNow) {
          if (subscriptionData.data) {
            callback(_.cloneDeep(subscriptionData.data));
          }
        }
      } else {
        const subsData: ShelfSubscriptionData = {
          data: {
            key: subscriptionKey,
            current: null,
            previous: null,
          },
          subscriptions: new Map(),
        };
        subsData.subscriptions.set(id, { subscriptionId: id, callback });
        this.shelf.set(subscriptionKey, subsData);
      }
    } else {
      throw new Error('Invalid subscription key or callback');
    }

    return { id, unsubscribeShelf: () => this.unsubscribeShelf(subscriptionKey, id) };
  }

  static getShelfData(subscriptionKey: string): any {
    const subsData = this.shelf.get(subscriptionKey);
    return subsData ? _.cloneDeep(subsData.data) : null;
  }

  static unsubscribeShelf(subscriptionKey: string, subscriptionId: string): boolean {
    const subsData = this.shelf.get(subscriptionKey);
    return subsData ? subsData.subscriptions.delete(subscriptionId) : false;
  }
}
