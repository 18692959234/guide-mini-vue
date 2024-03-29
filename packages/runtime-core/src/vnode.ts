import { ShapeFlags, isString } from "@guide-mini-vue/shared";

export const Fragment = Symbol('Fragment');
export const Text = Symbol('Text');

export {
  createVNode as createElementVNode
}

export function createVNode (type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    component: null,
    el: null,
    key: props && props.key, 
    shapeFlag: getShapeFlag(type),
  }

  if (isString(children)) {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
  }

  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === 'object') {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN;
    }
  }

  return vnode;
}

function getShapeFlag(type: any) {
  return isString(type) ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT;
}


export function createTextVNode (text: string) {
  return createVNode(Text, {}, text)
}