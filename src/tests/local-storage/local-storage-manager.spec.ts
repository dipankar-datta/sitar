import { deleteLocalStorage, getLocalStorageData, LocalStorageData, setLocalStorage, subscribeLocalStorage } from "../../local-storage/local-storage-manager";

describe('Test Local Storage', () => {

    const sampleTestData = {alfa: 10, delta: 20, theta: 30};

    test('Test setting local storage data', () => {
        const testLocalStorageKey = 'TEST_LOCAL_STORAGE_KEY_1';
        setLocalStorage(testLocalStorageKey, sampleTestData);

        let localStorageData :any = localStorage.getItem(testLocalStorageKey);

        expect(localStorageData).not.toBeNull();
        localStorageData = JSON.parse(localStorageData);

        expect(localStorageData.alfa).toBeDefined();
        expect(localStorageData.delta).toBeDefined();
        expect(localStorageData.theta).toBeDefined();

        expect(localStorageData.alfa).toBe(10);
        expect(localStorageData.delta).toBe(20);
        expect(localStorageData.theta).toBe(30);
    });

    test('Test getting local storage data after setting', () => {
        const testLocalStorageKey = 'TEST_LOCAL_STORAGE_KEY_2';
        setLocalStorage(testLocalStorageKey, sampleTestData);

        let localStorageData :any = getLocalStorageData(testLocalStorageKey);

        expect(localStorageData).not.toBeNull();

        expect(localStorageData.alfa).toBeDefined();
        expect(localStorageData.delta).toBeDefined();
        expect(localStorageData.theta).toBeDefined();

        expect(localStorageData.alfa).toBe(10);
        expect(localStorageData.delta).toBe(20);
        expect(localStorageData.theta).toBe(30);

    });

    test('Test setting local storage data with subscription', done => {
        const testLocalStorageKey = 'TEST_LOCAL_STORAGE_KEY_3';
        

        const sub = subscribeLocalStorage(testLocalStorageKey, (localStorageData: LocalStorageData) => {
            expect(localStorageData.data).toBeDefined();    
            expect(localStorageData.data.alfa).toBeDefined();
            expect(localStorageData.data.delta).toBeDefined();
            expect(localStorageData.data.theta).toBeDefined();    
            expect(localStorageData.data.alfa).toBe(10);
            expect(localStorageData.data.delta).toBe(20);
            expect(localStorageData.data.theta).toBe(30);
            expect(localStorageData.subscriptionKey).toBeDefined();    
            expect(localStorageData.subscriptionKey).toBe(testLocalStorageKey);    
        });

        setLocalStorage(testLocalStorageKey, sampleTestData);

        const doUnsub = async () => {
            expect(sub.unsubscribeLocalStorage()).toBeTruthy();
            expect(sub.unsubscribeLocalStorage()).toBeFalsy();
            done();
        }

        doUnsub();
    });

    test('Test setting local storage data with subscription and triggerNow', done => {
        const testLocalStorageKey = 'TEST_LOCAL_STORAGE_KEY_4';
        setLocalStorage(testLocalStorageKey, sampleTestData);

        const sub = subscribeLocalStorage(testLocalStorageKey, (localStorageData: LocalStorageData) => {
            expect(localStorageData.data).toBeDefined();    
            expect(localStorageData.data.alfa).toBeDefined();
            expect(localStorageData.data.delta).toBeDefined();
            expect(localStorageData.data.theta).toBeDefined();    
            expect(localStorageData.data.alfa).toBe(10);
            expect(localStorageData.data.delta).toBe(20);
            expect(localStorageData.data.theta).toBe(30);
            expect(localStorageData.subscriptionKey).toBeDefined();    
            expect(localStorageData.subscriptionKey).toBe(testLocalStorageKey);    
        }, true);

        const doUnsub = async () => {
            expect(sub.unsubscribeLocalStorage()).toBeTruthy();
            expect(sub.unsubscribeLocalStorage()).toBeFalsy();
            done();
        }

        doUnsub();
    });

    test('Test subscribing before setting local storage data', done => {
        const testLocalStorageKey = 'TEST_LOCAL_STORAGE_KEY_5';
        const sub = subscribeLocalStorage(testLocalStorageKey, (localStorageData: LocalStorageData) => {
            expect(localStorageData).not.toBeNull();    
            if (localStorageData) {
                expect(localStorageData.data).toBeDefined();    
                expect(localStorageData.data.alfa).toBeDefined();
                expect(localStorageData.data.delta).toBeDefined();
                expect(localStorageData.data.theta).toBeDefined();    
                expect(localStorageData.data.alfa).toBe(10);
                expect(localStorageData.data.delta).toBe(20);
                expect(localStorageData.data.theta).toBe(30);
                expect(localStorageData.subscriptionKey).toBeDefined();    
                expect(localStorageData.subscriptionKey).toBe(testLocalStorageKey); 
            }
        });

        setLocalStorage(testLocalStorageKey, sampleTestData);

        const doUnsub = async () => {
            expect(sub.unsubscribeLocalStorage()).toBeTruthy();
            expect(sub.unsubscribeLocalStorage()).toBeFalsy();
            done();
        }
        doUnsub();
    });

    test('Test subscribing before setting local storage data', () => {
        const testLocalStorageKey = 'TEST_LOCAL_STORAGE_KEY_6';
        try {
            subscribeLocalStorage(null as any, (localStorageData: LocalStorageData) => {});
        } catch(err: any) {
            expect(err).toBeDefined();
            expect(err.message).toBe('Invalid subscription key or callback.');
        }
    });

    test('Test deleting local storage data with subscription', done => {
        const testLocalStorageKey = 'TEST_LOCAL_STORAGE_KEY_7';
        setLocalStorage(testLocalStorageKey, sampleTestData);
        const sub = subscribeLocalStorage(testLocalStorageKey, (localStorageData: LocalStorageData) => {
            expect(localStorageData).not.toBeNull();    
            if (localStorageData) {
                expect(localStorageData.data).toBeNull();   
                expect(localStorageData.subscriptionKey).toBeDefined();    
                expect(localStorageData.subscriptionKey).toBe(testLocalStorageKey); 
            }
        });
        deleteLocalStorage(testLocalStorageKey);
        const doUnsub = async () => {
            expect(sub.unsubscribeLocalStorage()).toBeFalsy();
            done();
        }
        doUnsub();
    });
});