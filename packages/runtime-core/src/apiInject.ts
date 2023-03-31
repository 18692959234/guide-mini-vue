import { getCurrentInstance } from "./components";

export function provide (key, value) {
  const instance: any = getCurrentInstance();
  if (instance) {
    let { provides } = instance;
    const parentProvides = instance.parent.provides;
    // 1 provides('a', 1); provides('b', 1); instance.provides: {a: 1, b: 1},
    // 2 provides('a', 2): instance.provides: {a: 2}, 原型-> {a: 1, b: 1}
    // 3 provides('a', 3): instance.provides: {a: 3}, 原型-> {a: 2} -> {a: 1, b: 1}
    // 4 inject('a') parent.instance.provides[a] -> 3
    // 4 inject('b') parent.instance.provides[b] ?? parent.instance.provides.__proto__[b] ?? parent.instance.provides.__proto__.__proto__[b] -> 1
    if (provides === parentProvides) {
      provides = instance.provides = Object.create(parentProvides)
    }
    provides[key] = value;
  }
}


export function inject(key, defaultValue) {
  const currentInstance: any = getCurrentInstance();

  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides;

    if (key in parentProvides) {
      return parentProvides[key];
    }else if(defaultValue){
      if(typeof defaultValue === "function"){
        return defaultValue()
      }
      return defaultValue
    }
  }
}