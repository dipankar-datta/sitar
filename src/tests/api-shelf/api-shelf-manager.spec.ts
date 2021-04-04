import { clearApiShelfData, getApiShelfData, setApiShelf, subscribeApiShelf } from '../../api-shelf/api-shelf-manager';
import fetchMock from 'jest-fetch-mock';
import { ShelfData } from '../../shelf/shelf-manager';

describe('Test API Shelf', () => {
  const sampleTestData = { alfa: 10, beta: 20, gamma: 50 };
  const ApiShelfTestUrl = 'https://jsonplaceholder.typicode.com/users';

  const subscriptions: { key: string; subscription: any }[] = [];

  beforeAll(() => {
    fetchMock.enableMocks();
  });

  afterEach(() => {
    fetchMock.resetMocks();
  });

  afterAll(() => {
    fetchMock.disableMocks();
  });

  test('Should test successful data fetch', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(sampleTestData));
    const ApiShelfTestKey = 'TEST_DEMO_API_SHELF_KEY';

    const sub1 = subscribeApiShelf(ApiShelfTestKey, async (data: ShelfData) => {
      expect(data).not.toBeNull();
      expect(data.current).not.toBeNull();
      expect(data.previous).toBeNull();
      expect(data.key).not.toBeNull();

      expect(data.current.alfa).toBe(10);
      expect(data.current.beta).toBe(20);
      expect(data.current.gamma).toBe(50);
      expect(data.key).toBe(ApiShelfTestKey);

      expect(sub1.unsubscribeApiShelf()).toBeTruthy();
      expect(sub1.unsubscribeApiShelf()).toBeFalsy();

      fetchMock.mockResponseOnce(JSON.stringify({ red: 100, green: 200, blue: 300 }));
      await setApiShelf(ApiShelfTestKey, ApiShelfTestUrl);
      const sub2 = subscribeApiShelf(ApiShelfTestKey, (data: ShelfData) => {
        expect(data).not.toBeNull();
        expect(data.current).not.toBeNull();
        expect(data.previous).not.toBeNull();
        expect(data.key).not.toBeNull();

        expect(data.current.red).toBe(100);
        expect(data.current.green).toBe(200);
        expect(data.current.blue).toBe(300);

        expect(data.previous.alfa).toBe(10);
        expect(data.previous.beta).toBe(20);
        expect(data.previous.gamma).toBe(50);

        expect(data.key).toBe(ApiShelfTestKey);

        expect(sub2.unsubscribeApiShelf()).toBeTruthy();
        expect(sub2.unsubscribeApiShelf()).toBeFalsy();
      });
    });

    await setApiShelf(ApiShelfTestKey, ApiShelfTestUrl);
  });

  test('Should test tiggerNow with subscription', async (done) => {
    fetchMock.mockResponseOnce(JSON.stringify(sampleTestData));
    const ApiShelfTestKey = 'TEST_DEMO_API_SHELF_KEY_1';

    await setApiShelf(ApiShelfTestKey, ApiShelfTestUrl);

    const sub = subscribeApiShelf(
      ApiShelfTestKey,
      (data: ShelfData) => {
        expect(data).not.toBeUndefined();
        expect(data.current).not.toBeNull();
        expect(data.previous).toBeNull();
        expect(data.key).not.toBeNull();

        expect(data.current.alfa).toBe(10);
        expect(data.current.beta).toBe(20);
        expect(data.current.gamma).toBe(50);
        expect(data.key).toBe(ApiShelfTestKey);
        done();
      },
      true,
    );

    setTimeout(() => {
      expect(sub.unsubscribeApiShelf()).toBeTruthy();
      expect(sub.unsubscribeApiShelf()).toBeFalsy();
      done();
    }, 100);
  });

  test('Should test get api data', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(sampleTestData));
    const ApiShelfTestKey = 'TEST_DEMO_API_SHELF_KEY_2';

    await setApiShelf(ApiShelfTestKey, ApiShelfTestUrl);
    const data = getApiShelfData(ApiShelfTestKey);
    expect(data).not.toBeNull();
    if (data) {
      expect(data.current).not.toBeNull();
      expect(data.previous).toBeNull();
      expect(data.key).toBe(ApiShelfTestKey);

      expect(data.current.alfa).toBe(10);
      expect(data.current.beta).toBe(20);
      expect(data.current.gamma).toBe(50);
    }
    const apiData = getApiShelfData(ApiShelfTestKey);
    expect(apiData).not.toBeNull();
  });

  test('Should test get api data', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(sampleTestData));
    const ApiShelfTestKey = 'TEST_DEMO_API_SHELF_KEY_3';
    await setApiShelf(ApiShelfTestKey, ApiShelfTestUrl);
    expect(clearApiShelfData(ApiShelfTestKey)).toBeTruthy();
    expect(clearApiShelfData(ApiShelfTestKey)).toBeFalsy();
  });

  test('Should test API failure', async () => {
    fetchMock.mockReject(() => Promise.reject('API is down'));
    const ApiShelfTestKey = 'TEST_DEMO_API_SHELF_KEY_4';
    try {
      await setApiShelf(ApiShelfTestKey, ApiShelfTestUrl);
    } catch (err: any) {
      expect(err.message).toBe('Unsuccessful API call.');
    }
  });

  test('Should test invalid subscription key or callback', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(sampleTestData));
    try {
      subscribeApiShelf('', null as any);
    } catch (err: any) {
      expect(err.message).toBe('Invalid subscription key or callback.');
    }
  });

  test('Should test invalid subscription key or url', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(sampleTestData));
    try {
      await setApiShelf('', null as any);
    } catch (err: any) {
      expect(err.message).toBe('Invalid subscription key or url.');
    }
  });
});
