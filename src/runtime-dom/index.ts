import { createRenderer } from "../runtime-core/renderer";

function createElement (type) {
  return document.createElement(type);
}

function patchProp (el, key, prevValue, nextValue) {
    const isOn = (key) => /^on[A-Z]/.test(key)
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, nextValue);
    } else {
      if (nextValue != null) {
        el.setAttribute(key, nextValue)
      } else {
        el.removeAttribute(key);
      }
    }
}

function insert (child, parent, anchor) {
  parent.insertBefore(child, anchor || null);
}

function remove (el) {
  const parent = el.parentNode;
  if (parent) {
    parent.removeChild(el);
  }
}

function setElementText (el, text) {
  el.textContent = text;
}

const renderer:any = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText
})

export function createApp (...args) {
  return renderer.createApp(...args)
}

export * from '../runtime-core'