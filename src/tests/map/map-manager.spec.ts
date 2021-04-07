import { clearMap, deleteMapEntry, getMap, loadMap, MapData, setMap, subscribeMap } from '../../map/map-manager';

describe('Test MAP', () => {
  const sampleTestData = { alfa: 10, beta: 20, gamma: 50 };

  test('Test loading map data', () => {
    const testMapKey = 'TEST_MAP_KEY_1';
    loadMap(testMapKey, { ...sampleTestData });

    const map: any = getMap(testMapKey);

    expect(map).not.toBeNull();
    expect(map.get('alfa')).toBe(10);
    expect(map.get('beta')).toBe(20);
    expect(map.get('gamma')).toBe(50);
  });

  test('Test map subscription with triggerNow', (done) => {
    const testMapKey = 'TEST_MAP_KEY_2';
    loadMap(testMapKey, { ...sampleTestData });

    subscribeMap(
      testMapKey,
      (mapData: MapData) => {
        expect(mapData).not.toBeNull();
        expect(mapData.current).toBeNull();
        expect(mapData.previous).toBeNull();
        expect(mapData.mapKey).toBeNull();
        expect(mapData.map).not.toBeNull();
        expect(mapData.map).not.toBeUndefined();
        if (mapData.map) {
          expect(mapData.map.get('alfa')).toBe(10);
          expect(mapData.map.get('beta')).toBe(20);
          expect(mapData.map.get('gamma')).toBe(50);
        }
        done();
      },
      true,
    );
  });

  test('Test setting map data', (done) => {
    const testMapKey = 'TEST_MAP_KEY_3';
    loadMap(testMapKey, { ...sampleTestData });

    const sub = subscribeMap(testMapKey, (mapData: MapData) => {
      expect(mapData).not.toBeNull();
      expect(mapData.current).not.toBeNull();
      expect(mapData.previous).not.toBeNull();
      expect(mapData.mapKey).not.toBeNull();
      expect(mapData.mapKey).toBe('alfa');
      expect(mapData.current).toBe(100);
      expect(mapData.previous).toBe(10);
      expect(mapData.map).not.toBeNull();
      expect(mapData.map).not.toBeUndefined();
      if (mapData.map) {
        expect(mapData.map.get('alfa')).toBe(100);
        expect(mapData.map.get('beta')).toBe(20);
        expect(mapData.map.get('gamma')).toBe(50);
      }
      done();
    });

    setMap(testMapKey, 'alfa', 100);

    setTimeout(() => {
      expect(sub.unsubscribeMap()).toBeTruthy();
      expect(sub.unsubscribeMap()).toBeFalsy();
      done();
    }, 100);
  });

  test('Test deleting map item', (done) => {
    const testMapKey = 'TEST_MAP_KEY_4';
    loadMap(testMapKey, { ...sampleTestData });

    const sub = subscribeMap(testMapKey, (mapData: MapData) => {
      expect(mapData).not.toBeNull();
      expect(mapData.current).toBeNull();
      expect(mapData.previous).not.toBeNull();
      expect(mapData.mapKey).not.toBeNull();
      expect(mapData.mapKey).toBe('gamma');
      expect(mapData.current).toBeNull();
      expect(mapData.previous).toBe(50);
      expect(mapData.map).not.toBeNull();
      expect(mapData.map).not.toBeUndefined();
      if (mapData.map) {
        expect(mapData.map.get('alfa')).toBe(10);
        expect(mapData.map.get('beta')).toBe(20);
        expect(mapData.map.get('gamma')).toBeUndefined();
      }
      expect(sub.unsubscribeMap()).toBeTruthy();
      expect(sub.unsubscribeMap()).toBeFalsy();
      done();
    });

    deleteMapEntry(testMapKey, 'gamma');
  });

  test('Test clearig map ', (done) => {
    const testMapKey = 'TEST_MAP_KEY_5';
    loadMap(testMapKey, { ...sampleTestData });

    const sub = subscribeMap(testMapKey, (mapData: MapData) => {
      expect(mapData).not.toBeNull();
      expect(mapData.current).toBeNull();
      expect(mapData.previous).toBeNull();
      expect(mapData.mapKey).toBeNull();
      expect(mapData.map).toBeNull();
      expect(sub.unsubscribeMap()).toBeTruthy();
      expect(sub.unsubscribeMap()).toBeFalsy();
      done();
    });

    clearMap(testMapKey);
  });

  test('Test subscription after map set', (done) => {
    const testMapKey = 'TEST_MAP_KEY_6';

    setMap(testMapKey, 'zeta', 70);

    const sub = subscribeMap(
      testMapKey,
      (mapData: MapData) => {
        expect(mapData).not.toBeNull();
        expect(mapData.current).toBeNull();
        expect(mapData.previous).toBeNull();
        expect(mapData.mapKey).toBeNull();
        expect(mapData.map).not.toBeNull();
        if (mapData.map) {
          expect(mapData.map.get('zeta')).toBe(70);
        }
      },
      true,
    );

    const doUnsub = async () => {
      expect(sub.unsubscribeMap()).toBeTruthy();
      expect(sub.unsubscribeMap()).toBeFalsy();
      done();
    };

    doUnsub();
  });

  test('Test subscription before map set', (done) => {
    const testMapKey = 'TEST_MAP_KEY_7';

    const sub = subscribeMap(testMapKey, (mapData: MapData) => {
      expect(mapData).not.toBeNull();
      expect(mapData.current).toBe(90);
      expect(mapData.previous).toBeUndefined();
      expect(mapData.mapKey).toBe('gamma');
      expect(mapData.map).not.toBeNull();
      if (mapData.map) {
        expect(mapData.map.get('gamma')).toBe(90);
      }
    });

    setMap(testMapKey, 'gamma', 90);

    const doUnsub = async () => {
      expect(sub.unsubscribeMap()).toBeTruthy();
      expect(sub.unsubscribeMap()).toBeFalsy();
      done();
    };

    doUnsub();
  });

  test('Test map load after map set', (done) => {
    const testMapKey = 'TEST_MAP_KEY_8';
    setMap(testMapKey, 'zeta', 70);
    const sub = subscribeMap(testMapKey, (mapData: MapData) => {
      expect(mapData).not.toBeNull();
      expect(mapData.current).toBeNull();
      expect(mapData.previous).toBeNull();
      expect(mapData.mapKey).toBeNull();
      expect(mapData.map).not.toBeNull();
      if (mapData.map) {
        expect(mapData.map.get('zeta')).toBe(70);
        expect(mapData.map.get('delta')).toBe(80);
      }
    });

    const doUnsub = async () => {
      expect(sub.unsubscribeMap()).toBeTruthy();
      expect(sub.unsubscribeMap()).toBeFalsy();
      done();
    };

    loadMap(testMapKey, { delta: 80 });

    doUnsub();
  });

  test('Test duplicate map set.', (done) => {
    const testMapKey = 'TEST_MAP_KEY_9';
    setMap(testMapKey, 'theta', 70);
    const sub = subscribeMap(testMapKey, (mapData: MapData) => {
      expect(mapData).not.toBeNull();
      expect(mapData.current).toBeNull();
      expect(mapData.previous).toBeNull();
      expect(mapData.mapKey).toBeNull();
      expect(mapData.map).not.toBeNull();
      if (mapData.map) {
        expect(mapData.map.get('zeta')).toBe(70);
        expect(mapData.map.get('delta')).toBe(80);
      }
    });

    setMap(testMapKey, 'theta', 70);

    const doUnsub = async () => {
      expect(sub.unsubscribeMap()).toBeTruthy();
      expect(sub.unsubscribeMap()).toBeFalsy();
      done();
    };

    doUnsub();
  });

  test('Test setting map with invalid subscription key and map key.', () => {
    const testMapKey = 'TEST_MAP_KEY_10';
    try {
      setMap(null as any, 'alfa', 70);
    } catch (err: any) {
      if (err) {
        expect(err.message).toBe('Invalid subscription key or map key.');
      }
    }

    try {
      setMap(testMapKey, null as any, 70);
    } catch (err: any) {
      if (err) {
        expect(err.message).toBe('Invalid subscription key or map key.');
      }
    }
  });

  test('Test loading map with invalid subscription key and data.', () => {
    const testMapKey = 'TEST_MAP_KEY_11';
    try {
      loadMap(null as any, {alfa: 70});
    } catch (err: any) {
      if (err) {
        expect(err.message).toBe('Invalid subscription key or data.');
      }
    }

    try {
      loadMap(testMapKey, null as any);
    } catch (err: any) {
      if (err) {
        expect(err.message).toBe('Invalid subscription key or data.');
      }
    }
  });

  test('Test subscribing with invalid subscription key and callback.', () => {
    const testMapKey = 'TEST_MAP_KEY_12';
    try {
      subscribeMap(null as any, ()=>{});
    } catch (err: any) {
      if (err) {
        expect(err.message).toBe('Invalid subscription key or callback.');
      }
    }

    try {
      subscribeMap(testMapKey, null as any);
    } catch (err: any) {
      if (err) {
        expect(err.message).toBe('Invalid subscription key or callback.');
      }
    }
  });

  test('Test deleting entry with invalid subscription key and map key.', () => {
    const testMapKey = 'TEST_MAP_KEY_13';
    try {
      deleteMapEntry(null as any, 'alfa');
    } catch (err: any) {
      if (err) {
        expect(err.message).toBe('Invalid subscription key or map key.');
      }
    }

    try {
      deleteMapEntry(testMapKey, null as any);
    } catch (err: any) {
      if (err) {
        expect(err.message).toBe('Invalid subscription key or map key.');
      }
    }
  });
});
