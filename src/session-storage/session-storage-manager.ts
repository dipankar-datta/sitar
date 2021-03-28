import { v4 as uuid } from 'uuid';
import * as _ from'lodash';
import { handleJsonParse, handleJsonStringify } from '../util/util';

export interface SessionStorageData {
    key: string,
    current: any,
    previous: any
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

export const setSessionStorage = (key: string, newData: any) => {
    SessionStorageManager.setSessionStorage(key, newData);
}

export const subscribeSessionStorage = (key: string, newEventHandler: SessionStorageEventHandler, triggerNow = false): SessionStorageSubscription => {
    return SessionStorageManager.subscribeSessionStorage(key, newEventHandler, triggerNow);
}

export const getSessionStorageData = (key: string): any => {
    return SessionStorageManager.getSessionStorageData(key);
}

export const deleteSessionStorage = (key: string): boolean => {
    return SessionStorageManager.deleteSessionStorage(key);
}

class SessionStorageManager {

    private static map: Map<string, SessionStorageSubscriptionData> = new Map();

    static setSessionStorage(key: string, newData: any) {
        if (key) {
            let subsData = this.map.get(key);
            const newDataString = handleJsonStringify(newData);
            let dataAdded: any;
            const prevData = sessionStorage.getItem(key); 
            if (subsData) {                
                if (!_.isEqual(prevData, newDataString)) {
                    sessionStorage.setItem(key, newDataString ? newDataString : '');
                    dataAdded = newData;
                }
            } else {
               this.map.set(key, {subscriptions: new Map()});
            }        
            
            if (dataAdded) {
                subsData?.subscriptions.forEach((eventSub: SessionStorageEventSubscription) => {
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

    static subscribeSessionStorage(key: string, newEventHandler: SessionStorageEventHandler, triggerNow = false): SessionStorageSubscription {
        const id = uuid();
        if (key && newEventHandler) {
            const subscriptionData = this.map.get(key);
            if (subscriptionData) {
                subscriptionData.subscriptions.set(id, { subscriptionId: id, eventHandler: newEventHandler });

                if (triggerNow) {
                    const sessionData = sessionStorage.getItem(key);
                    if (sessionData) {
                        newEventHandler(_.cloneDeep(handleJsonParse(sessionData)));
                    }
                }
            } else {
                const subsData: SessionStorageSubscriptionData = {                    
                    subscriptions: new Map()
                };
                subsData.subscriptions.set(id, {subscriptionId: id, eventHandler: newEventHandler});
                this.map.set(key, subsData);
            }
        }

        return { id, unsubscribeSessionStorage: () => this.unsubscribeSessionStorage(key, id) };
    }

    static deleteSessionStorage(key: string): boolean {
        const currentData = sessionStorage.getItem(key);
        sessionStorage.removeItem(key);
        const deleted = sessionStorage.getItem(key) === null && currentData !== null;
        
        if (deleted) {
            const subscriptionData = this.map.get(key);
            subscriptionData?.subscriptions.forEach((value: SessionStorageEventSubscription, key: string) => {
                value.eventHandler({
                    current: null,
                    previous: handleJsonParse(currentData),
                    key
                });
            });
            this.map.delete(key);
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