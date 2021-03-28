import { v4 as uuid } from 'uuid';
import * as _ from'lodash';

export interface MapData {
    key?: string,
    current?: any,
    previous?: any,
    map: Map<any, any>    
}

export type MapEventHandler = (data: MapData) => void;

export interface MapEventSubscription {
    subscriptionId: string,
    eventHandler: MapEventHandler
}

export interface MapSubscription {
    id: string;
    unsubscribeMap: () => void;
}

export type MapSubscriptionData = {
    map: Map<any, any>,
    subscriptions: Map<string, MapEventSubscription>
}

export const setMap = (mapKey: string, objKey: any, newData: any)  => {
    MapManager.setMap(mapKey, objKey, newData);
}

export const subscribeMap = (key: string, newEventHandler: MapEventHandler, triggerNow = false): MapSubscription => {
    return MapManager.subscribe(key, newEventHandler, triggerNow);
}

export const getMap = (key: string): Map<any,any> | undefined => {
    return MapManager.getMap(key);
}

export const clearMap = (key: string) => {
    return MapManager.clearMap(key);
}

export const deleteMapEntry = (key: string, entryKey: string) => {
    return MapManager.deleteMapEntry(key, entryKey);
}

class MapManager {

    private static map: Map<string, MapSubscriptionData> = new Map();    

    static setMap(mapKey: string, objKey: any, newData: any) {
        if (mapKey) {
            let subData = this.map.get(mapKey);
            const newDataClone = _.cloneDeep(newData);
            let prevData: any = undefined;
            if (subData) {
                prevData = subData.map.get(objKey);
                subData.map.set(objKey, newDataClone);
            } else {
                subData = {
                    map: new Map().set(objKey, newData),
                    subscriptions: new Map()
                };
                this.map.set(mapKey, subData);
            }

            subData.subscriptions.forEach((eventSub: MapEventSubscription) => {
                if (eventSub) {
                    if (subData) {
                        const eventData: MapData = {
                            key: objKey,
                            current: newDataClone,
                            previous:  _.cloneDeep(prevData),
                            map: _.cloneDeep(subData.map)
                        }
                        eventSub.eventHandler(eventData);
                    }
                }
            });
        }
    }

    static subscribe(key: string, newEventHandler: MapEventHandler, triggerNow = false): MapSubscription {
        const id = uuid();
        if (key && newEventHandler) {
            const subscriptionData = this.map.get(key);
            if (subscriptionData) {
                subscriptionData.subscriptions.set(id, { subscriptionId: id, eventHandler: newEventHandler });

                if (triggerNow) {
                    if (subscriptionData.map) {
                        const eventData: MapData = {
                            key: undefined,
                            current: undefined,
                            previous:  undefined,
                            map: _.cloneDeep(subscriptionData.map)
                        }
                        newEventHandler(eventData);
                    }
                }
            } else {
                const subsData: MapSubscriptionData = {
                    map: new Map(),
                    subscriptions: new Map()
                };
                subsData.subscriptions.set(id, {subscriptionId: id, eventHandler: newEventHandler});
                this.map.set(key, subsData);
            }
        }

        return { id, unsubscribeMap: () => this.unsubscribeMap(key, id) };
    }

    static getMap(key: string): Map<any,any> | undefined {
        const subsData = this.map.get(key);
        return subsData ? _.cloneDeep(subsData.map): undefined;
    }

    static unsubscribeMap(key: string, id: string): boolean {
        const subsData = this.map.get(key);
        return subsData ? subsData.subscriptions.delete(id) : false;
    }

    static deleteMapEntry(key: string, entryKey: string) {
        const subsData: MapSubscriptionData | undefined = this.map.get(key);    
        const prevData = subsData?.map.get(entryKey);
        const deleted = subsData?.map.delete(entryKey);    
        if (deleted) {
            subsData?.subscriptions.forEach((eventSub: MapEventSubscription) => {
                if (eventSub) {
                        const eventData: MapData = {
                            key: entryKey,
                            current: null,
                            previous:  prevData,
                            map: _.cloneDeep(subsData.map)
                        }
                        eventSub.eventHandler(eventData);
                    }
                }
            );
        }
        
        return deleted === true;
    }

    static clearMap(key: string) {
        return this.map.delete(key);
    }
}