import { deleteSessionStorage, getSessionStorageData, SessionStorageData, setSessionStorage, subscribeSessionStorage } from "../../session-storage/session-storage-manager";

describe('Test Session Storage', () => {

    const sampleTestData = {alfa: 10, delta: 20, theta: 30};

    test('Test setting session storage data', () => {
        const testSessionStorageKey = 'TEST_SESSION_STORAGE_KEY_1';
        setSessionStorage(testSessionStorageKey, sampleTestData);

        let sessionStorageData :any = sessionStorage.getItem(testSessionStorageKey);

        expect(sessionStorageData).not.toBeNull();
        sessionStorageData = JSON.parse(sessionStorageData);

        expect(sessionStorageData.alfa).toBeDefined();
        expect(sessionStorageData.delta).toBeDefined();
        expect(sessionStorageData.theta).toBeDefined();

        expect(sessionStorageData.alfa).toBe(10);
        expect(sessionStorageData.delta).toBe(20);
        expect(sessionStorageData.theta).toBe(30);
    });

    test('Test getting session storage data after setting', () => {
        const testSessionStorageKey = 'TEST_SESSION_STORAGE_KEY_2';
        setSessionStorage(testSessionStorageKey, sampleTestData);

        let sessionStorageData :any = getSessionStorageData(testSessionStorageKey);

        expect(sessionStorageData).not.toBeNull();

        expect(sessionStorageData.alfa).toBeDefined();
        expect(sessionStorageData.delta).toBeDefined();
        expect(sessionStorageData.theta).toBeDefined();

        expect(sessionStorageData.alfa).toBe(10);
        expect(sessionStorageData.delta).toBe(20);
        expect(sessionStorageData.theta).toBe(30);

    });

    test('Test setting session storage data with subscription', done => {
        const testSessionStorageKey = 'TEST_SESSION_STORAGE_KEY_3';
        

        const sub = subscribeSessionStorage(testSessionStorageKey, (sessionStorageData: SessionStorageData) => {
            expect(sessionStorageData.data).toBeDefined();    
            expect(sessionStorageData.data.alfa).toBeDefined();
            expect(sessionStorageData.data.delta).toBeDefined();
            expect(sessionStorageData.data.theta).toBeDefined();    
            expect(sessionStorageData.data.alfa).toBe(10);
            expect(sessionStorageData.data.delta).toBe(20);
            expect(sessionStorageData.data.theta).toBe(30);
            expect(sessionStorageData.subscriptionKey).toBeDefined();    
            expect(sessionStorageData.subscriptionKey).toBe(testSessionStorageKey);    
        });

        setSessionStorage(testSessionStorageKey, sampleTestData);

        const doUnsub = async () => {
            expect(sub.unsubscribeSessionStorage()).toBeTruthy();
            expect(sub.unsubscribeSessionStorage()).toBeFalsy();
            done();
        }

        doUnsub();
    });

    test('Test setting session storage data with subscription and triggerNow', done => {
        const testSessionStorageKey = 'TEST_SESSION_STORAGE_KEY_4';
        setSessionStorage(testSessionStorageKey, sampleTestData);

        const sub = subscribeSessionStorage(testSessionStorageKey, (sessionStorageData: SessionStorageData) => {
            expect(sessionStorageData.data).toBeDefined();    
            expect(sessionStorageData.data.alfa).toBeDefined();
            expect(sessionStorageData.data.delta).toBeDefined();
            expect(sessionStorageData.data.theta).toBeDefined();    
            expect(sessionStorageData.data.alfa).toBe(10);
            expect(sessionStorageData.data.delta).toBe(20);
            expect(sessionStorageData.data.theta).toBe(30);
            expect(sessionStorageData.subscriptionKey).toBeDefined();    
            expect(sessionStorageData.subscriptionKey).toBe(testSessionStorageKey);    
        }, true);

        const doUnsub = async () => {
            expect(sub.unsubscribeSessionStorage()).toBeTruthy();
            expect(sub.unsubscribeSessionStorage()).toBeFalsy();
            done();
        }

        doUnsub();
    });

    test('Test subscribing before setting session storage data', done => {
        const testSessionStorageKey = 'TEST_SESSION_STORAGE_KEY_5';
        const sub = subscribeSessionStorage(testSessionStorageKey, (sessionStorageData: SessionStorageData) => {
            expect(sessionStorageData).not.toBeNull();    
            if (sessionStorageData) {
                expect(sessionStorageData.data).toBeDefined();    
                expect(sessionStorageData.data.alfa).toBeDefined();
                expect(sessionStorageData.data.delta).toBeDefined();
                expect(sessionStorageData.data.theta).toBeDefined();    
                expect(sessionStorageData.data.alfa).toBe(10);
                expect(sessionStorageData.data.delta).toBe(20);
                expect(sessionStorageData.data.theta).toBe(30);
                expect(sessionStorageData.subscriptionKey).toBeDefined();    
                expect(sessionStorageData.subscriptionKey).toBe(testSessionStorageKey); 
            }
        });

        setSessionStorage(testSessionStorageKey, sampleTestData);

        const doUnsub = async () => {
            expect(sub.unsubscribeSessionStorage()).toBeTruthy();
            expect(sub.unsubscribeSessionStorage()).toBeFalsy();
            done();
        }
        doUnsub();
    });

    test('Test subscribing before setting session storage data', () => {
        const testSessionStorageKey = 'TEST_SESSION_STORAGE_KEY_6';
        try {
            subscribeSessionStorage(null as any, (sessionStorageData: SessionStorageData) => {});
        } catch(err: any) {
            expect(err).toBeDefined();
            expect(err.message).toBe('Invalid subscription key or callback.');
        }
    });

    test('Test deleting session storage data with subscription', done => {
        const testSessionStorageKey = 'TEST_SESSION_STORAGE_KEY_7';
        setSessionStorage(testSessionStorageKey, sampleTestData);
        const sub = subscribeSessionStorage(testSessionStorageKey, (sessionStorageData: SessionStorageData) => {
            expect(sessionStorageData).not.toBeNull();    
            if (sessionStorageData) {
                expect(sessionStorageData.data).toBeNull();   
                expect(sessionStorageData.subscriptionKey).toBeDefined();    
                expect(sessionStorageData.subscriptionKey).toBe(testSessionStorageKey); 
            }
        });
        deleteSessionStorage(testSessionStorageKey);
        const doUnsub = async () => {
            expect(sub.unsubscribeSessionStorage()).toBeFalsy();
            done();
        }
        doUnsub();
    });
});