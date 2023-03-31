import {shallowReadonly, isReadonly} from '../src/reactive';
import {describe, it, expect, test, vi} from 'vitest';
describe('shallowReadonly', () => {
  test('should not make non-readonly properties readonly', () => {
    const props = shallowReadonly({ n: { foo: 1 } })
    expect(isReadonly(props)).toBe(true)
    expect(isReadonly(props.n)).toBe(false)
  })

  it('warning when readonly set', () => {
    console.warn = vi.fn();
    const foo = {foo: 1};
    const wrapped = shallowReadonly(foo);
    wrapped.foo = 2;
    expect(console.warn).toBeCalled();
  })
})