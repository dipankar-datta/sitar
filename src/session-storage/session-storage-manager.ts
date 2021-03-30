import { v4 as uuid } from 'uuid';
import * as _ from'lodash';
import { handleJsonParse, handleJsonStringify } from '../util/util';

export interface SessionStorageData {
    subscriptionKey: string,
    data: any
}

export type SessionStorageEventHandler = (data: SessionStorageData) => void;

export interface SessionStorageEventSubscription {
    subscriptionId: string,
    eventHandler: SessionStorageEventHandler
}

export interface SessionStorageSubscription {
    id: string;
    unsubscribeSessionStorage: () => void;
}

export type SessionStorageSubscriptionData = {
    subscriptions: Map<string, SessionStorageEventSubscription>
}

export const setSessionStorage = (subscriptionKey: string, newData: any) => {
    SessionStorageManager.setSessionStorage(subscriptionKey, newData);
}

export const subscribeSessionStorage = (subscriptionKey: string, callback: SessionStorageEventHandler, triggerNow = false): SessionStorageSubscription => {
    return SessionStorageManager.subscribeSessionStorage(subscriptionKey, callback, triggerNow);
}

export const getSessionStorageData = (subscriptionKey: string): any => {
    return SessionStorageManager.getSessionStorageData(subscriptionKey);
}

export const deleteSessionStorage = (subscriptionKey: string): boolean => {
    return SessionStorageManager.deleteSessionStorage(subscriptionKey);
}

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
                    dataAdded = data;
                }
            } else {
               this.map.set(subscriptionKey, {subscriptions: new Map()});
            }        
            
            if (dataAdded) {
                subsData?.subscriptions.forEach((eventSub: SessionStorageEventSubscription) => {
                    if (eventSub) {
                        if (subsData) {
                            eventSub.eventHandler({
                                subscriptionKey: subscriptionKey,
                                data: prevData ? handleJsonParse(prevData) : prevData
                            });
                        }
                    }
                });
            }
        }
    }

    static subscribeSessionStorage(subscriptionKey: string, callback: SessionStorageEventHandler, triggerNow = false): SessionStorageSubscription {
        const id = uuid();
        if (subscriptionKey && callback) {
            const subscriptionData = this.map.get(subscriptionKey);
            if (subscriptionData) {
                subscriptionData.subscriptions.set(id, { subscriptionId: id, eventHandler: callback });

                if (triggerNow) {
                    const sessionData = sessionStorage.getItem(subscriptionKey);
                    
                    callback({
                        subscriptionKey, 
                        data: sessionData ? _.cloneDeep(handleJsonParse(sessionData)) : sessionData
                    });
                    
                }
            } else {
                const subsData: SessionStorageSubscriptionData = {                    
                    subscriptions: new Map()
                };
                subsData.subscriptions.set(id, {subscriptionId: id, eventHandler: callback});
                this.map.set(subscriptionKey, subsData);
            }
        }

        return { id, unsubscribeSessionStorage: () => this.unsubscribeSessionStorage(subscriptionKey, id) };
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
                    data: null                    
                });
            });
            this.map.delete(subscriptionKey);
        }
        
        return deleted;
    }

    static getSessionStorageData(key: string): any {
        const sessionData = sessionStorage.getItem(key);
        return sessionData ?  handleJsonParse(sessionData) : null;
    }

    static unsubscribeSessionStorage(key: string, id: string): boolean {
        const subsData = this.map.get(key);
        return subsData ? subsData.subscriptions.delete(id) : false;
    }


}