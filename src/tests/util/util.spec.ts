import { handleJsonParse, handleJsonStringify } from '../../util/util';

describe('Test Util', () => {

    const sampleTestDataParse = '{"alfa":10,"delta":20,"theta":30}';
    const sampleTestDataStringify = {alfa: 10, delta: 20, theta: 30};

    test('Test parsing JSON string.', () => {

        const result = handleJsonParse(sampleTestDataParse);
        expect(result).not.toBeNull();
        if (result) {
            expect(result.alfa).toBeDefined();
            expect(result.delta).toBeDefined();
            expect(result.theta).toBeDefined();
            expect(result.alfa).toBe(10);
            expect(result.delta).toBe(20);
            expect(result.theta).toBe(30);
        }
    });

    test('Test parsing JSON string with invalid data.', () => {

        const result = handleJsonParse('{"alfa": 10, "delta": 20, "theta": 30');
        expect(result).toBeNull();
        
    });

    test('Test parsing JSON string with null', () => {

        const result = handleJsonParse(null);
        expect(result).toBeNull();
        
    });

    test('Test JSON stringify.', () => {
        const result: string | null = handleJsonStringify(sampleTestDataStringify);
        expect(result).not.toBeNull();
        expect(result).toBe(sampleTestDataParse);
    });

    test('Test JSON stringify with null.', () => {
        const result: string | null = handleJsonStringify(null);
        expect(result).toBeNull();
    });

    test('Test JSON stringify with string data.', () => {
        const result: string | null = handleJsonStringify('Hello Sitar');
        expect(result).toBe('Hello Sitar');
    });

    test('Test JSON stringify with boolean data.', () => {
        const result: string | null = handleJsonStringify(false);
        expect(result).toBe('false');
    });


});