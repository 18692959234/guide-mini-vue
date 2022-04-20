import { describe, it, expect, vi, test } from "vitest"
import { readonly, isReadonly, isProxy } from '../reactive'

describe('happy path', () => {
  it('readonly', () => {
    const original = {foo: 1,baz: {baz:2}}
    const wrapped = readonly(original);
    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);
  })

  it('is readonly', () => {
    const original = {foo: 1,baz: {baz:2}}
    const wrapped = readonly(original);
    expect(isReadonly(wrapped)).toBe(true);
    expect(isProxy(wrapped)).toBe(true);
  })

  it('warning when readonly set', () => {
    console.warn = vi.fn();
    const foo = {foo: 1};
    const wrapped = readonly(foo);
    wrapped.foo = 2;
    expect(console.warn).toBeCalled();
  })

  test('nested readonly', () => {
    const original = {
      nested: {
        foo: 1
      },
      array: [{ bar: 2 }]
    }
    const observed = readonly(original)
    expect(isReadonly(observed.nested)).toBe(true)
    expect(isReadonly(observed.array)).toBe(true)
    expect(isReadonly(observed.array[0])).toBe(true)
  })
})