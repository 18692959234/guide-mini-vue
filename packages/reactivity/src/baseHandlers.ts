import { extend, isObject } from "@guide-mini-vue/shared";
import { track, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly } from "./reactive";

const get = createGetter();
const set = createSetter();

const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

export function createGetter (isReadonly = false, shallow = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }
    const res = Reflect.get(target, key);

    if (shallow) {
      return res;
    }

    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }

    if (!isReadonly) {
      track(target, key);
    }
    return res;
  }
}

export function createSetter () {
  return function set(target, key, value) {
    if (value === Reflect.get(target, key)) return value;
    const result = Reflect.set(target, key, value);
    trigger(target, key);
    return result;
  }
}

export const mutableHandlers = {
  get,
  set
}

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`set失败，key${key}是不可写的`)
    return true
  },  
}

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {get: shallowReadonlyGet})