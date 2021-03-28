import { v4 as uuid } from 'uuid';
import * as _ from'lodash';
import { handleJsonParse } from '../util/util';

export interface LocalStorageData {
    key: string,
    current: any,
    previous: any
}

export type LocalStorageEventHandler = (data: LocalStorageData) => void;

export interface LocalStorageEventSubscription {
    subscriptionId: string,
    eventHandler: LocalStorageEventHandler
}

export interface LocalStorageSubscription {
    id: string;
    unsubscribeLocalStorage: () => void;
}

export type LocalStorageSubscriptionData = {
    subscriptions: Map<string, LocalStorageEventSubscription>
}

export const setLocalStorage = (key: string, newData: any) => {
    LocalStorageManager.setLocalStorage(key, newData);
}

export const subscribeLocalStorage = (key: string, newEventHandler: LocalStorageEventHandler, triggerNow = false): LocalStorageSubscription => {
    return LocalStorageManager.subscribeLocalStorage(key, newEventHandler, triggerNow);
}

export const getLocalStorageData = (key: string): any => {
    return LocalStorageManager.getLocalStorageData(key);
}

export const deleteLocalStorage = (key: string): boolean => {
    return LocalStorageManager.deleteLocalStorage(key);
}

class LocalStorageManager {

    private static map: Map<string, LocalStorageSubscriptionData> = new Map();

    static setLocalStorage(key: string, newData: any) {
        if (key) {
            let subsData = this.map.get(key);
            const newDataString = newData ? ((typeof newData === 'string') ? newData : JSON.stringify(newData)) : undefined;
            let dataAdded: any;
            const prevData = localStorage.getItem(key); 
            if (subsData) {                
                if (!_.isEqual(prevData, newDataString)) {
                    localStorage.setItem(key, newDataString ? newDataString : '');
                    dataAdded = newData;
                }
            } else {
               this.map.set(key, {subscriptions: new Map()});
            }        
            
            if (dataAdded) {
                subsData?.subscriptions.forEach((eventSub: LocalStorageEventSubscription) => {
                    if (eventSub) {
                        if (subsData) {
                            eventSub.eventHandler({
                                key,
                                current: handleJsonParse(newData),
                                previous: prevData ? handleJsonParse(prevData) : null
                            });
                        }
                    }
                });
            }
        }
    }

    static subscribeLocalStorage(key: string, newEventHandler: LocalStorageEventHandler, triggerNow = false): LocalStorageSubscription {
        const id = uuid();
        if (key && newEventHandler) {
            const subscriptionData = this.map.get(key);
            if (subscriptionData) {
                subscriptionData.subscriptions.set(id, { subscriptionId: id, eventHandler: newEventHandler });

                if (triggerNow) {
                    const localData = localStorage.getItem(key);
                    if (localData) {
                        newEventHandler(_.cloneDeep(handleJsonParse(localData)));
                    }
                }
            } else {
                const subsData: LocalStorageSubscriptionData = {                    
                    subscriptions: new Map()
                };
                subsData.subscriptions.set(id, {subscriptionId: id, eventHandler: newEventHandler});
                this.map.set(key, subsData);
            }
        }

        return { id, unsubscribeLocalStorage: () => this.unsubscribeLocalStorage(key, id) };
    }

    static deleteLocalStorage(key: string): boolean {
        const data = localStorage.getItem(key);
        localStorage.removeItem(key);
        const deleted = localStorage.getItem(key) === null && data !== null;
        
        if (deleted) {
            const subscriptionData = this.map.get(key);
            subscriptionData?.subscriptions.forEach((value: LocalStorageEventSubscription, key: string) => {
                value.eventHandler({
                    current: null,
                    previous: handleJsonParse(data),
                    key
                });
            });
            this.map.delete(key);
        }
        
        return deleted;
    }

    static getLocalStorageData(key: string): any {
        const localData = localStorage.getItem(key);
        return localData ?  handleJsonParse(localData) : null;
    }

    static unsubscribeLocalStorage(key: string, id: string): boolean {
        const subsData = this.map.get(key);
        return subsData ? subsData.subscriptions.delete(id) : false;
    }


}