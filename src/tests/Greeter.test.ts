import { handleJsonParse } from '../index';

test('My Greeter', () => {
  expect(handleJsonParse('100')).toBe(100);
});
