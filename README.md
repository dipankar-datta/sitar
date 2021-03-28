# Sitar

**Introduction**

Sitar is a JavaScript library build using TypeScript and is compatible with both JavaScript and TypeScript.

Sitar attemps to simplify browser side storage management using events.

Currently Sitar provides following modules as part of it's implementation.

### 1. Shelf
### 2. API Shelf
### 3. Map
### 4. Set
### 5. Local Storage
### 6. Session Storage
### 7. Invoker  

<br/>
 
## 1. Shelf
Shelf stores an object or data in browser's memory. 
This data can be accessed across the application inside the browser window.
Storing or updating the data is done through a key mapping.
Different parts of the application can subscribe to changes in the data. 
On storing or updating the data, Shelf triggers events which intern triggers functions provided by it's subscriptions.
<br>
<br>
Currently following are the provided functions by Shelf.

### **1.1 setShelf(key: string, data: any)**
setShelf stores the data into browser memory. Please note that on reloading or refreshing the browser this data gets erased. Once this function is called, all the subscriptions for the specified key will be triggered. setShelf function takes two parameters.
#### **Params**
key: Name or unique identifier of the object. This can be any string name. This should be unique for the kind of object we store. This is a mandatory field <br>
data: This is the object we would like to store. This can be any kind of data. This is a mandatory field.

#### **Example**
```
import {setShelf} from 'sitar';

setShelf('DEMO_SHELF_KEY', {"alfa": 100, "beta": 200});
```

### **1.2 subscribeShelf(key: string, eventHandler: ShelfEventHandler, triggerNow?: boolean): ShelfSubscription**
#### **Params**
subscribeShelf subscribes changes for any object against a specific key. Basically this is a subscription for every time setShelf is called for the same key. This function take two mandatory and one optional parameters.
#### **Params**
>key: Name or unique identifier of the object. Key should be exactly the same for which object has been stored already or going to be stored.. This is a mandatory field <br>
>eventHandler: eventHandler is a callback function we need to provide when we subscribe to a specific key. This function gets called whenever setShelf(key, data) gets called from any where in the application for the same key. eventHandler is a mandatory field. eventHanler recieives an objected which has three information. <br>
>> current: This contains the latest version of the object.<br>
>> previous: This contains the previous version of the object.<br>
>> key: The key for which it was subscribed. <br>

>triggerNow: This is an optional boolean field. On passing this field as true, the provided eventHanler function will be triggered immediately with current data. This is helpful when it is understood that the target object or data is already available in the memory and it can be accessed immediately along with subscribing it. <br>

#### **Returns**
subscribeShelf return a ShelfSubscription object which contains a unique subscription id and an unsubscribeShelf function. This object can be stored as an instance variable which is used to unsubscribe the subscription. We need to call unsubscribeShelf() function of the ShelfSubscription object.

#### **Example**
```
import {subscribeShelf} from 'sitar';

const shelfSubscription = subscribeShelf('DEMO_SHELF_KEY', (data: ShelfData) => {
    console.log('Current data', data.current);
    console.log('Previous data', data.previous);
    console.log('Subscribed key', data.key);
}, true);

shelfSubscription.unsubscribeShelf(); // Should be called when subscription is no longer required or scope of this code is going to be cleared.
```

### **1.3 getShelfData(key: string)**
getShelfData returns the latest data available for the specified key. This data again contains the same three imformation we recieve while subscribing the key. Current, previous and the key for which we have subscribed.


#### **Params**
>key: This is the key for which the object has been stored using setShelf. This is a mandatory field.

#### **Example**
```
import {getShelfData} from 'sitar';

const latestData = getShelfData('DEMO_SHELF_KEY');
console.log('Current data', latestData.current);
console.log('Previoud data', latestData.previous);
console.log('Subscribed key', latestData.key);
```


## 2. API Shelf
API Shelf fetches data from an API and then stores the data in browser's memory. 
This data can be accessed across the application inside the browser window.
Different parts of the application can subscribe to this data.
Once the API successfully fetches data, API Shelf triggers events which intern triggers functions provided by it's subscriptions.
<br>
<br>
Currently following are the provided functions by API Shelf.

### **2.1 setApiShelf(key: string, url: string, headers?: { [key: string]: string })**
setApiShelf triggers and API call. On recieving response data successfully it stores the data into browser memory. 
Also on revieving the response data successfully all the subscriptions for the specified key will be triggered with the API responde data. This is an asynchronous function. 
setApiShelf function takes two mandatory parameters and one optional parameter.
#### **Params**
>key: Name or unique identifier of the API data. This can be any string name. This should be unique for the kind of API data we store. This is a mandatory field <br>
>url: This is the URL of the API it should fetch data from. For simplicity currently it supports only basic GET calls. This is a mandatory field.<br>
>headers: This field allows us to pass special headers in case we have any. This feature has been provided to allow passing authorization tokens in the header.

#### **Example**
```
import {setApiShelf} from 'sitar';

const headers = {
    "Accept" : "application/json",
    "Content-Type" : "application/json",
};

setApiShelf('DEMO_API_SHELF_KEY', 'https://mydomain.com/path/resource', headers);

apiShelfSubscription.unsubscribeApiShelf(); // Should be called when subscription is no longer required or scope of this code is going to be cleared.
```



### **2.2 subscribeApiShelf(key: string, eventHandler: ShelfEventHandler, triggerNow ?: boolean): ApiShelfSubscription**
subscribeApiShelf subscribes to the data we receive from the API using setApiShelf. On recieving response data successfully it stores 
the data into browser memory and then it goes through all the subscriptions and calls all the callback functions with the API response data.
This function returns ApiShelfSubscription object which contains subscription id and unsubscribeApiShelf() function. unsubscribeApiShelf() function helps unsubscribing the subscription.
subscribeApiShelf function takes two mandatory parameters and one optional parameter.
#### **Params**
>key: Name or unique identifier of the API data. This can be any string name. This should be unique for the kind of API data we store. This is a mandatory field <br>
>eventHandler: eventHandler is a callback function that gets called once the API data is successfully recieved. eventHandler is a mandatory field. eventHanler recieives an objected which has three information. <br>
>> current: This contains the latest version of the object.<br>
>> previous: This contains the previous version of the object.<br>
>> key: The key for which it was subscribed. <br>

>triggerNow: This is an optional boolean field. On passing this field as true, the provided eventHanler function will be triggered immediately with current data. This is helpful when it is understood that the target object or data is already available in the memory and it can be accessed immediately along with subscribing it. <br>

#### **Example**
```
import {subscribeApiShelf} from 'sitar';

const apiShelfSubscription = subscribeApiShelf('DEMO_SHELF_KEY', (data: ShelfData) => {
    console.log('Current data', data.current);
    console.log('Previous data', data.previous);
    console.log('Subscribed key', data.key);
}, true);

apiShelfSubscription.unsubscribeApiShelf(); // Should be called when subscription is no longer required or scope of this code is going to be cleared.