import {clearMap, deleteMapEntry, getMap, loadMap, MapData, setMap, subscribeMap} from "../../map/map-manager";

describe("Test MAP", () => {

    const sampleTestData = {alfa: 10, beta: 20, gamma: 50 };

    test("Test loading map data", () => {
        const testMapKey = 'TEST_MAP_KEY_1';
        loadMap(testMapKey, {...sampleTestData});

        const map: any = getMap(testMapKey);

        expect(map).not.toBeNull();
        expect(map.get('alfa')).toBe(10);
        expect(map.get('beta')).toBe(20);
        expect(map.get('gamma')).toBe(50);
    });

    test("Test map subscription with triggerNow", done => {
        const testMapKey = 'TEST_MAP_KEY_2';
        loadMap(testMapKey, {...sampleTestData});

        subscribeMap(testMapKey, (mapData: MapData) => {

            expect(mapData).not.toBeNull();
            expect(mapData.current).toBeNull();
            expect(mapData.previous).toBeNull();
            expect(mapData.key).toBeNull();
            expect(mapData.map).not.toBeNull();
            expect(mapData.map).not.toBeUndefined();
            if (mapData.map) {
                expect(mapData.map.get('alfa')).toBe(10);
                expect(mapData.map.get('beta')).toBe(20);
                expect(mapData.map.get('gamma')).toBe(50);
            }
            done();
        }, true);
    });

    test("Test setting map data", done => {
        const testMapKey = 'TEST_MAP_KEY_3';
        loadMap(testMapKey, {...sampleTestData});

        const sub = subscribeMap(testMapKey, (mapData: MapData) => {

            expect(mapData).not.toBeNull();
            expect(mapData.current).not.toBeNull();
            expect(mapData.previous).not.toBeNull();
            expect(mapData.key).not.toBeNull();
            expect(mapData.key).toBe('alfa');
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
        }, 100)
    });

    test("Test deleting map entry", done => {
        const testMapKey = 'TEST_MAP_KEY_4';
        loadMap(testMapKey, {...sampleTestData});

        const sub = subscribeMap(testMapKey, (mapData: MapData) => {

            expect(mapData).not.toBeNull();
            expect(mapData.current).toBeNull();
            expect(mapData.previous).not.toBeNull();
            expect(mapData.key).not.toBeNull();
            expect(mapData.key).toBe('gamma');
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

    test("Test clearig map ", done => {
        const testMapKey = 'TEST_MAP_KEY_5';
        loadMap(testMapKey, {...sampleTestData});

        const sub = subscribeMap(testMapKey, (mapData: MapData) => {

            expect(mapData).not.toBeNull();
            expect(mapData.current).toBeNull();
            expect(mapData.previous).toBeNull();
            expect(mapData.key).toBeNull();
            expect(mapData.map).toBeNull();
            expect(sub.unsubscribeMap()).toBeTruthy();
            expect(sub.unsubscribeMap()).toBeFalsy();
            done();
        });

        clearMap(testMapKey);
    });

    test("Test subscription after map set", done => {
        const testMapKey = 'TEST_MAP_KEY_6';     
        
        setMap(testMapKey, 'zeta', 70);

        const sub = subscribeMap(testMapKey, (mapData: MapData) => {
            expect(mapData).not.toBeNull();
            expect(mapData.current).toBeNull();
            expect(mapData.previous).toBeNull();
            expect(mapData.key).toBeNull();
            expect(mapData.map).not.toBeNull();
            if (mapData.map) {
                expect(mapData.map.get('zeta')).toBe(70);                
            }
        }, true);

        const doUnsub = async () => {
            expect(sub.unsubscribeMap()).toBeTruthy();
            expect(sub.unsubscribeMap()).toBeFalsy();
            done();
        };

        doUnsub();
    });

    test("Test subscription before map set", done => {
        const testMapKey = 'TEST_MAP_KEY_7';    

        const sub = subscribeMap(testMapKey, (mapData: MapData) => {
            expect(mapData).not.toBeNull();
            expect(mapData.current).toBe(90);
            expect(mapData.previous).toBeUndefined();
            expect(mapData.key).toBe('gamma');
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

    test("Test map load after map set", done => {
        const testMapKey = 'TEST_MAP_KEY_8';             
        setMap(testMapKey, 'zeta', 70);        
        const sub = subscribeMap(testMapKey, (mapData: MapData) => {
            expect(mapData).not.toBeNull();
            expect(mapData.current).toBeNull();
            expect(mapData.previous).toBeNull();
            expect(mapData.key).toBeNull();
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

        loadMap(testMapKey, {'delta': 80});

        doUnsub();
    });

});