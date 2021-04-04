import { CustomSet } from '../../set/custom-set';

describe('Test Custom Set', () => {
  test('Test Set constructor', () => {
    const set = new CustomSet(['red', 'green', 'blue']);
    const items = set.list;
    expect(items).not.toBeNull();
    expect(items.length).toBe(3);
    expect(items[0]).toBe('red');
    expect(items[1]).toBe('green');
    expect(items[2]).toBe('blue');
  });

  test('Test adding single elements', () => {
    const set = new CustomSet();
    set.add('red');
    expect(set.list).toHaveLength(1);
    set.add('green');
    expect(set.list).toHaveLength(2);
    set.add('blue');
    expect(set.list).toHaveLength(3);
  });

  test('Test adding single objects', () => {
    const set = new CustomSet();
    set.add({ alfa: 10 });
    expect(set.list).toHaveLength(1);
    set.add({ beta: 20 });
    expect(set.list).toHaveLength(2);
    set.add({ gamma: 30 });
    expect(set.list).toHaveLength(3);
  });

  test('Test adding multiple elements', () => {
    const set = new CustomSet();
    set.add(['red', 'white', 'orange']);
    expect(set.list).toHaveLength(3);
    set.add(['green', 'blue', 'black']);
    expect(set.list).toHaveLength(6);
    set.add(['yellow', 'white', 'blue']);
    expect(set.list).toHaveLength(7);
  });

  test('Test adding multiple objects', () => {
    const set = new CustomSet();
    set.add([{ alfa: 10 }, { beta: 20 }]);
    expect(set.list).toHaveLength(2);
    set.add([{ gamma: 30 }, { delta: 40 }]);
    expect(set.list).toHaveLength(4);
    set.add([{ beta: 20 }, { theta: 50 }]);
    expect(set.list).toHaveLength(5);
  });

  test('Test removing single elements', () => {
    const set = new CustomSet(['red', 'green', 'blue']);
    set.remove('red');
    expect(set.list).toHaveLength(2);
    set.remove('green');
    expect(set.list).toHaveLength(1);
    set.remove('green');
    expect(set.list).toHaveLength(1);
    set.remove('blue');
    expect(set.list).toHaveLength(0);
  });

  test('Test removing single objects', () => {
    const set = new CustomSet([{ alfa: 10 }, { beta: 20 }, { gamma: 30 }]);
    set.remove({ alfa: 10 });
    expect(set.list).toHaveLength(2);
    set.remove({ beta: 20 });
    expect(set.list).toHaveLength(1);
    set.remove({ gamma: 30 });
    expect(set.list).toHaveLength(0);
  });

  test('Test adding multiple elements', () => {
    const set = new CustomSet(['red', 'white', 'orange', 'green', 'blue', 'black', 'yellow']);
    set.remove(['red', 'white']);
    expect(set.list).toHaveLength(5);
    set.remove(['green', 'blue']);
    expect(set.list).toHaveLength(3);
    set.remove(['yellow', 'white', 'blue']);
    expect(set.list).toHaveLength(2);
  });

  test('Test removing multiple objects', () => {
    const set = new CustomSet([{ alfa: 10 }, { beta: 20 }, { gamma: 30 }, { delta: 40 }, { theta: 50 }]);
    set.remove([{ alfa: 10 }, { beta: 20 }]);
    expect(set.list).toHaveLength(3);
    set.remove([{ gamma: 30 }, { delta: 40 }]);
    expect(set.list).toHaveLength(1);
    set.remove([{ beta: 20 }, { theta: 60 }]);
    expect(set.list).toHaveLength(1);
  });
});
