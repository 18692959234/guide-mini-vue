import { isString } from "../shared/index";
import { ShapeFlags } from "../shared/ShapeFlags";

export function createVNode (type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    el: null,
    shapeFlag: getShapeFlag(type),
  }

  // 这里设置shapeFlag 是为了 在处理children的时候方便 判断类型
  if (isString(children)) {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
  }

  return vnode;
}

function getShapeFlag(type: any) {
  return isString(type) ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT;
}
