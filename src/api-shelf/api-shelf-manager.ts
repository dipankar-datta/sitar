import { v4 as uuid } from 'uuid';
import * as _ from 'lodash';
import {
    ShelfEventSubscription,
    ShelfEventHandler,
    ShelfData
} from '../shelf/shelf-manager';

export type ApiSubscriptionData = {
    data: ShelfData,
    url: string,
    headers: any,
    subscriptions: Map<string, ShelfEventSubscription>
}

export interface ApiShelfSubscription {
    id: string;
    unsubscribeApiShelf: () => void;
}

export const setApiShelf = async (subscriptionKey: string, url: string, headers?: { [key: string]: string })  => {
    ApiStoreManager.setApiShelf(subscriptionKey, url, headers);
}

export const subscribeApiShelf = (subscriptionKey: string, callback: ShelfEventHandler, triggerNow = false): ApiShelfSubscription => {
    return ApiStoreManager.subscribeApiShelf(subscriptionKey, callback, triggerNow);
}

export default class ApiStoreManager {

    private static apiShelf: Map<string, ApiSubscriptionData> = new Map();

    static setApiShelf(subscriptionKey: string, url: string, headers?: { [key: string]: string }) {        
        this.loadApiData(subscriptionKey, url, headers);
    }

    private static loadApiData(storageKey: string, url: string, headers?: { [Objkey: string]: string }) {
        if (storageKey && url) {
            fetch(url, { method: 'GET', headers })
                .then((response: Response) => {
                    response
                        .json()
                        .then((data: any) => {
                            let shelf = this.apiShelf.get(storageKey);
                            if (shelf) {
                                shelf.data.previous = _.cloneDeep(shelf.data.current);
                                shelf.data.current = data;
                                if (!shelf.url) {
                                    shelf.url = url;
                                }                                
                            } else {
                                shelf = {
                                    data: {
                                        key: storageKey, 
                                        current: data,
                                        previous: null
                                    },
                                    headers,
                                    url,
                                    subscriptions: new Map()
                                };
                                this.apiShelf.set(storageKey, shelf);
                            }

                            shelf.subscriptions.forEach((eventSub: ShelfEventSubscription, key: string) => {
                                if (eventSub) {
                                    if (shelf) {
                                        eventSub.callback(shelf.data);
                                    }
                                }
                            });
                        });
                });
        }
    }

    static subscribeApiShelf(subscriptionKey: string, callback: ShelfEventHandler, triggerNow = false): ApiShelfSubscription {
        const id = uuid();
        if (subscriptionKey && callback) {
            const subscriptionData = this.apiShelf.get(subscriptionKey);
            if (subscriptionData) {
                subscriptionData.subscriptions.set(id, { subscriptionId: id, callback });

                if (triggerNow) {
                    if (subscriptionData.data) {
                        callback(_.cloneDeep(subscriptionData.data));
                    }
                }
            } else {
                const subsData: ApiSubscriptionData = {
                    data: {current: null, previous: null, key: subscriptionKey},
                    url: '',
                    headers: {},
                    subscriptions: new Map().set(id, {subscriptionId: id, callback})
                }
                this.apiShelf.set(subscriptionKey, subsData);
            }
        }

        return { id, unsubscribeApiShelf: () => this.unsubscribeApiShelf(subscriptionKey, id) };
    }

    static getApiShelfData(subscriptionKey: string): any {
        const subsData = this.apiShelf.get(subscriptionKey);
        return subsData ? _.cloneDeep(subsData.data) : null;
    }

    static unsubscribeApiShelf(subscriptionKey: string, id: string): boolean {
        const subsData = this.apiShelf.get(subscriptionKey);
        return subsData ? subsData.subscriptions.delete(id) : false;
    }
}