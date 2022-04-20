import {reactive, isReactive, isProxy} from '../reactive';
import {describe, it, expect, test} from 'vitest';
describe('reactive', () => {
  it('happy path', () => {
    const original = {foo: 1};
    const observed = reactive(original);
    expect(original).not.toBe(observed);
    expect(original.foo).toBe(1);
    expect(isReactive(observed)).toBe(true);
    expect(isProxy(observed)).toBe(true);
    expect(isReactive(original)).toBe(false);
  })

  test('nested reactives', () => {
    const original = {
      nested: {
        foo: 1
      },
      array: [{ bar: 2 }]
    }
    const observed = reactive(original)
    expect(isReactive(observed.nested)).toBe(true)
    expect(isReactive(observed.array)).toBe(true)
    expect(isReactive(observed.array[0])).toBe(true)
  })

})