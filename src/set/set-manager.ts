import { v4 as uuid } from 'uuid';
import * as _ from 'lodash';
import { CustomSet } from './custom-set';

export interface SetData {
  added?: any;
  removed?: any;
  set: any[] | null;
  subscriptionKey: string;
}

export type SetEventHandler = (data: SetData) => void;

export interface SetEventSubscription {
  subscriptionId: string;
  callback: SetEventHandler;
}

export interface SetSubscription {
  id: string;
  unsubscribeSet: () => void;
}

export type SetSubscriptionData = {
  set: CustomSet;
  subscriptions: Map<string, SetEventSubscription>;
};

export const setSet = (subscriptionKey: string, data: any | any[]) => {
  SetManager.setSet(subscriptionKey, data);
};

export const subscribeSet = (
  subscriptionKey: string,
  callback: SetEventHandler,
  triggerNow = false,
): SetSubscription => {
  return SetManager.subscribeSet(subscriptionKey, callback, triggerNow);
};

export const getSet = (subscriptionKey: string): any[] | undefined => {
  return SetManager.getSet(subscriptionKey);
};

export const clearSet = (subscriptionKey: string): boolean => {
  return SetManager.clearSet(subscriptionKey);
};

export const removeFromSet = (subscriptionKey: string, setItem: any | any[]) => {
  return SetManager.removeFromSet(subscriptionKey, setItem);
};

export class SetManager {
  private static map: Map<string, SetSubscriptionData> = new Map();

  static setSet(subscriptionKey: string, newData: any | any[]) {
    if (subscriptionKey) {
      let subData = this.map.get(subscriptionKey);
      let dataAdded: any[] = [];
      if (subData) {
        dataAdded = subData.set.add(newData);
      } else {
        subData = {
          set: new CustomSet(newData),
          subscriptions: new Map(),
        };
        this.map.set(subscriptionKey, subData);
      }

      if (dataAdded.length > 0) {
        subData.subscriptions.forEach((eventSub: SetEventSubscription) => {
          if (subData) {
            const eventData: SetData = {
              removed: null,
              added: dataAdded,
              set: _.cloneDeep(subData.set.list),
              subscriptionKey,
            };
            eventSub.callback(eventData);
          }
        });
      }
    }
  }

  static removeFromSet(subscriptionKey: string, delData: any | any[]) {
    const subsData = this.map.get(subscriptionKey);
    if (subsData?.set) {
      const toDelete = subsData.set.remove(delData);
      if (toDelete.length > 0) {
        subsData.subscriptions.forEach((eventSub: SetEventSubscription) => {
          if (subsData) {
            const eventData: SetData = {
              removed: toDelete,
              added: null,
              set: _.cloneDeep(subsData.set.list),
              subscriptionKey,
            };
            eventSub.callback(eventData);
          }
        });
      }
    }
  }

  static subscribeSet(subscriptionKey: string, callback: SetEventHandler, triggerNow?: boolean): SetSubscription {
    const id = uuid();
    if (subscriptionKey && callback) {
      const subscriptionData = this.map.get(subscriptionKey);
      if (subscriptionData) {
        subscriptionData.subscriptions.set(id, { subscriptionId: id, callback });

        if (triggerNow) {
          if (subscriptionData.set) {
            const eventData: SetData = {
              removed: undefined,
              added: undefined,
              set: _.cloneDeep(subscriptionData.set.list),
              subscriptionKey,
            };
            callback(eventData);
          }
        }
      } else {
        const subsData: SetSubscriptionData = {
          set: new CustomSet(),
          subscriptions: new Map().set(id, { subscriptionId: id, callback }),
        };
        this.map.set(subscriptionKey, subsData);
      }
    }

    return { id, unsubscribeSet: () => this.unsubscribeSet(subscriptionKey, id) };
  }

  static getSet(subscriptionKey: string): any[] | undefined {
    const subsData = this.map.get(subscriptionKey);
    return subsData ? _.cloneDeep(subsData.set.list) : undefined;
  }

  static unsubscribeSet(subscriptionKey: string, id: string): boolean {
    const subsData = this.map.get(subscriptionKey);
    return subsData ? subsData.subscriptions.delete(id) : false;
  }

  static clearSet(subscriptionKey: string): boolean {
    const subscriptionData = this.map.get(subscriptionKey);
    subscriptionData?.subscriptions?.forEach((subsData: SetEventSubscription) => {
      subsData.callback({
        added: null,
        removed: null,
        set: null,
        subscriptionKey,
      });
    });
    return this.map.delete(subscriptionKey);
  }
}
