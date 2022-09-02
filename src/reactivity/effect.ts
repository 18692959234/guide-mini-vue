import { extend } from "../shared";
let activeEffect, shouldTrack;
export class ReactiveEffect {
  private _fn;
  onStop?: () => void;
  deps = [];
  /**@description active 用于阻止多次stop的频繁操作 */
  active = true;
  constructor (fn, public scheduler?) {
    this._fn = fn;
  }

  run () {
    if (!this.active) {
      return this._fn();
    }
    shouldTrack = true;
    activeEffect = this;
    const result = this._fn();
    shouldTrack = false;
    activeEffect = undefined;
    return result;
  }

  stop () {
    if (this.active) {
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
    
  }
}

function cleanupEffect (effect) {
  effect.deps.forEach(dep => {
    dep.delete(effect);
  })
  effect.deps.length = 0;
}

const targetMap = new Map();
export function track (target, key) {
  if (!isTracking()) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  trackEffect(dep);
}

export function trackEffect (dep) {
  if (dep.has(activeEffect)) return;
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

/**
 * @name 是否需要收集依赖
 */
export function isTracking () {
  return shouldTrack && activeEffect !== undefined;
}


export function trigger (target, key) {
  const depsMap = targetMap.get(target);
  const deps = depsMap.get(key) || [];
  triggerEffect(deps);
}

export function triggerEffect (deps) {
  for (const effect of deps) {
    if (effect !== activeEffect) {
      if (effect.scheduler) {
        effect.scheduler();
      } else {
        effect.run();
      }
    }
  }
}

export function stop (runner) {
  runner.effect.stop();
}

export function effect (fn, options:any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);
  extend(_effect, options)
  _effect.run();
  const runner:any = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}