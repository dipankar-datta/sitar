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
    await ApiShelfManager.setApiShelf(subscriptionKey, url, headers);
}

export const getApiShelfData = (subscriptionKey: string): ShelfData | null => {
    return ApiShelfManager.getApiShelfData(subscriptionKey);
}


export const subscribeApiShelf = (subscriptionKey: string, callback: ShelfEventHandler, triggerNow = false): ApiShelfSubscription => {
    return ApiShelfManager.subscribeApiShelf(subscriptionKey, callback, triggerNow);
}

export const clearApiShelfData = (subscriptionKey: string) : boolean => {
    return ApiShelfManager.clearApiShelfData(subscriptionKey);
}

export default class ApiShelfManager {

    private static apiShelf: Map<string, ApiSubscriptionData> = new Map();

    static async setApiShelf(subscriptionKey: string, url: string, headers?: { [key: string]: string }) {        
        await this.loadApiData(subscriptionKey, url, headers);
    }

    private static async loadApiData(subscriptionKey: string, url: string, headers?: { [Objkey: string]: string }) {
        if (subscriptionKey && url) {
            await fetch(url, { method: 'GET', headers })
                .then((response: Response) => {
                    response
                        .json()
                        .then((data: any) => {
                            let shelf = this.apiShelf.get(subscriptionKey);
                            if (shelf) {
                                shelf.data.previous = _.cloneDeep(shelf.data.current);
                                shelf.data.current = data;
                                if (!shelf.url) {
                                    shelf.url = url;
                                }                                
                            } else {
                                shelf = {
                                    data: {
                                        key: subscriptionKey, 
                                        current: data,
                                        previous: null
                                    },
                                    headers,
                                    url,
                                    subscriptions: new Map()
                                };
                                this.apiShelf.set(subscriptionKey, shelf);
                            }

                            shelf.subscriptions.forEach((eventSub: ShelfEventSubscription, key: string) => {                               
                                if (shelf) {
                                    eventSub.callback(shelf.data);
                                }
                            });
                        });
                }).catch(err => {
                    throw new Error('Unsuccessful API call.');
                });;
        } else {
            throw new Error("Invalid subscription key or url.");
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
        } else {
            throw new Error("Invalid subscription key or callback.");
        }

        return { id, unsubscribeApiShelf: () => this.unsubscribeApiShelf(subscriptionKey, id) };
    }

    static getApiShelfData(subscriptionKey: string): ShelfData | null {
        const subsData = this.apiShelf.get(subscriptionKey);
        return subsData ? _.cloneDeep(subsData.data) : null;
    }

    static unsubscribeApiShelf(subscriptionKey: string, id: string): boolean {
        const subsData = this.apiShelf.get(subscriptionKey);
        return subsData ? subsData.subscriptions.delete(id) : false;
    }

    static clearApiShelfData(subscriptionKey: string): boolean {
        const subsData = this.apiShelf.get(subscriptionKey);
        return subsData ? this.apiShelf.delete(subscriptionKey) : false;
    }
}