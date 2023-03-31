import {describe, it, expect, test, vi} from 'vitest';
import { effect } from '../src/effect';
import { reactive } from '../src/reactive';
import { isRef, ref, unRef, proxyRefs } from '../src/ref';
describe('reactivity/ref', () => {
  it('should hold a value', () => {
    const a = ref(1)
    expect(a.value).toBe(1)
    a.value = 2
    expect(a.value).toBe(2)
  })

  it('should be reactive', () => {
    const a = ref(1)
    let dummy
    let calls = 0
    effect(() => {
      calls++
      dummy = a.value
    })
    expect(calls).toBe(1)
    expect(dummy).toBe(1)
    a.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
    // same value should not trigger
    a.value = 2
    expect(calls).toBe(2)
  })

  it('should make nested properties reactive', () => {
    const a = ref({
      count: 1
    })
    let dummy
    effect(() => {
      dummy = a.value.count
    })
    expect(dummy).toBe(1)
    a.value.count = 2
    expect(dummy).toBe(2)
  })

  it('ref/isRef', () => {
    const a = ref({
      count: 1
    })
    const b = reactive({
      delete: true
    })

    expect(isRef(a)).toBe(true);
    expect(isRef(b)).toBe(false)
  })

  it('ref/unRef', () => {
    const a = ref(3)
    expect(unRef(a)).toBe(3);
    expect(unRef(1)).toBe(1)
  })

  it('ref/proxyRefs', () => {
    const user = {
      a: 1,
      b: ref(10)
    }
    const proxyUser = proxyRefs(user)
    expect(user.b.value).toBe(10);
    expect(proxyUser.a).toBe(1);
    expect(proxyUser.b).toBe(10);

    proxyUser.b = 20;

    expect(user.b.value).toBe(20);
    expect(proxyUser.b).toBe(20);

    proxyUser.b = ref(1);
    expect(user.b.value).toBe(1);
    expect(proxyUser.b).toBe(1);
  })
})