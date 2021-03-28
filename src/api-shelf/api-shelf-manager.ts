import { v4 as uuid } from 'uuid';
import * as _ from 'lodash';
import {
    EventSubscription,
    EventHandler,
    ShelfData
} from '../shelf/shelf-manager';

export type ApiSubscriptionData = {
    data: ShelfData,
    url: string,
    headers: any,
    subscriptions: Map<string, EventSubscription>
}

export interface ApiShelfSubscription {
    id: string;
    unsubscribeApiShelf: () => void;
}

export const setApiShelf = async (key: string, url: string, headers?: { [key: string]: string })  => {
    ApiStoreManager.setApiShelf(key, url, headers);
}

export const subscribeApiShelf = (key: string, newEventHandler: EventHandler, triggerNow = false): ApiShelfSubscription => {
    return ApiStoreManager.subscribeApiShelf(key, newEventHandler, triggerNow);
}

export default class ApiStoreManager {

    private static apiShelf: Map<string, ApiSubscriptionData> = new Map();

    static setApiShelf(key: string, url: string, headers?: { [key: string]: string }) {        
        this.loadApiData(key, url, headers);
    }

    private static loadApiData(key: string, url: string, headers?: { [key: string]: string }) {
        if (key && url) {
            fetch(url, { method: 'GET', headers })
                .then((response: Response) => {
                    response
                        .json()
                        .then((data: any) => {
                            let shelf = this.apiShelf.get(key);
                            if (shelf) {
                                shelf.data.previous = _.cloneDeep(shelf.data.current);
                                shelf.data.current = data;
                                if (!shelf.url) {
                                    shelf.url = url;
                                }                                
                            } else {
                                shelf = {
                                    data: {
                                        key, 
                                        current: data,
                                        previous: null
                                    },
                                    headers,
                                    url,
                                    subscriptions: new Map()
                                };
                                this.apiShelf.set(key, shelf);
                            }

                            shelf.subscriptions.forEach((eventSub: EventSubscription, key: string) => {
                                if (eventSub) {
                                    if (shelf) {
                                        eventSub.eventHandler(shelf.data);
                                    }
                                }
                            });
                        });
                });
        }
    }

    static subscribeApiShelf(key: string, newEventHandler: EventHandler, triggerNow = false): ApiShelfSubscription {
        const id = uuid();
        if (key && newEventHandler) {
            const subscriptionData = this.apiShelf.get(key);
            if (subscriptionData) {
                subscriptionData.subscriptions.set(id, { subscriptionId: id, eventHandler: newEventHandler });

                if (triggerNow) {
                    if (subscriptionData.data) {
                        newEventHandler(_.cloneDeep(subscriptionData.data));
                    }
                }
            } else {
                const subsData: ApiSubscriptionData = {
                    data: {current: null, previous: null, key},
                    url: '',
                    headers: {},
                    subscriptions: new Map().set(id, {subscriptionId: id, eventHandler: newEventHandler})
                }
                this.apiShelf.set(key, subsData);
            }
        }

        return { id, unsubscribeApiShelf: () => this.unsubscribeApiShelf(key, id) };
    }

    static getApiShelfData(key: string): any {
        const subsData = this.apiShelf.get(key);
        return subsData ? _.cloneDeep(subsData.data) : null;
    }

    static unsubscribeApiShelf(key: string, id: string): boolean {
        const subsData = this.apiShelf.get(key);
        return subsData ? subsData.subscriptions.delete(id) : false;
    }
}