import { v4 as uuid } from 'uuid';
import * as _ from'lodash';

export interface ShelfData {
    key: string,
    current: any,
    previous: any
}

export type ShelfEventHandler = (data: ShelfData) => void;

export interface ShelfEventSubscription {
    subscriptionId: string,
    eventHandler: ShelfEventHandler
}

export interface ShelfSubscription {
    id: string;
    unsubscribeShelf: () => void;
}

export type ShelfSubscriptionData = {
    data: ShelfData,
    subscriptions: Map<string, ShelfEventSubscription>
}

export const setShelf = (key: string, newData: any) => {
    ShelfManager.setShelf(key, newData);
}

export const subscribeShelf = (key: string, newEventHandler: ShelfEventHandler, triggerNow = false): ShelfSubscription => {
    return ShelfManager.subscribeShelf(key, newEventHandler, triggerNow);
}

export const getShelfData = (key: string): any => {
    return ShelfManager.getShelfData(key);
}

class ShelfManager {

    private static shelf: Map<string, ShelfSubscriptionData> = new Map();

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

            shelf.subscriptions.forEach((eventSub: ShelfEventSubscription) => {
                if (eventSub) {
                    if (shelf) {
                        eventSub.eventHandler(shelf.data);
                    }
                }
            });
        }
    }

    static subscribeShelf(key: string, newEventHandler: ShelfEventHandler, triggerNow = false): ShelfSubscription {
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
                const subsData: ShelfSubscriptionData = {
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

        return { id, unsubscribeShelf: () => this.unsubscribeShelf(key, id) };
    }

    static getShelfData(key: string): any {
        const subsData = this.shelf.get(key);
        return subsData ?  _.cloneDeep(subsData.data) : null;
    }

    static unsubscribeShelf(key: string, id: string): boolean {
        const subsData = this.shelf.get(key);
        return subsData ? subsData.subscriptions.delete(id) : false;
    }
}