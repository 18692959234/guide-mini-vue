import { createRenderer } from "../runtime-core/renderer";

function createElement (type) {
  return document.createElement(type);
}

function patchProp (el, key, prevValue, nextValue) {
    const isOn = (key) => /^on[A-Z]/.test(key)
    console.log(prevValue, nextValue)
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, nextValue);
    } else {
      console.log(nextValue != null)
      if (nextValue != null) {
        el.setAttribute(key, nextValue)
      } else {
        el.removeAttribute(key);
      }
    }
}

function insert (el, parent) {
  parent.append(el);
}

const renderer:any = createRenderer({
  createElement,
  patchProp,
  insert
})

export function createApp (...args) {
  return renderer.createApp(...args)
}

export * from '../runtime-core'