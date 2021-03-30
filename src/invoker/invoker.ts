import { v4 as uuid } from 'uuid';
import * as _ from'lodash';

export type InvokerEventHandler = (data: any) => void;

export interface InvokerEventSubscription {
    subscriptionId: string,
    callback: InvokerEventHandler
}

export interface InvokerSubscription {
    id: string;
    unsubscribeInvoker: () => void;
}

export type InvokerSubscriptionData = {
    subscriptions: Map<string, InvokerEventSubscription>
}

export const invoke = (subscriptionKey: string, data?: any) => {
    Invoker.invoke(subscriptionKey, data);
}

export const subscribeInvoker = (subscriptionKey: string, callback: InvokerEventHandler): InvokerSubscription => {
    return Invoker.subscribeInvoker(subscriptionKey, callback);
}

class Invoker {

    private static map: Map<string, InvokerSubscriptionData> = new Map();

    static invoke(subscriptionKey: string, data?: any) {
        if (subscriptionKey) {
            const subsData = this.map.get(subscriptionKey);
            subsData?.subscriptions.forEach((eventSub: InvokerEventSubscription) => {               
                eventSub.callback(data);               
            });
        }
    }

    static subscribeInvoker(subscriptionKey: string, callback: InvokerEventHandler): InvokerSubscription {
        const id = uuid();
        if (subscriptionKey && callback) {
            const subscriptionData = this.map.get(subscriptionKey);
            if (subscriptionData) {
                subscriptionData.subscriptions.set(id, { subscriptionId: id, callback });
            } else {
                const subsData: InvokerSubscriptionData = {                    
                    subscriptions: new Map()
                };
                subsData.subscriptions.set(id, {subscriptionId: id, callback});
                this.map.set(subscriptionKey, subsData);
            }
        }

        return { id, unsubscribeInvoker: () => this.unsubscribeInvoker(subscriptionKey, id) };
    }

    static unsubscribeInvoker(subscriptionKey: string, id: string): boolean {
        const subsData = this.map.get(subscriptionKey);
        return subsData ? subsData.subscriptions.delete(id) : false;
    }
}