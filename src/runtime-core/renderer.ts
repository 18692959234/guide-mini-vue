import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./components"
import { Fragment, Text } from "./vnode";

export function render (vnode, container) {
  patch(vnode, container, null)
}

function patch (vnode, container, parentComponent) {
  const { type, shapeFlag } = vnode;
  
  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent);
      break;
    case Text:
      processText(vnode, container);
      break;
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container, parentComponent)
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container, parentComponent)
      }
      break;
  }
}

function processFragment(vnode, container, parentComponent) {
  mountChildren(vnode, container, parentComponent);
}

function processText(vnode: any, container: any) {
  const text = vnode.children;
  const textNode = (vnode.el = document.createTextNode(text));
  container.append(textNode);
}

function processElement(vnode, container, parentComponent) {
  mountElement(vnode, container, parentComponent)  
}

function mountElement (vnode, container, parentComponent) {
  const { props, children, type, shapeFlag } = vnode;
  
  const el = (vnode.el = document.createElement(type));

  // children
  if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el, parentComponent)
  } else if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.innerText = children;
  }
  
  const isOn = (key) => /^on[A-Z]/.test(key)
  // props
  Object.keys(props).forEach(key => {
    const val = props[key];
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, props[key]);
    } else {
      el.setAttribute(key, val)
    }
  })


  container.append(el);
}

function mountChildren (vnode, container, parentComponent) {
  vnode.children.forEach(ele => {
    patch(ele, container, parentComponent);
  })
}

function processComponent(vnode: any, container: any, parentComponent) {
  mountComponent(vnode, container, parentComponent)
}
function mountComponent(initialVNode: any, container, parentComponent) {
  // 创建组件实例
  const instance = createComponentInstance(initialVNode, parentComponent);

  // 初始化组件
  setupComponent(instance);
  setupRenderEffect(instance, initialVNode, container)
}

function setupRenderEffect(instance, initialVNode, container) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);
  patch(subTree, container, instance);
  initialVNode.el = subTree.el;
}
