import { setShelf, getShelfData, subscribeShelf, ShelfData, subscribeShelfFilter, clearShelf } from '../../shelf/shelf-manager';

describe('Test Shelf', () => {
  test('Should set data in Shelf', () => {
    const testKey = 'SHELF_TEST_KEY_1';
    const testData = { alfa: 10, beta: 20 };
    setShelf(testKey, testData);

    const resultData = getShelfData(testKey);

    expect(resultData).not.toBeNull();
    expect(resultData.current).not.toBeNull();
    expect(resultData.previous).toBeNull();
    expect(resultData.key).toBe(testKey);
    expect(resultData.current.alfa).toBe(10);
    expect(resultData.current.beta).toBe(20);
  });

  test('Should test for subscriptions before setting data', () => {
    const testKey = 'SHELF_TEST_KEY_2';

    const sub1 = subscribeShelf(testKey, (data: ShelfData) => {
      expect(data).not.toBeNull();
      expect(data.current).not.toBeNull();
      expect(data.previous).toBeNull();
      expect(data.key).toBe(testKey);
      expect(data.current.alfa).toBe(10);
      expect(data.current.beta).toBe(20);
      expect(sub1.unsubscribeShelf()).toBeTruthy();
      expect(sub1.unsubscribeShelf()).toBeFalsy();
    });

    const sub2 = subscribeShelf(testKey, (data: ShelfData) => {
      expect(data).not.toBeNull();
      expect(data.current).not.toBeNull();
      expect(data.previous).toBeNull();
      expect(data.key).toBe(testKey);
      expect(data.current.alfa).toBe(10);
      expect(data.current.beta).toBe(20);
      expect(sub2.unsubscribeShelf()).toBeTruthy();
      expect(sub2.unsubscribeShelf()).toBeFalsy();
    });

    const testData = { alfa: 10, beta: 20 };
    setShelf(testKey, testData);
  });

  test('Should test for subscriptions after setting data', () => {
    const testKey = 'SHELF_TEST_KEY_3';
    const testData = { alfa: 10, beta: 20 };

    setShelf(testKey, testData);

    const sub1 = subscribeShelf(
      testKey,
      (data: ShelfData) => {
        expect(data).not.toBeNull();
        expect(data.current).not.toBeNull();
        expect(data.previous).toBeNull();
        expect(data.key).toBe(testKey);
        expect(data.current.alfa).toBe(10);
        expect(data.current.beta).toBe(20);
      },
      true,
    );

    const sub2 = subscribeShelf(
      testKey,
      (data: ShelfData) => {
        expect(data).not.toBeNull();
        expect(data.current).not.toBeNull();
        expect(data.previous).toBeNull();
        expect(data.key).toBe(testKey);
        expect(data.current.alfa).toBe(10);
        expect(data.current.beta).toBe(20);
      },
      true,
    );

    async () => {
      expect(sub1.unsubscribeShelf()).toBeTruthy();
      expect(sub1.unsubscribeShelf()).toBeFalsy();
      expect(sub2.unsubscribeShelf()).toBeTruthy();
      expect(sub2.unsubscribeShelf()).toBeFalsy();
    };
  });

  test('Should test changes in data', () => {
    const testKey = 'SHELF_TEST_KEY_4';
    const testDataFirst = { alfa: 10, beta: 20 };
    const testDataSecond = { zeta: 30, gamma: 40 };

    setShelf(testKey, testDataFirst);

    const sub1 = subscribeShelf(testKey, (data: ShelfData) => {
      expect(data).not.toBeNull();
      expect(data.current).not.toBeNull();
      expect(data.previous).not.toBeNull();
      expect(data.key).toBe(testKey);
      expect(data.current.zeta).toBe(30);
      expect(data.current.gamma).toBe(40);
      expect(sub1.unsubscribeShelf()).toBeTruthy();
      expect(sub1.unsubscribeShelf()).toBeFalsy();
    });

    const sub2 = subscribeShelf(testKey, (data: ShelfData) => {
      expect(data).not.toBeNull();
      expect(data.current).not.toBeNull();
      expect(data.previous).not.toBeNull();
      expect(data.key).toBe(testKey);
      expect(data.current.zeta).toBe(30);
      expect(data.current.gamma).toBe(40);
      expect(sub2.unsubscribeShelf()).toBeTruthy();
      expect(sub2.unsubscribeShelf()).toBeFalsy();
    });

    setShelf(testKey, testDataSecond);
  });

  test('Should test for invalid subscription key and callback', () => {
    const testKey = 'SHELF_TEST_KEY_5';
    const testDataFirst = { alfa: 10, beta: 20 };
    setShelf(testKey, testDataFirst);
    try {
      subscribeShelf(null as any, null as any, true);
    } catch (err: any) {
      expect(err.message).toBe('Invalid subscription key or callback');
    }
  });

  test('Should test for invalid set data', () => {
    const testKey = 'SHELF_TEST_KEY_6';
    const testData = { alfa: 10, beta: 20 };
    setShelf(null as any, testData);
    subscribeShelf(
      testKey,
      (data: ShelfData) => {
        expect(data).toBeNull();
      },
      true,
    );
  });

  test('Should test shelf filter subscription', (done) => {
    const testKey = 'SHELF_TEST_KEY_7';
    const testData = { alfa: 10, beta: 20 };
    setShelf(testKey, testData);
    const shelfFilterArgs = {
      subscriptionKey: testKey,
      eventFilter: (data: ShelfData) => {
        if (data.current.beta !== data.previous.beta) {
          return { shelfData: data, filterData: { beta: data.current.beta } };
        }
        return null;
      },
    };

    const sub1 = subscribeShelfFilter(shelfFilterArgs, (data: any) => {
      expect(data).not.toBeNull();
      if (data) {
        expect(data.filteredData).not.toBeNull();
        if (data.filteredData) {
          expect(data.filteredData.beta).toBe(30);
        }
        expect(data.shelfData).not.toBeNull();
      }
    });

    const sub2 = subscribeShelf(testKey, (data: ShelfData) => {
      expect(data).not.toBeNull();
    });

    setShelf(testKey, { alfa: 10, beta: 30 });

    const doUnsub = async () => {
      expect(sub1.unsubscribeShelf()).toBeTruthy();
      expect(sub1.unsubscribeShelf()).toBeFalsy();
      expect(sub2.unsubscribeShelf()).toBeTruthy();
      expect(sub2.unsubscribeShelf()).toBeFalsy();
      done();
    };
    doUnsub();
  });

  test('Should test shelf filter subscription with triggerNow', (done) => {
    const testKey = 'SHELF_TEST_KEY_8';
    const testData = { alfa: 10, beta: 20 };
    setShelf(testKey, testData);
    setShelf(testKey, { alfa: 10, beta: 30 });
    const shelfFilterArgs = {
      subscriptionKey: testKey,
      eventFilter: (data: ShelfData) => {
        if (data.current.beta !== data.previous.beta) {
          return { shelfData: data, filterData: { beta: data.current.beta } };
        }
        return null;
      },
    };

    const sub = subscribeShelfFilter(
      shelfFilterArgs,
      (data: any) => {
        expect(data).not.toBeNull();
        if (data) {
          expect(data.filteredData).not.toBeNull();
          if (data.filteredData) {
            expect(data.filteredData.beta).toBe(30);
          }
          expect(data.shelfData).not.toBeNull();
        }
      },
      true,
    );

    const doUnsub = async () => {
      expect(sub.unsubscribeShelf()).toBeTruthy();
      expect(sub.unsubscribeShelf()).toBeFalsy();
      done();
    };
    doUnsub();
  });

  test('Should test shelf filter with subscription before setting data', (done) => {
    const testKey = 'SHELF_TEST_KEY_9';
    const testData = { alfa: 10, beta: 20 };

    const shelfFilterArgs = {
      subscriptionKey: testKey,
      eventFilter: (data: ShelfData) => {
        if (data.previous == null && data.current.beta !== null) {
          return { shelfData: data, filterData: { beta: data.current.beta } };
        }
        return null;
      },
    };

    const sub = subscribeShelfFilter(shelfFilterArgs, (data: any) => {
      expect(data).not.toBeNull();
      if (data) {
        expect(data.filteredData).not.toBeNull();
        if (data.filteredData) {
          expect(data.filteredData.beta).toBe(30);
        }
        expect(data.shelfData).not.toBeNull();
      }
    });

    setShelf(testKey, testData);

    const doUnsub = async () => {
      expect(sub.unsubscribeShelf()).toBeTruthy();
      expect(sub.unsubscribeShelf()).toBeFalsy();
      done();
    };
    doUnsub();
  });

  test('Should test shelf filter for invalid subscription arguments', () => {
    try {
      subscribeShelfFilter(null as any, null as any);
    } catch (err: any) {
      expect(err).toBeDefined();
      expect(err.message).toBe('Invalid Shelf filter arguments.');
    }
  });

  test('Should test shelf filter for invalid subscription key', () => {
    try {
      subscribeShelfFilter({ subscriptionKey: null as any, eventFilter: (data) => {} }, (data) => {});
    } catch (err: any) {
      expect(err).toBeDefined();
      expect(err.message).toBe('Invalid subscription key or eventFilter or callback.');
    }
  });

  test('Should test shelf filter for invalid subscription eventfilter', () => {
    try {
      subscribeShelfFilter({ subscriptionKey: 'TEST_KEY', eventFilter: null as any }, (data) => {});
    } catch (err: any) {
      expect(err).toBeDefined();
      expect(err.message).toBe('Invalid subscription key or eventFilter or callback.');
    }
  });

  test('Should test shelf filter for invalid subscription callback', () => {
    try {
      subscribeShelfFilter({ subscriptionKey: 'TEST_KEY', eventFilter: (data) => {} }, null as any);
    } catch (err: any) {
      expect(err).toBeDefined();
      expect(err.message).toBe('Invalid subscription key or eventFilter or callback.');
    }
  });

  test('Should test clearing shelf', done => {
    const testKey = 'SHELF_TEST_KEY_10';
    const testData = { alfa: 10, beta: 20 };
    setShelf(testKey, testData);
    const shelfFilterArgs = {
      subscriptionKey: testKey,
      eventFilter: (data: ShelfData) => {
        return data;
      },
    };

    subscribeShelfFilter(shelfFilterArgs, (data: any) => {
      expect(data).toBeNull();
      if (data) {
        expect(data.filteredData).not.toBeNull();
        if (data.filteredData) {
          expect(data.filteredData.beta).toBe(30);
        }
        expect(data.shelfData).not.toBeNull();
      }
    });

    subscribeShelf(testKey, (data: ShelfData) => {
      expect(data).not.toBeNull();
      if (data) {
        expect(data.current).toBeNull();
        expect(data.previous).toBeNull();
        expect(data.key).toBe(testKey);
      }
    });

    expect(clearShelf(testKey)).toBeTruthy();
    expect(clearShelf(testKey)).toBeFalsy();
    expect(clearShelf(null as any)).toBeFalsy();
    done();

  });
});
