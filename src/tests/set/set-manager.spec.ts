import { clearSet, getSet, removeFromSet, SetData, setSet, subscribeSet } from "../../set/set-manager";

describe('Test Set', () => {

    test('Test setting Set data. With subscription', done => {

        const testSetKey = 'TEST_SET_KEY_1';

        setSet(testSetKey, ['alfa', 'beta', 'theta']);

        const setData = getSet(testSetKey);

        expect(setData).toBeDefined();
        expect(setData).toHaveLength(3);
        if (setData) {
            expect(setData[0]).toBe('alfa');
            expect(setData[1]).toBe('beta');
            expect(setData[2]).toBe('theta');
        }

        const sub = subscribeSet(testSetKey, (setData: SetData) => {
            expect(setData).toBeDefined();
            if (setData) {
                expect(setData.set).toBeDefined();
                expect(setData.set).toHaveLength(3);
                expect(setData.added).toBeUndefined();
                expect(setData.removed).toBeUndefined();
            }
        }, true);

        const doUnsub = async () => {
            expect(sub.unsubscribeSet()).toBeTruthy();
            expect(sub.unsubscribeSet()).toBeFalsy();
            done();
        };
        doUnsub();
    });

    test('Test setting duplicate Set data', done => {

        const testSetKey = 'TEST_SET_KEY_2';

        setSet(testSetKey, ['alfa', 'beta', 'theta']);

        const sub = subscribeSet(testSetKey, (setData: SetData) => {
            expect(setData).toBeDefined();
            if (setData) {
                expect(setData.set).toBeDefined();
                expect(setData.set).toHaveLength(5);
                expect(setData.added).toBeDefined();
                expect(setData.added).toHaveLength(2);
                expect(setData.removed).toBeNull();
            }
        });        

        let setData = getSet(testSetKey);

        expect(setData).toBeDefined();
        expect(setData).toHaveLength(3);
        if (setData) {
            expect(setData[0]).toBe('alfa');
            expect(setData[1]).toBe('beta');
            expect(setData[2]).toBe('theta');
        }

        setSet(testSetKey, ['gamma', 'zeta', 'theta']);

        setData = getSet(testSetKey);
        expect(setData).toBeDefined();
        expect(setData).toHaveLength(5);
        if (setData) {
            expect(setData[0]).toBe('alfa');
            expect(setData[1]).toBe('beta');
            expect(setData[2]).toBe('theta');
            expect(setData[3]).toBe('gamma');
            expect(setData[4]).toBe('zeta');
        }

        const doUnsub = async () => {
            expect(sub.unsubscribeSet()).toBeTruthy();
            expect(sub.unsubscribeSet()).toBeFalsy();
            done();
        };
        doUnsub();
    });

    test('Test removing single element from Set data', done => {

        const testSetKey = 'TEST_SET_KEY_3';

        setSet(testSetKey, [{alfa: 10}, {beta: 20}, {theta: 30}]);

        const sub = subscribeSet(testSetKey, (setData: SetData) => {
            expect(setData).toBeDefined();
            if (setData) {
                expect(setData.set).toBeDefined();
                expect(setData.set).toHaveLength(2);
                expect(setData.added).toBeNull();
                expect(setData.removed).toBeDefined();
                expect(setData.removed).toHaveLength(1);
            }
        });    

        removeFromSet(testSetKey, {beta: 20});

        const setData = getSet(testSetKey);

        expect(setData).toBeDefined();
        expect(setData).toHaveLength(2);
        if (setData) {
            expect(setData[0]).toStrictEqual({alfa: 10});
            expect(setData[1]).toStrictEqual({theta: 30});
        }

        const doUnsub = async () => {
            expect(sub.unsubscribeSet()).toBeTruthy();
            expect(sub.unsubscribeSet()).toBeFalsy();
            done();
        };
        doUnsub();
    });

    test('Test removing multiple elements from Set data', done => {

        const testSetKey = 'TEST_SET_KEY_4';

        setSet(testSetKey, [{alfa: 10}, {beta: 20}, {theta: 30}, {delta: 40}, {delta: 80}]);

        const sub = subscribeSet(testSetKey, (setData: SetData) => {
            expect(setData).toBeDefined();
            if (setData) {
                expect(setData.set).toBeDefined();
                expect(setData.set).toHaveLength(3);
                expect(setData.added).toBeNull();
                expect(setData.removed).toBeDefined();
                expect(setData.removed).toHaveLength(2);
            }
        });   

        removeFromSet(testSetKey, [{beta: 20}, {theta: 30}]);

        const setData = getSet(testSetKey);

        expect(setData).toBeDefined();
        expect(setData).toHaveLength(3);
        if (setData) {
            expect(setData[0]).toStrictEqual({alfa: 10});
            expect(setData[1]).toStrictEqual({delta: 40});
            expect(setData[2]).toStrictEqual({delta: 80});
        }

        const doUnsub = async () => {
            expect(sub.unsubscribeSet()).toBeTruthy();
            expect(sub.unsubscribeSet()).toBeFalsy();
            done();
        };
        doUnsub();
    });

    test('Test clearing Set data. With subscription', done => {

        const testSetKey = 'TEST_SET_KEY_5';

        setSet(testSetKey, ['alfa', 'beta', 'theta']);
        

        const sub = subscribeSet(testSetKey, (setData: SetData) => {
            expect(setData).toBeDefined();
            if (setData) {
                expect(setData.set).toBeNull();
                expect(setData.added).toBeNull();
                expect(setData.removed).toBeNull();
            }
        });

        clearSet(testSetKey);

        const doUnsub = async () => {
            expect(sub.unsubscribeSet()).toBeFalsy();
            done();
        };
        doUnsub();
    });

    test('Test subscription before loading set', done => {

        const testSetKey = 'TEST_SET_KEY_5';

        
        

        const sub = subscribeSet(testSetKey, (setData: SetData) => {
            expect(setData).toBeDefined();
            if (setData) {
                expect(setData.set).toBeDefined();
                expect(setData.added).toBeDefined();
                expect(setData.removed).toBeNull();
            }
        });

        setSet(testSetKey, ['alfa', 'beta', 'theta']);

        const doUnsub = async () => {
            expect(sub.unsubscribeSet()).toBeTruthy();
            expect(sub.unsubscribeSet()).toBeFalsy();
            done();
        };
        doUnsub();
    });
});