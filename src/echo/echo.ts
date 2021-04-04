import { v4 as uuid } from 'uuid';
import * as _ from 'lodash';

export type EchoEventHandler = (data: any) => void;

export interface EchoEventSubscription {
  subscriptionId: string;
  callback: EchoEventHandler;
}

export interface EchoSubscription {
  id: string;
  unsubscribeEcho: () => void;
}

export type EchoSubscriptionData = {
  subscriptions: Map<string, EchoEventSubscription>;
};

export const echo = (subscriptionKey: string, data?: any) => {
  Echo.echo(subscriptionKey, data);
};

export const subscribeEcho = (subscriptionKey: string, callback: EchoEventHandler): EchoSubscription => {
  return Echo.subscribeEcho(subscriptionKey, callback);
};

class Echo {
  private static map: Map<string, EchoSubscriptionData> = new Map();

  static echo(subscriptionKey: string, data?: any) {
    if (subscriptionKey) {
      const subsData = this.map.get(subscriptionKey);
      subsData?.subscriptions.forEach((eventSub: EchoEventSubscription) => {
        eventSub.callback(data);
      });
    }
  }

  static subscribeEcho(subscriptionKey: string, callback: EchoEventHandler): EchoSubscription {
    const id = uuid();
    if (subscriptionKey && callback) {
      const subscriptionData = this.map.get(subscriptionKey);
      if (subscriptionData) {
        subscriptionData.subscriptions.set(id, { subscriptionId: id, callback });
      } else {
        const subsData: EchoSubscriptionData = {
          subscriptions: new Map(),
        };
        subsData.subscriptions.set(id, { subscriptionId: id, callback });
        this.map.set(subscriptionKey, subsData);
      }
    } else {
      throw new Error('Invalid subscription key or callback.');
    }

    return { id, unsubscribeEcho: () => this.unsubscribeEcho(subscriptionKey, id) };
  }

  static unsubscribeEcho(subscriptionKey: string, id: string): boolean {
    const subsData = this.map.get(subscriptionKey);
    return subsData ? subsData.subscriptions.delete(id) : false;
  }
}
