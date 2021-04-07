import { v4 as uuid } from 'uuid';
import * as _ from 'lodash';
import { handleJsonParse, handleJsonStringify } from '../util/util';

export interface LocalStorageData {
  subscriptionKey: string;
  current: any;
  previous: any;
}

export type LocalStorageEventHandler = (data: LocalStorageData) => void;

export interface LocalStorageEventSubscription {
  subscriptionId: string;
  callback: LocalStorageEventHandler;
}

export interface LocalStorageSubscription {
  subscriptionId: string;
  unsubscribeLocalStorage: () => void;
}

export type LocalStorageSubscriptionData = {
  subscriptions: Map<string, LocalStorageEventSubscription>;
};

export const setLocalStorage = (subscriptionKey: string, data: any) => {
  LocalStorageManager.setLocalStorage(subscriptionKey, data);
};

export const subscribeLocalStorage = (
  subscriptionKey: string,
  callback: LocalStorageEventHandler,
  triggerNow = false,
): LocalStorageSubscription => {
  return LocalStorageManager.subscribeLocalStorage(subscriptionKey, callback, triggerNow);
};

export const getLocalStorageData = (subscriptionKey: string): any => {
  return LocalStorageManager.getLocalStorageData(subscriptionKey);
};

export const deleteLocalStorage = (subscriptionKey: string): boolean => {
  return LocalStorageManager.deleteLocalStorage(subscriptionKey);
};

class LocalStorageManager {
  private static map: Map<string, LocalStorageSubscriptionData> = new Map();

  static setLocalStorage(subscriptionKey: string, data: any) {
    if (subscriptionKey) {
      const subsData = this.map.get(subscriptionKey);
      const newDataString = handleJsonStringify(data);
      let dataAdded: any;
      const prevData = localStorage.getItem(subscriptionKey);
      if (subsData) {
        if (!_.isEqual(prevData, newDataString)) {
          localStorage.setItem(subscriptionKey, newDataString ? newDataString : '');
          dataAdded = data;
        }
      } else {
        localStorage.setItem(subscriptionKey, newDataString ? newDataString : '');
        this.map.set(subscriptionKey, { subscriptions: new Map() });
      }

      if (dataAdded) {
        subsData?.subscriptions.forEach((eventSub: LocalStorageEventSubscription) => {
          if (eventSub) {
            if (subsData) {
              eventSub.callback({
                subscriptionKey,
                current: _.cloneDeep(data),
                previous:  _.cloneDeep(prevData),
              });
            }
          }
        });
      }
    }
  }

  static subscribeLocalStorage(
    subscriptionKey: string,
    callback: LocalStorageEventHandler,
    triggerNow?: boolean,
  ): LocalStorageSubscription {
    const id = uuid();
    if (subscriptionKey && callback) {
      const subscriptionData = this.map.get(subscriptionKey);
      if (subscriptionData) {
        subscriptionData.subscriptions.set(id, { subscriptionId: id, callback });

        if (triggerNow) {
          let localData = localStorage.getItem(subscriptionKey);
          if (localData) {
            localData =_.cloneDeep(handleJsonParse(localData));
          }
          callback({
            subscriptionKey,
            current: localData,
            previous: localData ? _.cloneDeep(localData) : null
          });
        }
      } else {
        const subsData: LocalStorageSubscriptionData = {
          subscriptions: new Map(),
        };
        subsData.subscriptions.set(id, { subscriptionId: id, callback });
        this.map.set(subscriptionKey, subsData);
      }
    } else {
      throw new Error('Invalid subscription key or callback.');
    }

    return { subscriptionId: id, unsubscribeLocalStorage: () => this.unsubscribeLocalStorage(subscriptionKey, id) };
  }

  static deleteLocalStorage(subscriptionKey: string): boolean {
    const data = localStorage.getItem(subscriptionKey);
    localStorage.removeItem(subscriptionKey);
    const deleted = localStorage.getItem(subscriptionKey) === null && data !== null;

    if (deleted) {
      const subscriptionData = this.map.get(subscriptionKey);
      subscriptionData?.subscriptions.forEach((value: LocalStorageEventSubscription, key: string) => {
        value.callback({
          subscriptionKey,
          current: null,
          previous: _.cloneDeep(handleJsonParse(data))
        });
      });
      this.map.delete(subscriptionKey);
    }

    return deleted;
  }

  static getLocalStorageData(subscriptionKey: string): any {
    const localData = localStorage.getItem(subscriptionKey);
    return localData ? handleJsonParse(localData) : null;
  }

  static unsubscribeLocalStorage(subscriptionKey: string, subscriptionId: string): boolean {
    const subsData = this.map.get(subscriptionKey);
    return subsData ? subsData.subscriptions.delete(subscriptionId) : false;
  }
}
