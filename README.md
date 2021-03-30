# Sitar

## Introduction

Sitar is a JavaScript library build using TypeScript and is compatible with both JavaScript and TypeScript.

Sitar attemps to simplify browser side storage management using events.

Currently Sitar provides following modules as part of it's implementation.

### **1. Shelf**
### **2. API Shelf**
### **3. Map**
### **4. Set**
### **5. Local Storage**
### **6. Session Storage**
### **7. Invoker**

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

### **1.1 setShelf(subscriptionKey: string, data: any)**
setShelf stores the data into browser memory. Please note that on reloading or refreshing the browser this data gets erased. Once this function is called, all the subscriptions for the specified key will be triggered. setShelf function takes two parameters.
#### **Params**
>**subscriptionKey:** Name or unique identifier of the object. This can be any string name. This should be unique for the kind of object we store. This is a mandatory field <br>
>**data:** This is the object we would like to store. This can be any kind of data. This is a mandatory field.

#### **Example**
```
import {setShelf} from 'sitar';

setShelf('DEMO_SHELF_KEY', {"alfa": 100, "beta": 200});
```

### **1.2 subscribeShelf(subscriptionKey: string, callback: ShelfEventHandler, triggerNow?: boolean): ShelfSubscription**
#### **Params**
subscribeShelf subscribes changes for any object against a specific subscriptionK key. Basically this is a subscription for every time setShelf is called for the same subscription key. This function take two mandatory and one optional parameters.
#### **Params**
>**subscriptionKey:** Name or unique identifier of the object. Key should be exactly the same for which object has been stored already or going to be stored.. This is a mandatory field <br>
>**callback:** callback is a callback function we need to provide when we subscribe to a specific key. This function gets called whenever setShelf(key, data) gets called from any where in the application for the same key. eventHandler is a mandatory field. callback recieives an objected which has three information. <br>
>> **current:** This contains the latest version of the object.<br>
>> **previous:** This contains the previous version of the object.<br>
>> **key:** The key for which it was subscribed. <br>
>
>**triggerNow:** This is an optional boolean field. On passing this field as true, the provided eventHanler function will be triggered immediately with current data. This is helpful when it is understood that the target object or data is already available in the memory and it can be accessed immediately along with subscribing it. <br>

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

### **1.3 getShelfData(subscriptionKey: string)**
getShelfData returns the latest data available for the specified subscription key. This data again contains the same three imformation we recieve while subscribing the subscription key. Current, previous and the subscription key for which we have subscribed.


#### **Params**
>**key:** This is the key for which the object has been stored using setShelf. This is a mandatory field.

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

### **2.1 setApiShelf(subscriptionKey: string, url: string, headers?: { [key: string]: string })**
setApiShelf triggers and API call. On recieving response data successfully it stores the data into browser memory. 
Also on revieving the response data successfully all the subscriptions for the specified key will be triggered with the API responde data. This is an asynchronous function. 
setApiShelf function takes two mandatory parameters and one optional parameter.
#### **Params**
>**subscriptionKey:** Name or unique identifier of the API data. This can be any string name. This should be unique for the kind of of API data we store. This is a mandatory field <br>
>**url:** This is the URL of the API it should fetch data from. For simplicity currently it supports only basic GET calls. This is a mandatory field.<br>
>**headers:** This field allows us to pass special headers in case we have any. This feature has been provided to allow passing authorization tokens in the header.

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



### **2.2 subscribeApiShelf(subscriptionKey: string, callback: ShelfEventHandler, triggerNow ?: boolean): ApiShelfSubscription**
subscribeApiShelf subscribes to the data we receive from the API using setApiShelf. On recieving response data successfully it stores 
the data into browser memory and then it goes through all the subscriptions and calls all the callback functions with the API response data.

subscribeApiShelf function takes two mandatory parameters and one optional parameter.
#### **Params**
>**subscriptionKey:** Name or unique identifier of the API data. This can be any string name. This should be unique for the kind of of API data we store. This is a mandatory field <br>
>**callback:** callback is a callback function that gets called once the API data is successfully recieved. eventHandler is a mandatory field. callback recieives an objected which has three information. <br>
>> **current:** This contains the latest version of the object.<br>
>> **previous:** This contains the previous version of the object.<br>
>> **subscriptionKey:** The key for which it was subscribed. <br>
>
>**triggerNow:** This is an optional boolean field. On passing this field as true, the provided eventHanler function will be triggered immediately with current data. This is helpful when it is understood that the target object or data is already available in the memory and it can be accessed immediately along with subscribing it. <br>

#### **Returns**
subscribeApiShelf returns ApiShelfSubscription object which contains subscription id and unsubscribeApiShelf() function. unsubscribeApiShelf() function helps unsubscribing the subscription. When we need to unsubscribe the APiShelf, then we can call unsubscribeApiShelf function we recieved in the ApiShelfSubscription object while subscribing the APIShelf.


#### **Example**
```
import {subscribeApiShelf} from 'sitar';

const apiShelfSubscription = subscribeApiShelf('DEMO_SHELF_KEY', (data: ShelfData) => {
    console.log('Current data', data.current);
    console.log('Previous data', data.previous);
    console.log('Subscribed key', data.key);
}, true);

apiShelfSubscription.unsubscribeApiShelf(); // Should be called when subscription is no longer required or scope of this code is going to be cleared.
```

## 3. Map
Map is a data structure that gets stored in the browser memory and applications can create and access this map against a uique key. Each time we we need to access the map we need to provide the main subscription key and the map key.

Following are the features currently provided by Map

>**setMap** <br>
>**loadMap** <br>
>**getMap** <br>
>**subscribeMap** <br>
>**deleteMapEntry** <br>
>**clearMap**

### **3.1 setMap(subscriptionKey: string, entryKey: string, data: any)**
setMap takes the data aginst the subscription key and the object key and then stores it in the browser memory. After storing it invokes all the callback functions which are provided as part of subscription for the subscription key. setMap stores data based on the subscriptionKey and the entryKey.

#### **Params**
>**subscriptionKey**: Name or unique identifier of Map. This can be any string name. This should be unique for the kind of Map we store. This is the subscription key. This is a mandatory field <br>
>**entryKey**: entryKey is the key for the map we stored in the memory. Everytime we call setMap and provide this key, it will store the data agains this key inside the stored map. On passing same key it will override the previous data agains this key . This is a mandatory field.<br>
>**data**: This is the data we intend to stored in the map for the specified entryKey.

#### **Example**
```
import {setMap} from 'sitar';

setMap('DEMO_MAP_KEY', 'alfa', 100);
```

### **3.2 loadMap(subscriptionKey: string, obj: {[objKey: string]: any})**
loadMap takes an object against a subscription key and loads the object into the Map in browser memory. Once the object is revieved, each key in the object is treaded as individual entry for the map and then all the key value pairs of the object is stored a individual entry in the map. This is ideal for use cases where a whole set of key value pairs are needed to be loaded into the map at once.

#### **Params**
>**subscriptionKey:** Name or unique identifier of the API data. This can be any string name. This should be unique for the kind of data we store. This is the subscription key. This is a mandatory field <br>
>**obj:** obj is the object with key value pairs we intend to store in the map at once.<br>

#### **Example**
```
import {loadMap} from 'sitar';

loadMap('DEMO_MAP_KEY', {"alfa": 100, "beta": 'Hello Sitar', "gamma": true});
```

### **3.3 getMap(subscriptionKey: string): Map<any,any> | undefined**
getMap returns the latest version of the map stored into browser memory for the subscription key.

#### **Params**
>**subscriptionKey**: Name or unique identifier of Map. This can be any string name. This should be unique for the kind of Map we store. This is the subscription key. This is a mandatory field <br>

#### **Returns**
getMap returns the latest version of the map stored into browser memory for the subscription key. In case the Map is already cleared or the subscription key provided is invalid it will return undefined.

#### **Example**
```
import {getMap} from 'sitar';

const mapData = getMap('DEMO_MAP_KEY');
console.log(mapData);
```

### **3.4 subscribeMap(key: string, callback: Function, triggerNow?: false): MapSubscription**
subscribeMap is used for subscribing for any changes in the Map.

#### **Params**
>**subscriptionKey:** Name or unique identifier of Map. This can be any string name. This should be unique for the kind of Map we store. This is the subscription key. This is a mandatory field <br>
>**callback:** We need to provide a callback function while subscribing to the Map changes. On changes in the Map, this callback function gets called with following information. 1. Entry key for which the data has changed. 2. Current version of the entry value. 3. Previous version of the entry value. 4. Main Map data. This is a mandatory field.<br>
>**triggerNow:** This is an optional boolean field. This is useful when we need the Map data immediately and at the same time we need to subscribe for any changes in the Map. In such cases we need to provide this parameter as true.

#### **Returns**
subscribeMap returns MapSubscription object which contains subscription id and unsubscribeMap() function. unsubscribeMap() function helps unsubscribing the subscription. When we need to unsubscribe the Map, then we can call unsubscribeMap function we recieved in the MapSubscription object while subscribing the Map.

#### **Example**
```
import {subscribeMap} from 'sitar';

const mapSubscription = subscribeMap('DEMO_MAP_KEY', (data: any) => {
    console.log(data.key); // This is not subscription key. This is the key for the entry that has changed.
    console.log(data.current);
    console.log(data.previous);
    console.log(data.map);
}, true);
mapSubscription.unsubscribeMap(); // Should be called when subscription is no longer required or scope of this code is going to be cleared.
```

### **3.5 deleteMapEntry(subscriptionKey: string, entryKey: string): boolean**
deleteMapEntry is used for deleting or removing an entry from the Map in the browsers memory. On deletion it triggers all the callbacks for the specified subscription key. 

#### **Params**
>**subscriptionKey:** Name or unique identifier of Map. This can be any string name. This should be unique for the kind of Map we store. This is the subscription key. This is a mandatory field <br>
>**entryKey:** Entry key for the Map which we intend to delete from the Map. <br>

#### **Returns**
deleteMapEntry returns boolean true on successful deletion and returns false otherwise.

#### **Example**
```
import {deleteMapEntry} from 'sitar';

const deleted = deleteMapEntry('DEMO_MAP_KEY', 'demoMapEntryKey');
console.log(`Is deleted : ${deleted}`);
```

### **3.6 clearMap(subscriptionKey: string): boolean**
clearMap is used for deleting or removing the whole Map from the browsers memory. On clearing the Map it triggers all the callbacks for the specified subscription key. 

#### **Params**
>**subscriptionKey:** Name or unique identifier of Map. This can be any string name. This should be unique for the kind of Map we store. This is the subscription key. This is a mandatory field <br>

#### **Returns**
clearMap returns boolean true on successful removal and returns false otherwise.

```
import {clearMap} from 'sitar';

const removed = clearMap('DEMO_MAP_KEY');
console.log(`Is removed : ${removed}`);
```

## 4. Set
Set is a data structure that stores unique data in browser's memory. It provides the data as a list or array but internally it maintains the data in a more complex manner. Set does not allow storing duplicates. It allows storing null and undefined.

Currently set provides following functionalities.

>**setSet** <br>
>**getSet** <br>
>**subscribeSet** <br>
>**removeFromSet** <br>
>**clearSet**

### **4.1 setSet(subscriptionKey: string, data: any | any[])**
setSet stores single or multiple items into the Set in the browser's memory.

#### **Params**
>**subscriptionKey:** Name or unique identifier of Set. This can be any string name. This should be unique for the kind of Set we store. This is the subscription key. This is a mandatory field <br>
>**data:** This is the data the application inted to store in the Set. This can be single data or list of data. In case the data is a list of data, individual item in the data list is stored as individual item in the the Set. This is a mandatory field <br>

```
import {setSet} from 'sitar';

setSet('DEMO_SET_KEY', {"alfa": 10, "beta": 20});
setSet('DEMO_ANOTHER_SET_KEY', ["White", "Red", "Green"]);
```

### **4.2 getSet(subscriptionKey: string): any[] | undefined**
getSet returns the latest version of the Set for the subscription key from browser's memory.

#### **Params**
>**subscriptionKey:** Name or unique identifier of Set. This can be any string name. This should be unique for the kind of Set we store. This is the subscription key. This is a mandatory field <br>

#### **Returns**
getSet returns the Set data for the subscription key. In case the Set has been deleted or the key is invalid, then it returns undefined.

```
import {getSet} from 'sitar';

const setData = getSet('DEMO_SET_KEY');
if (setData) {
    console.log(setData);
}
```

### **4.3 subscribeSet(subscriptionKey: string, callback: SetEventHandler, triggerNow = false): SetSubscription**
subscribeSet is used for subscribing any changes in the Set.

#### **Params**
>**subscriptionKey:** Name or unique identifier of Set. This can be any string name. This should be unique for the kind of Set we store. This is the subscription key. This is a mandatory field <br>
>**callback:** callback is a callback function that gets triggered whenever there are changes in the Set for the subscription key. This is a mandatory field. callback recieves an object when it is triggered. That object has following three information <br>
>>**added:** This field contains the items which has been added as latest change in the Set.<br>
>>**removed:** This field contains the items which has been removed as latest change in the Set.<br>
>>**set:** This field contains the latest version of the Set.<br>
>
>**triggerNow:** This is an optional boolean field. This is useful when we need the Set data immediately and at the same time we need to subscribe for any changes in the Set. In such cases we need to provide this parameter as true.

#### **Returns**
> **SetSubscription:** subscribeSet returns SetSubscription object which contains subscription id and unsubscribeSet() function. unsubscribeSet() function helps unsubscribing the subscription. When we need to unsubscribe the Set, then we can call unsubscribeSet function we recieved in the SetSubscription object while subscribing the Set.


```
import {subscribeSet} from 'sitar';

const subscription = subscribeSet('DEMO_SET_KEY', (data: SetData) => {
    console.log("Added item: ", data?.added);
    console.log("Removed item: ", data?.removed);
    console.log("Set data: ", data.set);
}, true);

subscription.unsubscribeSet(); // Should be called when subscription is no longer required or scope of this code is going to be cleared.
```

### **4.4 removeFromSet(subscriptionKey: string, setItem: any | any[])**
removeFromSet removes provided item or items from the Set.

#### **Params**
> **subscriptionKey:** Name or unique identifier of Set. This can be any string name. This should be unique for the kind of Set we store. This is the subscription key. This is a mandatory field <br>
> **setItem:** This can be single data or list of data which needs to be removed from the Set. Upon deletion, it triggers all the subscription callback with removed items as deleted items, added items as null and then set as the latest set version.

```
import {removeFromSet} from 'sitar';

removeFromSet('DEMO_SET_KEY', {"alfa": 10});

```
### **4.5 clearSet(subscriptionKey: string): boolean**
clearSet deleted the entire Set for the subscription key. While deleting the Set, it also triggers all the subscription callbacks with null data for added, removed and set.

#### **Params**
> **subscriptionKey:** Name or unique identifier of Set. This can be any string name. This should be unique for the kind of Set we store. This is the subscription key. This is a mandatory field <br>

#### **Returns**
> **boolean:** Returns true if the Set has been successfully and returns false otherwise.<br>

```
import {clearSet} from 'sitar';

const removed = clearSet('DEMO_SET_KEY');

console.log("Set removed: ", removed);
```

## 5. Local Storage
Local Storage is a typical browser local storage. In addition to browser's local storage, Sitar provides event based subscription features on the same local storage. Applications can subscribe to changes in the specific local storage and access the local storage data seamelessly. This works in line only when the changes in the specific local storage data is created, updated and access through Sitar only. If the local storage created by Sitar is modified by other parts of the application without Sitar, then this features will break. It is highly recommended to not modify local storage data created by Sitar.<br>

Following are the features provided by Local Storage in Sitar.

>**setLocalStorage** <br>
>**getLocalStorageData** <br>
>**subscribeLocalStorage** <br>
>**deleteLocalStorage** <br>

### **5.1 setLocalStorage(subscriptionKey: string, data: any)**
setLocalStorage created or updates the local storage data aginst the specified subscription key. The subscription key is treated as local storage key for the data. The data provided can be anything. If the data is string then it is stored directly in the local storage, otherwise it is first converted into string and then stored in the local storage.

#### **Params**
> **subscriptionKey:** Name or unique identifier of Local Storage. This can be any string name. This should be unique for the kind of Local Storage we store. This is the subscription key. This is a mandatory field <br>
> **data:** This is data we intend to stored in the local storage against the subscription key. This is the subscription key. This is a mandatory field <br>

```
import {setLocalStorage} from 'sitar';

setLocalStorage('DEMO_LOCAL_STORAGE_KEY', {"alfa": 10, "beta": true});

```


### **5.2 getLocalStorageData(subscriptionKey: string)**
getLocalStorageData returns the latest version of the local storage data against the subscription key. 

#### **Params**
> **subscriptionKey:** Name or unique identifier of Local Storage. This can be any string name. This should be unique for the kind of Local Storage we store. This is the subscription key. This is a mandatory field <br>


#### **Returns**
getLocalStorageData returns the latest version of the local storage data against the subscription key. After retrieving the data from local storage the data is first parsed into JSON object and then returned. JSON parsing takes place only when the local storage data is found to be not simple string. In case the local storage data has been deleted or invalid subscription key is provided, it returns null.

```
import {getLocalStorageData} from 'sitar';

const localStorageData = getLocalStorageData('DEMO_LOCAL_STORAGE_KEY');

if (localStorageData) {
    console.log(localStorageData.alfa);
    console.log(localStorageData.beta);
}
```


### **5.3 subscribeLocalStorage(subscriptionKey: string, callback: LocalStorageEventHandler, triggerNow = false): LocalStorageSubscription**
subscribeLocalStorage allows us to subscribe to any changes done in the local storage through Sitar. 


#### **Params**
> **subscriptionKey:** Name or unique identifier of Local Storage. This can be any string name. This should be unique for the kind of Local Storage we store. This is the subscription key. This is a mandatory field <br>
>**callback:** callback is a callback function that gets triggered whenever there are changes in the local storage for the subscription key. This is a mandatory field. callback recieves an object when it is triggered. That object has following two information <br>
>>**subscriptionKey:** The same subscription key for which it was subscribed.<br>
>>**data:** This is the JSON parsed data we recieve.<br>
>
>**triggerNow:** This is an optional boolean field. This is useful when we need the local storage data immediately and at the same time we need to subscribe for any changes in the local storage. In such cases we need to provide this parameter as true.



#### **Returns**
>**LocalStorageSubscription:** subscribeLocalStorage returns LocalStorageSubscription object which contains subscription id and unsubscribeLocalStorage() function. unsubscribeLocalStorage() function helps unsubscribing the subscription. When we need to unsubscribe the local storage, then we can call unsubscribeLocalStorage function we recieved in the SetSubscription object while subscribing the local storage.

```
import {subscribeLocalStorage} from 'sitar';

const subscription = subscribeLocalStorage('DEMO_LOCAL_STORAGE_KEY', (callBackData: LocalStorageData) => {
    console.log(callBackData.subscriptionKey);
    console.log(callBackData.data);
}, true);

subscription.unsubscribeLocalStorage(); // Should be called when subscription is no longer required or scope of this code is going to be cleared.
```


### **5.4 deleteLocalStorage(subscriptionKey: string): boolean**
deleteLocalStorage let's us delete the local storage entry created by Sitar. Upon deleting the local storage data it triggers all the subscription callbacks with null data.


#### **Params**
> **subscriptionKey:** Name or unique identifier of Local Storage. This can be any string name. This should be unique for the kind of Local Storage we store. This is the subscription key. This is a mandatory field <br>


#### **Returns**
>**boolean:** deleteLocalStorage return boolea true if the local storage entry has been deleted successfully. Otherwise it returns false.

```
import {deleteLocalStorage} from 'sitar';

const isDeleted = deleteLocalStorage('DEMO_LOCAL_STORAGE_KEY');

console.log("Is successfully deleted : ", isDeleted);
```


## 6. Session Storage
Session Storage is a typical browser session storage. In addition to browser's session storage, Sitar provides event based subscription features on the same session storage. Applications can subscribe to changes in the specific session storage and access the session storage data seamelessly. This works in line only when the changes in the specific session storage data is created, updated and access through Sitar only. If the session storage created by Sitar is modified by other parts of the application without Sitar, then this features will break. It is highly recommended to not modify session storage data created by Sitar.<br>

Following are the features provided by Session Storage in Sitar.

>**setSessionStorage** <br>
>**getSessionStorageData** <br>
>**subscribeSessionStorage** <br>
>**deleteSessionStorage** <br>

### **6.1 setSessionStorage(subscriptionKey: string, data: any)**
setSessionStorage created or updates the session storage data aginst the specified subscription key. The subscription key is treated as session storage key for the data. The data provided can be anything. If the data is string then it is stored directly in the session storage, otherwise it is first converted into string and then stored in the session storage.

#### **Params**
> **subscriptionKey:** Name or unique identifier of Session Storage. This can be any string name. This should be unique for the kind of Session Storage we store. This is the subscription key. This is a mandatory field <br>
> **data:** This is data we intend to stored in the session storage against the subscription key. This is the subscription key. This is a mandatory field <br>

```
import {setSessionStorage} from 'sitar';

setSessionStorage('DEMO_SESSION_STORAGE_KEY', {"alfa": 10, "beta": true});

```


### **6.2 getSessionStorageData(subscriptionKey: string)**
getSessionStorageData returns the latest version of the session storage data against the subscription key. 

#### **Params**
> **subscriptionKey:** Name or unique identifier of Session Storage. This can be any string name. This should be unique for the kind Session Storage we store. This is the subscription key. This is a mandatory field <br>


#### **Returns**
getSessionStorageData returns the latest version of the session storage data against the subscription key. After retrieving the data from session storage the data is first parsed into JSON object and then returned. JSON parsing takes place only when the session storage data is found to be not simple string. In case the session storage data has been deleted or invalid subscription key is provided, it returns null.

```
import {getSessionStorageData} from 'sitar';

const sessionStorageData = getSessionStorageData('DEMO_SESSION_STORAGE_KEY');

if (sessionStorageData) {
    console.log(sessionStorageData.alfa);
    console.log(sessionStorageData.beta);
}
```


### **6.3 subscribeSessionStorage(subscriptionKey: string, callback: SessionStorageEventHandler, triggerNow = false): SessionStorageSubscription**
subscribeSessionStorage allows us to subscribe to any changes done in the session storage through Sitar. 


#### **Params**
> **subscriptionKey:** Name or unique identifier of Session Storage. This can be any string name. This should be unique for the kind Session Storage we store. This is the subscription key. This is a mandatory field <br>
>**callback:** callback is a callback function that gets triggered whenever there are changes in the session storage for the subscription key. This is a mandatory field. callback recieves an object when it is triggered. That object has following two information <br>
>>**subscriptionKey:** The same subscription key for which it was subscribed.<br>
>>**data:** This is the JSON parsed data we recieve.<br>
>
>**triggerNow:** This is an optional boolean field. This is useful when we need the session storage data immediately and at the same time we need to subscribe for any changes in the session storage. In such cases we need to provide this parameter as true.



#### **Returns**
>>**SessionStorageSubscription:** subscribeSessionStorage returns SessionStorageSubscription object which contains subscription id and unsubscribeSessionStorage() function. unsubscribeSessionStorage() function helps unsubscribing the subscription. When we need to unsubscribe the session storage, then we can call unsubscribeSessionStorage function we recieved in the SetSubscription object while subscribing the session storage.

```
import {subscribeSessionStorage} from 'sitar';

const subscription = subscribeSessionStorage('DEMO_SESSION_STORAGE_KEY', (callBackData: SessionStorageData) => {
    console.log(callBackData.subscriptionKey);
    console.log(callBackData.data);
}, true);

subscription.unsubscribeSessionStorage(); // Should be called when subscription is no longer required or scope of this code is going to be cleared.
```

### **5.4 deleteSessionStorage(subscriptionKey: string): boolean**
deleteSessionStorage let's us delete the session storage entry created by Sitar. Upon deleting the session storage data it triggers all the subscription callbacks with null data.


#### **Params**
> **subscriptionKey:** Name or unique identifier of Local Storage. This can be any string name. This should be unique for the kind Session Storage we store. This is the subscription key. This is a mandatory field <br>


#### **Returns**
>**boolean:** deleteSessionStorage return boolea true if the session storage entry has been deleted successfully. Otherwise it returns false.

```
import {deleteSessionStorage} from 'sitar';

const isDeleted = deleteSessionStorage('DEMO_SESSION_STORAGE_KEY');

console.log("Is successfully deleted : ", isDeleted);
```

## 7. Invoker
Invoker allows us to invoke one or more specific functions in the application which has subscribed to specific user defined event. When the Invoker invokes for specific subscription key, it triggers callbacks for all the subscriptions. <br>

Invoker prvides following features.
>**invoke** <br>
>**subscribeInvoker** <br>

### **7.1 invoke(subscriptionKey: string, data?: any)**
invoke lets us invoking all the subscribed callbacks when needed. It also allows us to pass any data while invoking.


#### **Params**
> **subscriptionKey:** Name or unique identifier of Invoker. This can be any string name. This should be unique for the Invoker. This is the subscription key. This is a mandatory field <br>
> **data:** This is optional field. This can be passed when we need to pass any data while invoking all the subscribed callback. All the subscribed callbacks will recieve this data if they are recieving the data in their function parameters.

#### **Example**

```
import {invoke} from 'sitar';

invoke('DEMO_INVOKER_KEY', {"score": "4/5"});

```

### **7.1 subscribeInvoker(subscriptionKey: string, callback: InvokerEventHandler): InvokerSubscription**
subscribeInvoker allows us to subscribe for event triggers by invoke. Whenever invoke triggers an event, all the subscriptions will be invoked by their callbacks.

#### **Params**
> **subscriptionKey:** Name or unique identifier of Invoker. This can be any string name. This should be unique for the Invoker. This is the subscription key. This is a mandatory field <br>
>**callback:** callback is a callback function that gets triggered whenever invoke is triggered. callback may revieve data depending on if invoke is sending dat while invoking. . This is a mandatory field. <br>

#### **Returns**
>**InvokerSubscription:** subscribeInvoker returns InvokerSubscription object which contains subscription id and unsubscribeInvoker() function. unsubscribeInvoker() function helps unsubscribing the subscription. When we need to unsubscribe the Invoker, then we can call unsubscribeInvoker function we recieved in the InvokerSubscription object while subscribing the invoker.