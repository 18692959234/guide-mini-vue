import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./components"

export function render (vnode, container) {
  patch(vnode, container)
}

function patch (vnode, container) {
  const { shapeFlag } = vnode;
  if (shapeFlag & ShapeFlags.ELEMENT) {
    processElement(vnode, container)
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    processComponent(vnode, container)
  }
}

function processElement(vnode, container) {
  mountElement(vnode, container)  
}

function mountElement (vnode, container) {
  const { props, children, type, shapeFlag } = vnode;
  
  const el = (vnode.el = document.createElement(type));

  // children
  if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el)
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

function mountChildren (vnode, container) {
  vnode.children.forEach(ele => {
    patch(ele, container);
  })
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)
}
function mountComponent(initialVNode: any, container) {
  // 创建组件实例
  const instance = createComponentInstance(initialVNode);

  // 初始化组件
  setupComponent(instance);
  setupRenderEffect(instance, initialVNode, container)
}

function setupRenderEffect(instance, initialVNode, container) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);
  patch(subTree, container);
  initialVNode.el = subTree.el;
}

