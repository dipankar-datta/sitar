import { echo, subscribeEcho } from '../../echo/echo';

describe('Test Echo', () => {

    const sampleTestData = {alfa: 10, delta: 20, theta: 30};

    test('Test echo with argument', done => {

        const testEchoKey = 'TEST_ECHO_KEY_1';

        const sub = subscribeEcho(testEchoKey, (echoData: any) => {
            expect(echoData).toBeDefined();
        });

        echo(testEchoKey, sampleTestData);

        const doUnsub = async () => {
            expect(sub.unsubscribeEcho()).toBeTruthy();
            expect(sub.unsubscribeEcho()).toBeFalsy();
            done();
        }
        doUnsub();
    });

    test('Test echo without argument', done => {

        const testEchoKey = 'TEST_ECHO_KEY_2';

        const sub = subscribeEcho(testEchoKey, (echoData: any) => {
            expect(echoData).toBeUndefined();
        });

        echo(testEchoKey);

        const doUnsub = async () => {
            expect(sub.unsubscribeEcho()).toBeTruthy();
            expect(sub.unsubscribeEcho()).toBeFalsy();
            done();
        }

        doUnsub();
    });

    test('Test echo with multiple subscriptions', done => {

        const testEchoKey = 'TEST_ECHO_KEY_3';

        const sub1 = subscribeEcho(testEchoKey, (echoData: any) => {
            expect(echoData).toBeUndefined();
        });

        const sub2 = subscribeEcho(testEchoKey, (echoData: any) => {
            expect(echoData).toBeUndefined();
        });

        const doUnsub = async () => {
            expect(sub1.unsubscribeEcho()).toBeTruthy();
            expect(sub1.unsubscribeEcho()).toBeFalsy();
            expect(sub2.unsubscribeEcho()).toBeTruthy();
            expect(sub2.unsubscribeEcho()).toBeFalsy();
            
            done();
        }

        doUnsub();
    });

    test('Test echo without invalid subscription key', () => {
       
        try {
            subscribeEcho(null as any, null as any);
        } catch(err: any) {
            expect(err).toBeDefined();
            expect(err.message).toBe('Invalid subscription key or callback.');
        }
    });
});