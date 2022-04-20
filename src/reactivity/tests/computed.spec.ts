import { describe, test, expect, it, vi } from 'vitest';
import { computed } from '../computed';
import { reactive } from '../reactive';

describe('computed', () => {
  // 只需要返回一个实例化的computedRefImpl对象，并且在computedRefImpl身上挂载上一个value的get属性
  // 把接受到的方法执行并返回出去
  it('should return updated value', () => {
    const value = reactive({foo: 1})
    const cValue = computed(() => value.foo)
    expect(cValue.value).toBe(1)
  })

  
  it('should compute lazily', () => {
    const value = reactive({foo: 1})
    const getter = vi.fn(() => value.foo)
    const cValue = computed(getter)

    // lazy
    expect(getter).not.toHaveBeenCalled()

    expect(cValue.value).toBe(1)
    expect(getter).toHaveBeenCalledTimes(1)

    // 创建_dirty标记，默认值为true，在获取value属性的时候判断dirty
    // 首次获取之后，把dirty设置为false
    // should not compute again
    expect(cValue.value).toBe(1)
    expect(getter).toHaveBeenCalledTimes(1)


    // reactive对象会在set的时候，重新去执行收集好的依赖
    // 但由于没有effect，所以此时的reactive没有任何的依赖
    // 需要在实例化ComputedRefImpl的时候，创建ReactiveEffect
    // 并且在获取value属性的时候，把原有的方法执行，改为effect身上的run方法执行，由此去收集依赖
    // // should not compute until needed
    value.foo = 2
    expect(getter).toHaveBeenCalledTimes(1)

    // 由于_ditry在获取过value之后就设置为false，所以computed里面的方法一直不会执行
    // 这个时候给ReactiveEffect传入第二个参数，也就是之前写过的scheduler
    // scheduler的作用是响应式对象更新会去触发，所以在scheduler里面去更改_ditry
    // // now it should compute
    expect(cValue.value).toBe(2)
    expect(getter).toHaveBeenCalledTimes(2)

    // // should not compute again
    cValue.value
    expect(getter).toHaveBeenCalledTimes(2)
  })
})
