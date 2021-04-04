import { v4 as uuid } from 'uuid';
import * as _ from 'lodash';

export interface ShelfData {
  key: string;
  current: any;
  previous: any;
}

export type ShelfEventHandler = (data: ShelfData) => void;

export type ShelfEventFilter = (data: ShelfData) => any | null;

export interface ShelfEventSubscription {
  subscriptionId: string;
  callback?: ShelfEventHandler;
  eventFilter?: ShelfEventFilter;
  filteredCallback?: (filteredData: any) => any;
}

export interface ShelfEventFilterArgs {
  subscriptionKey: string;
  eventFilter: ShelfEventFilter;
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

export const subscribeShelfFilter = (
  filterArgs: ShelfEventFilterArgs,
  filteredCallback: (data: any) => any,
  triggerNow?: boolean,
): ShelfSubscription => {
  if (!filterArgs) {
    throw new Error('Invalid Shelf filter arguments.');
  }
  return ShelfManager.subscribeShelfFilter(
    filterArgs.subscriptionKey,
    filterArgs.eventFilter,
    filteredCallback,
    triggerNow,
  );
};

export const clearShelf = (subscriptionKey: string): boolean => {
  return ShelfManager.clearShelf(subscriptionKey);
}

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
          if (eventSub.eventFilter && eventSub.filteredCallback) {
            const filteredData = eventSub.eventFilter(shelf.data);
            if (filteredData) {
              eventSub.filteredCallback(filteredData);
            }
          } else if (eventSub.callback) {
            eventSub.callback(shelf.data);
          }
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

  static subscribeShelfFilter(
    subscriptionKey: string,
    eventFilter: ShelfEventFilter,
    filteredCallback: (filteredData: any) => any,
    triggerNow = false,
  ): ShelfSubscription {
    const id = uuid();
    if (subscriptionKey && eventFilter && filteredCallback) {
      const subscriptionData = this.shelf.get(subscriptionKey);
      if (subscriptionData) {
        subscriptionData.subscriptions.set(id, { subscriptionId: id, filteredCallback, eventFilter });

        if (triggerNow) {
          if (subscriptionData.data) {
            const filteredData = eventFilter(subscriptionData.data);
            if (filteredData) filteredCallback(filteredData);
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
        subsData.subscriptions.set(id, { subscriptionId: id, filteredCallback, eventFilter });
        this.shelf.set(subscriptionKey, subsData);
      }
    } else {
      throw new Error('Invalid subscription key or eventFilter or callback.');
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

  static clearShelf(subscriptionKey: string): boolean {
    if (subscriptionKey) {
      const subData = this.shelf.get(subscriptionKey);
      if (subData) {
        subData.subscriptions.forEach((eventSub: ShelfEventSubscription) => {
          if (eventSub.callback) {
            eventSub.callback({current: null, previous: null, key: subscriptionKey});
          } else if (eventSub.filteredCallback) {
            eventSub.filteredCallback(null);
          }
        });
      }
  
      return this.shelf.delete(subscriptionKey);
    }
    return false;    
  } 
}
