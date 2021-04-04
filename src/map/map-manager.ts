import { v4 as uuid } from 'uuid';
import * as _ from 'lodash';

export interface MapData {
  key: string | null;
  current: any | null;
  previous: any | null;
  map: Map<any, any> | null;
}

export type MapEventHandler = (data: MapData) => void;

export interface MapEventSubscription {
  subscriptionId: string;
  callback: MapEventHandler;
}

export interface MapSubscription {
  id: string;
  unsubscribeMap: () => void;
}

export type MapSubscriptionData = {
  map: Map<any, any>;
  subscriptions: Map<string, MapEventSubscription>;
};

export const setMap = (subscriptionKey: string, entryKey: string, newData: any) => {
  MapManager.setMap(subscriptionKey, entryKey, newData);
};

export const loadMap = (subscriptionKey: string, obj: { [objKey: string]: any }) => {
  MapManager.loadMap(subscriptionKey, obj);
};

export const subscribeMap = (
  subscriptionKey: string,
  callback: MapEventHandler,
  triggerNow = false,
): MapSubscription => {
  return MapManager.subscribeMap(subscriptionKey, callback, triggerNow);
};

export const getMap = (subscriptionKey: string): Map<any, any> | undefined => {
  return MapManager.getMap(subscriptionKey);
};

export const clearMap = (subscriptionKey: string): boolean => {
  return MapManager.clearMap(subscriptionKey);
};

export const deleteMapEntry = (subscriptionKey: string, entryKey: string): boolean => {
  return MapManager.deleteMapEntry(subscriptionKey, entryKey);
};

class MapManager {
  private static map: Map<string, MapSubscriptionData> = new Map();

  static setMap(subscriptionKey: string, entryKey: string, newData: any) {
    if (subscriptionKey) {
      let subData = this.map.get(subscriptionKey);
      const newDataClone = _.cloneDeep(newData);
      let prevData: any;
      if (subData) {
        prevData = subData.map.get(entryKey);
        subData.map.set(entryKey, newDataClone);
      } else {
        subData = {
          map: new Map().set(entryKey, newData),
          subscriptions: new Map(),
        };
        this.map.set(subscriptionKey, subData);
      }

      subData.subscriptions.forEach((eventSub: MapEventSubscription) => {
        if (eventSub) {
          if (subData) {
            const eventData: MapData = {
              key: entryKey,
              current: newDataClone,
              previous: _.cloneDeep(prevData),
              map: _.cloneDeep(subData.map),
            };
            eventSub.callback(eventData);
          }
        }
      });
    }
  }

  static loadMap(subscriptionKey: string, newData: { [objKey: string]: any }) {
    if (subscriptionKey && newData) {
      let subData = this.map.get(subscriptionKey);
      const newDataClone = _.cloneDeep(newData);
      if (subData) {
        Object.entries(newDataClone).forEach((item: any) => {
          subData?.map.set(item[0], item[1]);
        });
      } else {
        subData = {
          map: new Map(Object.entries(newDataClone)),
          subscriptions: new Map(),
        };
        this.map.set(subscriptionKey, subData);
      }

      subData.subscriptions.forEach((eventSub: MapEventSubscription) => {
        const eventData: MapData = {
          key: null,
          current: null,
          previous: null,
          map: subData ? _.cloneDeep(subData.map) : null,
        };
        eventSub.callback(eventData);
      });
    }
  }

  static subscribeMap(subscriptionKey: string, callback: MapEventHandler, triggerNow = false): MapSubscription {
    const id = uuid();
    if (subscriptionKey && callback) {
      const subscriptionData = this.map.get(subscriptionKey);
      if (subscriptionData) {
        subscriptionData.subscriptions.set(id, { subscriptionId: id, callback: callback });

        if (triggerNow) {
          if (subscriptionData.map) {
            const eventData: MapData = {
              key: null,
              current: null,
              previous: null,
              map: _.cloneDeep(subscriptionData.map),
            };
            callback(eventData);
          }
        }
      } else {
        const subsData: MapSubscriptionData = {
          map: new Map(),
          subscriptions: new Map(),
        };
        subsData.subscriptions.set(id, { subscriptionId: id, callback: callback });
        this.map.set(subscriptionKey, subsData);
      }
    }

    return { id, unsubscribeMap: () => this.unsubscribeMap(subscriptionKey, id) };
  }

  static getMap(key: string): Map<any, any> | undefined {
    const subsData = this.map.get(key);
    return subsData ? _.cloneDeep(subsData.map) : undefined;
  }

  static unsubscribeMap(key: string, id: string): boolean {
    const subsData = this.map.get(key);
    return subsData ? subsData.subscriptions.delete(id) : false;
  }

  static deleteMapEntry(key: string, entryKey: string): boolean {
    const subsData: MapSubscriptionData | undefined = this.map.get(key);
    const prevData = subsData?.map.get(entryKey);
    const deleted = subsData?.map.delete(entryKey);
    if (deleted) {
      subsData?.subscriptions.forEach((eventSub: MapEventSubscription) => {
        const eventData: MapData = {
          key: entryKey,
          current: null,
          previous: prevData,
          map: _.cloneDeep(subsData.map),
        };
        eventSub.callback(eventData);
      });
    }

    return deleted === true;
  }

  static clearMap(subscriptionKey: string): boolean {
    const subsData = this.map.get(subscriptionKey);

    subsData?.subscriptions?.forEach((subsData: MapEventSubscription) => {
      const eventData: MapData = {
        key: null as any,
        current: null,
        previous: null,
        map: null,
      };
      subsData.callback(eventData);
    });
    return this.map.delete(subscriptionKey);
  }
}
