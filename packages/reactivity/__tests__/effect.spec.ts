import { describe, test, expect, it, vi } from 'vitest';
import { reactive } from '../src/reactive';
import { effect, stop } from '../src/effect'


describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10
    })
    let nextAge;

    // 首先创建一个reactiveEffect对象，执行实例化对象上的run方法（也就是把effect包裹的函数执行一次），
    // 执行函数后，会触发reactive的get操作，并会把当前的reactiveEffect实例化对象添加到依赖收集里面，
    // 在set的时候，会取出所有的依赖收集，并且执行reactiveEffect实例化对象上的run方法
    // 在同一个effect函数里，多个reactive对象 都对应当前effect方法
    effect(() => {
      nextAge = user.age + 1;
    })

    expect(nextAge).toBe(11);

    // // update
    user.age++;

    expect(nextAge).toBe(12);
  })

  it('effect return runner ', () => {
    let foo = 10;
    const runner = effect(() => {
      foo++;
      return 'foo'
    })
    // runner的本质就是在调用effect函数之后，最终返回出当前effect接受的函数，并绑定好上下文
    expect(foo).toBe(11);
    const r = runner();
    expect(foo).toBe(12)
    expect(r).toBe('foo')
  })

  it('scheduler', () => {
    let dummy
    let run: any
    // scheduler的本质在于执行了effect之后，后续的trigger操作调用的都是scheduler而不是run方法本身
    // 
    const scheduler = vi.fn(() => {
      run = runner
    })
    const obj = reactive({ foo: 1 })
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      { scheduler }
    )
    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)
    // should be called on first trigger
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1)
    // should not run yet
    expect(dummy).toBe(1)
    // manually run
    run()
    // should have run
    expect(dummy).toBe(2)
  })


  it('stop', () => {
    let dummy
    const obj = reactive({ prop: 1 })
    const runner = effect(() => {
      dummy = obj.prop
    })
    obj.prop = 2
    expect(dummy).toBe(2)
    // stop方法其实是在执行effect，且实例化reactiveEffect之后，把实例化的对象挂载到activeEffect身上，并且由实例化的对象提供出stop方法，内部去清理所有的依赖。
    // 并且在第一次执行run方法之后，会触发reactive的get，在track方法里去判断是否需要依赖收集 
    stop(runner)
    // obj.prop = 3
    obj.prop++;
    expect(dummy).toBe(2)

    // stopped effect should still be manually callable
    runner()
    expect(dummy).toBe(3)
  })


  it('events: onStop', () => {
    const onStop = vi.fn()
    const runner = effect(() => {}, {
      onStop
    })

    stop(runner)
    // onstop其实就是在stop方法里去判断有无这个方法 有就执行
    expect(onStop).toHaveBeenCalled()
  })


})

describe('循环引用', () => {
  it('循环1', () => {
    const name = reactive({ a: 1, b: 2 });
    const fn = vi.fn(() => {
      name.a = (name.b++);
    })
    effect(fn);
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('测试vue的用例', () => {
      let hasDummy, getDummy
      const obj = reactive({ prop: 'value' })
  
      const getSpy = vi.fn(() => (getDummy = obj.prop))
      const hasSpy = vi.fn(() => (hasDummy = 'prop' in obj))
      effect(getSpy)
      effect(hasSpy)
  
      expect(getDummy).toBe('value')
      expect(hasDummy).toBe(true)
      obj.prop = 'value'
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(hasSpy).toHaveBeenCalledTimes(1)
      expect(getDummy).toBe('value')
      expect(hasDummy).toBe(true)
  })
})