import { v4 as uuid } from 'uuid';
import * as _ from'lodash';
import { CustomSet } from './custom-set';

export interface SetData {
    added?: any,
    removed?: any,
    set: any[]
}

export type SetEventHandler = (data: SetData) => void;

export interface SetEventSubscription {
    subscriptionId: string,
    eventHandler: SetEventHandler
}

export interface SetSubscription {
    id: string;
    unsubscribeSet: () => void;
}

export type SetSubscriptionData = {
    set: CustomSet,
    subscriptions: Map<string, SetEventSubscription>
}

export const setSet = (mapKey: string, newData: any | any[])  => {
    SetManager.setSet(mapKey, newData);
}

export const subscribeSet = (key: string, newEventHandler: SetEventHandler, triggerNow = false): SetSubscription => {
    return SetManager.subscribe(key, newEventHandler, triggerNow);
}

export const getSet = (key: string): any[] | undefined => {
    return SetManager.getSet(key);
}

export const clearSet = (key: string) => {
    return SetManager.clearSet(key);
}

export const removeFromSet = (key: string, setItem: any | any[]) => {
    return SetManager.removeFromSet(key, setItem);
}

export class SetManager {

    private static map: Map<string, SetSubscriptionData> = new Map();    

    static setSet(setKey: string, newData: any | any[]) {
        if (setKey) {
            let subData = this.map.get(setKey);  
            let dataAdded: any[] = [];
            if (subData) {
                dataAdded = subData.set.add(newData);
            } else {
                subData = {
                    set: new CustomSet(newData),
                    subscriptions: new Map()
                };
                this.map.set(setKey, subData);
            }

            if (dataAdded.length > 0) {
                subData.subscriptions.forEach((eventSub: SetEventSubscription) => {
                    if (eventSub) {
                        if (subData) {
                            const eventData: SetData = {
                                removed: null,
                                added:  dataAdded,
                                set: _.cloneDeep(subData.set.list)
                            }
                            eventSub.eventHandler(eventData);
                        }
                    }
                });
            }            
        }
    }

    static removeFromSet(key: string, delData: any | any[]) {
        const subsData = this.map.get(key);
        if (subsData?.set) {
            let toDelete = subsData.set.remove(delData);
            if (toDelete.length > 0) {
                subsData.subscriptions.forEach((eventSub: SetEventSubscription) => {
                    if (eventSub) {
                        if (subsData) {
                            const eventData: SetData = {
                                removed: Array.isArray(toDelete) ? toDelete : [toDelete],
                                added:  null,
                                set: _.cloneDeep(subsData.set.list)
                            }
                            eventSub.eventHandler(eventData);
                        }
                    }
                });
            }
        }
    }

    static subscribe(key: string, newEventHandler: SetEventHandler, triggerNow = false): SetSubscription {
        const id = uuid();
        if (key && newEventHandler) {
            const subscriptionData = this.map.get(key);
            if (subscriptionData) {
                subscriptionData.subscriptions.set(id, { subscriptionId: id, eventHandler: newEventHandler });

                if (triggerNow) {
                    if (subscriptionData.set) {
                        const eventData: SetData = {
                            removed: undefined,
                            added:  undefined,
                            set: _.cloneDeep(subscriptionData.set.list)
                        }
                        newEventHandler(eventData);
                    }
                }
            } else {
                const subsData: SetSubscriptionData = {
                    set: new CustomSet(),
                    subscriptions: new Map().set(id, {subscriptionId: id, eventHandler: newEventHandler})
                };
                this.map.set(key, subsData);
            }
        }

        return { id, unsubscribeSet: () => this.unsubscribeSet(key, id) };
    }

    static getSet(key: string): any[] | undefined {
        const subsData = this.map.get(key);
        return subsData ? _.cloneDeep(subsData.set.list): undefined;
    }

    static unsubscribeSet(key: string, id: string): boolean {
        const subsData = this.map.get(key);
        return subsData ? subsData.subscriptions.delete(id) : false;
    }

    static clearSet(key: string) {
        return this.map.delete(key);
    }
}