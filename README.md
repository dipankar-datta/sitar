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
key: Name or unique identifier of the object. Key should be exactly the same for which object has been stored already or going to be stored.. This is a mandatory field <br>
eventHandler: eventHandler is a callback function we need to provide when we subscribe to a specific key. This function gets called whenever setShelf(key, data) gets called from any where in the application for the same key. eventHanler recieives an objected which has three information. <br>
> current: This contains the latest version of the object.<br>
> previous: This contains the previous version of the object.<br>
> key: The key for which it was subscribed. <br>

eventHandler is a mandatory field. <br>
triggerNow: This is an optional boolean field. On passing this field as true, the provided eventHanler function will be triggered immediately with current data. This is helpful when it is understood that the target object or data is already available in the memory and it can be accessed immediately along with subscribing it. <br>

#### **Returns**
subscribeShelf return a ShelfSubscription object which contains a unique subscription id and an unsubscribeShelf function. This object can be stored as an instance variable which is used to unsubscribe the subscription. We need to call unsubscribeShelf() function of the ShelfSubscription object.

#### **Example**
```
import {subscribeShelf} from 'sitar';

const shelfSubscription = subscribeShelf('DEMO_SHELF_KEY', (data: ShelfData) => {
    console.log('Current data', data.current);
    console.log('Previoud data', data.previous);
    console.log('Subscribed key', data.key);
}, true);

shelfSubscription.unsubscribeShelf();
```

### **1.3 getShelfData(key: string)**
getShelfData returns the latest data available for the specified key. This data again contains the same three imformation we recieve while subscribing the key. Current, previous and the key for which we have subscribed.


#### **Params**
key: This is the key for which the object has been stored using setShelf. This is a mandatory field.

#### **Example**
```
import {getShelfData} from 'sitar';

const latestData = getShelfData('DEMO_SHELF_KEY');
console.log('Current data', latestData.current);
console.log('Previoud data', latestData.previous);
console.log('Subscribed key', latestData.key);
```
