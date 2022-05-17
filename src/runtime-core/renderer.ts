import { effect } from "../reactivity/effect";
import { clog, EMPTY_OBJ } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./components"
import { createAppApi } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {

  const { createElement: hostCreateElement, patchProp: hostPatchProps, insert: hostInsert } = options;

  function render(vnode, container) {
    patch(null, vnode, container, null)
  }

  function patch(n1, n2, container, parentComponent) {
    const { type, shapeFlag } = n2;

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent)
        }
        break;
    }
  }

  function processFragment(n1, n2, container, parentComponent) {
    mountChildren(n2, container, parentComponent);
  }

  function processText(n1, n2: any, container: any) {
    const text = n2.children;
    const textNode = (n2.el = document.createTextNode(text));
    container.append(textNode);
  }

  function processElement(n1, n2, container, parentComponent) {
    if (!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container, parentComponent)
    }
  }

  function patchElement(n1, n2, container, parentComponent) {

    clog('patchElement')
    clog('n1:', n1)
    clog('n2:', n2)

    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;

    const el = (n2.el = n1.el)
    patchProps(el, oldProps, newProps);
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const newValue = newProps[key];
        const oldValue = oldProps[key];
        if (newValue !== oldValue) {
          hostPatchProps(el, key, oldValue, newValue);
        }
      }

      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProps(el, key, oldProps[key], null);
          }
        }
      }
    }
  }

  function mountElement(vnode, container, parentComponent) {
    const { props, children, type, shapeFlag } = vnode;

    const el = (vnode.el = hostCreateElement(type));

    // children
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent)
    } else if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.innerText = children;
    }


    // props
    Object.keys(props).forEach(key => {
      const val = props[key];
      hostPatchProps(el, key, null, val);
    })

    hostInsert(el, container);
  }

  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach(ele => {
      patch(null, ele, container, parentComponent);
    })
  }

  function processComponent(n1, n2: any, container: any, parentComponent) {
    mountComponent(n2, container, parentComponent)
  }
  function mountComponent(initialVNode: any, container, parentComponent) {
    // 创建组件实例
    const instance = createComponentInstance(initialVNode, parentComponent);

    // 初始化组件
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container)
  }

  function setupRenderEffect(instance, initialVNode, container) {


    effect(() => {
      if (!instance.isMounted) {
        clog('init')
        const { proxy } = instance;
        const subTree = (instance.subTree = instance.render.call(proxy));
        patch(null, subTree, container, instance);
        initialVNode.el = subTree.el;
        instance.isMounted = true;
      } else {
        clog('data changes update the view')
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const prevSubTree = instance.subTree;
        instance.subTree = subTree;
        patch(prevSubTree, subTree, container, instance);
      }

    })
  }

  return {
    createApp: createAppApi(render),
  }
}