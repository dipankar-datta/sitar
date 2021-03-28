import { v4 as uuid } from 'uuid';
import * as _ from'lodash';

export interface ShelfData {
    key: string,
    current: any,
    previous: any
}

export type EventHandler = (data: ShelfData) => void;

export interface EventSubscription {
    subscriptionId: string,
    eventHandler: EventHandler
}

export interface Subscription {
    id: string;
    unsubscribe: () => void;
}

export type SubscriptionData = {
    data: ShelfData,
    subscriptions: Map<string, EventSubscription>
}

export const setShelf = (key: string, newData: any) => {
    ShelfManager.setShelf(key, newData);
}

export const subscribe = (key: string, newEventHandler: EventHandler, triggerNow = false): Subscription => {
    return ShelfManager.subscribe(key, newEventHandler, triggerNow);
}

export const getData = (key: string): any => {
    return ShelfManager.getData(key);
}

class ShelfManager {

    private static shelf: Map<string, SubscriptionData> = new Map();

    static setShelf(key: string, newData: any) {
        if (key) {
            let shelf = this.shelf.get(key);
            const newDataClone = _.cloneDeep(newData);
            if (shelf) {
                shelf.data.previous = _.cloneDeep(shelf.data.current);
                shelf.data.current = newDataClone;
            } else {
                shelf = {
                    data: {
                        key, current: newDataClone,
                        previous: null
                    },
                    subscriptions: new Map()
                };
                this.shelf.set(key, shelf);
            }            

            shelf.subscriptions.forEach((eventSub: EventSubscription) => {
                if (eventSub) {
                    if (shelf) {
                        eventSub.eventHandler(shelf.data);
                    }
                }
            });
        }
    }

    static subscribe(key: string, newEventHandler: EventHandler, triggerNow = false): Subscription {
        const id = uuid();
        if (key && newEventHandler) {
            const subscriptionData = this.shelf.get(key);
            if (subscriptionData) {
                subscriptionData.subscriptions.set(id, { subscriptionId: id, eventHandler: newEventHandler });

                if (triggerNow) {
                    if (subscriptionData.data) {
                        newEventHandler(_.cloneDeep(subscriptionData.data));
                    }
                }
            } else {
                const subsData: SubscriptionData = {
                    data: {
                        key, current: null,
                        previous: null
                    },
                    subscriptions: new Map()
                };
                subsData.subscriptions.set(id, {subscriptionId: id, eventHandler: newEventHandler});
                this.shelf.set(key, subsData);
            }
        }

        return { id, unsubscribe: () => this.unsubscribe(key, id) };
    }

    static getData(key: string): any {
        const subsData = this.shelf.get(key);
        return subsData ?  _.cloneDeep(subsData.data) : null;
    }

    static unsubscribe(key: string, id: string): boolean {
        const subsData = this.shelf.get(key);
        return subsData ? subsData.subscriptions.delete(id) : false;
    }
}