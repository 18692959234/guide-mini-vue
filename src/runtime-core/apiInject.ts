import { getCurrentInstance } from "./components";

export function provide (key, value) {
  const instance: any = getCurrentInstance();
  if (instance) {
    let { provides } = instance;
    const parentProvides = instance.parent.provides;
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