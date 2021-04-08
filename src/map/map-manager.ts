import { v4 as uuid } from 'uuid';
import * as _ from 'lodash';

export interface MapData {
  mapKey: string | null;
  current: any | null;
  previous: any | null;
  map: Map<any, any> | null;
  subscriptionKey: string;
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

export const setMap = (subscriptionKey: string, mapKey: string, newData: any) => {
  MapManager.setMap(subscriptionKey, mapKey, newData);
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

export const deleteMapEntry = (subscriptionKey: string, mapKey: string): boolean => {
  return MapManager.deleteMapEntry(subscriptionKey, mapKey);
};

class MapManager {
  private static map: Map<string, MapSubscriptionData> = new Map();

  static setMap(subscriptionKey: string, mapKey: string, newData: any) {
    if (subscriptionKey && mapKey) {
      let subData = this.map.get(subscriptionKey);
      const newDataClone = _.cloneDeep(newData);
      let prevData: any;
      if (subData) {
        if (!_.isEqual(subData.map.get(mapKey), newData)) {
          prevData = subData.map.get(mapKey);
          subData.map.set(mapKey, newDataClone);
        } else {
          return;
        }
      } else {
        subData = {
          map: new Map().set(mapKey, newData),
          subscriptions: new Map(),
        };
        this.map.set(subscriptionKey, subData);
      }

      subData.subscriptions.forEach((eventSub: MapEventSubscription) => {
        if (eventSub) {
          if (subData) {
            const eventData: MapData = {
              mapKey: mapKey,
              current: newDataClone,
              previous: _.cloneDeep(prevData),
              map: _.cloneDeep(subData.map),
              subscriptionKey,
            };
            eventSub.callback(eventData);
          }
        }
      });
    } else {
      throw new Error('Invalid subscription key or map key.');
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
          mapKey: null,
          current: null,
          previous: null,
          map: subData ? _.cloneDeep(subData.map) : null,
          subscriptionKey,
        };
        eventSub.callback(eventData);
      });
    } else {
      throw new Error('Invalid subscription key or data.');
    }
  }

  static subscribeMap(subscriptionKey: string, callback: MapEventHandler, triggerNow = false): MapSubscription {
    const id = uuid();
    if (subscriptionKey && callback) {
      const subscriptionData = this.map.get(subscriptionKey);
      if (subscriptionData) {
        subscriptionData.subscriptions.set(id, { subscriptionId: id, callback });

        if (triggerNow) {
          if (subscriptionData.map) {
            const eventData: MapData = {
              mapKey: null,
              current: null,
              previous: null,
              map: _.cloneDeep(subscriptionData.map),
              subscriptionKey,
            };
            callback(eventData);
          }
        }
      } else {
        const subsData: MapSubscriptionData = {
          map: new Map(),
          subscriptions: new Map(),
        };
        subsData.subscriptions.set(id, { subscriptionId: id, callback });
        this.map.set(subscriptionKey, subsData);
      }
    } else {
      throw new Error('Invalid subscription key or callback.');
    }

    return { id, unsubscribeMap: () => this.unsubscribeMap(subscriptionKey, id) };
  }

  static getMap(subscriptionKey: string): Map<any, any> | undefined {
    const subsData = this.map.get(subscriptionKey);
    return subsData ? _.cloneDeep(subsData.map) : undefined;
  }

  static unsubscribeMap(subscriptionKey: string, subscriptionId: string): boolean {
    const subsData = this.map.get(subscriptionKey);
    return subsData ? subsData.subscriptions.delete(subscriptionId) : false;
  }

  static deleteMapEntry(subscriptionKey: string, mapKey: string): boolean {
    if (subscriptionKey && mapKey) {
      const subsData: MapSubscriptionData | undefined = this.map.get(subscriptionKey);
      const prevData = subsData?.map.get(mapKey);
      const deleted = subsData?.map.delete(mapKey);
      if (deleted) {
        subsData?.subscriptions.forEach((eventSub: MapEventSubscription) => {
          const eventData: MapData = {
            mapKey: mapKey,
            current: null,
            previous: prevData,
            map: _.cloneDeep(subsData.map),
            subscriptionKey,
          };
          eventSub.callback(eventData);
        });
      }

      return deleted === true;
    } else {
      throw new Error('Invalid subscription key or map key.');
    }
  }

  static clearMap(subscriptionKey: string): boolean {
    const subsData = this.map.get(subscriptionKey);

    subsData?.subscriptions?.forEach((eventSub: MapEventSubscription) => {
      const eventData: MapData = {
        mapKey: null as any,
        current: null,
        previous: null,
        map: null,
        subscriptionKey,
      };
      eventSub.callback(eventData);
    });
    return this.map.delete(subscriptionKey);
  }
}
