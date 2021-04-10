import { v4 as uuid } from 'uuid';
import * as _ from 'lodash';
import { handleJsonParse, handleJsonStringify } from '../util/util';

export interface SessionStorageData {
  subscriptionKey: string;
  current: any;
  previous: any;
}

export type SessionStorageEventHandler = (data: SessionStorageData) => void;

export interface SessionStorageEventSubscription {
  subscriptionId: string;
  eventHandler: SessionStorageEventHandler;
}

export interface SessionStorageSubscription {
  subscriptionId: string;
  unsubscribeSessionStorage: () => void;
}

export type SessionStorageSubscriptionData = {
  subscriptions: Map<string, SessionStorageEventSubscription>;
};

export const setSessionStorage = (subscriptionKey: string, newData: any) => {
  SessionStorageManager.setSessionStorage(subscriptionKey, newData);
};

export const subscribeSessionStorage = (
  subscriptionKey: string,
  callback: SessionStorageEventHandler,
  triggerNow = false,
): SessionStorageSubscription => {
  return SessionStorageManager.subscribeSessionStorage(subscriptionKey, callback, triggerNow);
};

export const getSessionStorageData = (subscriptionKey: string): any => {
  return SessionStorageManager.getSessionStorageData(subscriptionKey);
};

export const deleteSessionStorage = (subscriptionKey: string): boolean => {
  return SessionStorageManager.deleteSessionStorage(subscriptionKey);
};

class SessionStorageManager {
  private static map: Map<string, SessionStorageSubscriptionData> = new Map();

  static setSessionStorage(subscriptionKey: string, data: any) {
    if (subscriptionKey) {
      const subsData = this.map.get(subscriptionKey);
      const newDataString = handleJsonStringify(data);
      let dataAdded: any;
      const prevData = sessionStorage.getItem(subscriptionKey);
      if (subsData) {
        if (!_.isEqual(prevData, newDataString)) {
          sessionStorage.setItem(subscriptionKey, newDataString ? newDataString : '');
          dataAdded = true;
        }
      } else {
        sessionStorage.setItem(subscriptionKey, newDataString ? newDataString : '');
        this.map.set(subscriptionKey, { subscriptions: new Map() });
      }

      if (dataAdded) {
        const parsedPrevioisData = handleJsonParse(prevData);
        subsData?.subscriptions.forEach((eventSub: SessionStorageEventSubscription) => {
          if (subsData) {
            eventSub.eventHandler({
              subscriptionKey,
              current: _.cloneDeep(data),
              previous: prevData ? _.cloneDeep(parsedPrevioisData) : null,
            });
          }
        });
      }
    }
  }

  static subscribeSessionStorage(
    subscriptionKey: string,
    callback: SessionStorageEventHandler,
    triggerNow = false,
  ): SessionStorageSubscription {
    const id = uuid();
    if (subscriptionKey && callback) {
      const subscriptionData = this.map.get(subscriptionKey);
      if (subscriptionData) {
        subscriptionData.subscriptions.set(id, { subscriptionId: id, eventHandler: callback });

        if (triggerNow) {
          let sessionData = sessionStorage.getItem(subscriptionKey);
          if (sessionData) {
            sessionData = _.cloneDeep(handleJsonParse(sessionData));
          }
          callback({
            subscriptionKey,
            current: sessionData,
            previous: sessionData ? _.cloneDeep(sessionData) : null,
          });
        }
      } else {
        const subsData: SessionStorageSubscriptionData = {
          subscriptions: new Map(),
        };
        subsData.subscriptions.set(id, { subscriptionId: id, eventHandler: callback });
        this.map.set(subscriptionKey, subsData);
      }
    } else {
      throw new Error('Invalid subscription key or callback.');
    }

    return { subscriptionId: id, unsubscribeSessionStorage: () => this.unsubscribeSessionStorage(subscriptionKey, id) };
  }

  static deleteSessionStorage(subscriptionKey: string): boolean {
    const currentData = sessionStorage.getItem(subscriptionKey);
    sessionStorage.removeItem(subscriptionKey);
    const deleted = sessionStorage.getItem(subscriptionKey) === null && currentData !== null;

    if (deleted) {
      const subscriptionData = this.map.get(subscriptionKey);
      subscriptionData?.subscriptions.forEach((value: SessionStorageEventSubscription, key: string) => {
        value.eventHandler({
          subscriptionKey,
          current: null,
          previous: _.cloneDeep(handleJsonParse(currentData)),
        });
      });
      this.map.delete(subscriptionKey);
    }

    return deleted;
  }

  static getSessionStorageData(subscriptionKey: string): any {
    const sessionData = sessionStorage.getItem(subscriptionKey);
    return sessionData ? handleJsonParse(sessionData) : null;
  }

  static unsubscribeSessionStorage(subscriptionKey: string, subscriptionId: string): boolean {
    const subsData = this.map.get(subscriptionKey);
    return subsData ? subsData.subscriptions.delete(subscriptionId) : false;
  }
}
