import { v4 as uuid } from 'uuid';
import * as _ from'lodash';

export type InvokerEventHandler = (data: any) => void;

export interface InvokerEventSubscription {
    subscriptionId: string,
    eventHandler: InvokerEventHandler
}

export interface InvokerSubscription {
    id: string;
    unsubscribeInvoker: () => void;
}

export type InvokerSubscriptionData = {
    subscriptions: Map<string, InvokerEventSubscription>
}

export const invoke = (key: string, newData?: any) => {
    Invoker.invoke(key, newData);
}

export const subscribeInvoker = (key: string, newEventHandler: InvokerEventHandler): InvokerSubscription => {
    return Invoker.subscribeInvoker(key, newEventHandler);
}

class Invoker {

    private static map: Map<string, InvokerSubscriptionData> = new Map();

    static invoke(key: string, newData?: any) {
        if (key) {
            let subsData = this.map.get(key);
            subsData?.subscriptions.forEach((eventSub: InvokerEventSubscription) => {               
                eventSub?.eventHandler(newData);               
            });
        }
    }

    static subscribeInvoker(key: string, newEventHandler: InvokerEventHandler): InvokerSubscription {
        const id = uuid();
        if (key && newEventHandler) {
            const subscriptionData = this.map.get(key);
            if (subscriptionData) {
                subscriptionData.subscriptions.set(id, { subscriptionId: id, eventHandler: newEventHandler });
            } else {
                const subsData: InvokerSubscriptionData = {                    
                    subscriptions: new Map()
                };
                subsData.subscriptions.set(id, {subscriptionId: id, eventHandler: newEventHandler});
                this.map.set(key, subsData);
            }
        }

        return { id, unsubscribeInvoker: () => this.unsubscribeInvoker(key, id) };
    }

    static unsubscribeInvoker(key: string, id: string): boolean {
        const subsData = this.map.get(key);
        return subsData ? subsData.subscriptions.delete(id) : false;
    }
}