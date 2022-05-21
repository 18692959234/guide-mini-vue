import { effect } from "../reactivity/effect";
import { clog, EMPTY_OBJ } from "../shared";
import { ShapeFlags } from "../shared/ShapeFlags";
import { createComponentInstance, setupComponent } from "./components"
import { createAppApi } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {

  const { createElement: hostCreateElement, patchProp: hostPatchProps, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText } = options;

  function render(vnode, container) {
    patch(null, vnode, container, null, null)
  }

  function patch(n1, n2, container, parentComponent, anchor) {
    const { type, shapeFlag } = n2;

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor)
        }
        break;
    }
  }

  function processFragment(n1, n2, container, parentComponent, anchor) {
    mountChildren(n2.children, container, parentComponent, anchor);
  }

  function processText(n1, n2: any, container: any) {
    const text = n2.children;
    const textNode = (n2.el = document.createTextNode(text));
    container.append(textNode);
  }

  function processElement(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor)
    } else {
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {

    clog('patchElement')
    clog('n1:', n1)
    clog('n2:', n2)

    

    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;

    const el = (n2.el = n1.el);
    patchChildren(n1, n2, el, parentComponent, anchor);
    patchProps(el, oldProps, newProps);
  }

  function patchChildren (n1, n2, container, parentComponent, anchor) {
    clog('patchChildren')
    const prevShapeFlag = n1.shapeFlag;
    const { shapeFlag } = n2;

    const c1 = n1.children;
    const c2 = n2.children;

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 1、清空旧的
        // 2、设置新值
        unmountChildren(n1.children)
      }
      if (c1 !== c2) {
        hostSetElementText(container, c2)
      }
    } else {
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 1、把旧的text清空
        // 2、挂载 children
        hostSetElementText(container, '');
        mountChildren(c2, container, parentComponent, anchor);
      } else {
        // array to array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }

  function patchKeyedChildren (c1, c2, container, parentComponent, anchor) {
    const l2 = c2.length;
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;

    

    function isSomeVNodeType (n1, n2) {
      return n1.type === n2.type && n1.key === n2.key;
    }

    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, anchor);
      } else {
        break;
      }
      i++;
    }

    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, anchor);
      } else {
        break;
      }
      e1 --;
      e2 --;
    }

    //  i > e1 且 i <=  e2 代表的是新的比老的长，e2完全覆盖了e1，所以只需要新增元素
    if (i > e1) {
      if (i <= e2) {
        // nextPos目的只是为了定位到右侧相同的最后一个元素的位置
        const nextPos = e2 + 1;
        // nextPos < l2 代表右侧一定有相同元素，所以需要找到nextPos当前的el元素， 否则右侧无相同元素 直接添加到最后 
        const anchor = nextPos < l2 ? c2[nextPos].el : null;
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
        
      }
    } else if ( i > e2) {
      while ( i <= e1 ) {
        hostRemove(c1[i].el);
        i++;
      }
    } else {
      // 中间对比

      let s1 = i;
      let s2 = i;
      const toBePatched = e2 - s2 + 1;
      let patched = 0;
      // 先去遍历老的，查查看老的元素存不存在于新的里面
      const keyToNewIndexMap = new Map();
      for (let i = s2; i <= e2; i++) {
        keyToNewIndexMap.set(c2[i].key, i);
      }

      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        if (patched >= toBePatched) {
          hostRemove(prevChild.el);
          continue;
        }
        // 两种方式
        // 1、把新的数组转换为map映射查找，复杂度为0(1),但前提是用户给了key
        // 2、循环新的数组，复杂度O(n)
        let newIndex ;
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (let i = s2; i <= e2; i ++) {
            const nextChild = c2[i];
            if (isSomeVNodeType(prevChild, nextChild)) {
              newIndex = i;
              break;
            }
          }
        }
        
        if (newIndex === undefined) {
          hostRemove(prevChild.el);
        } else {
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      } 
    }
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

  function mountElement(vnode, container, parentComponent, anchor) {
    const { props, children, type, shapeFlag } = vnode;

    const el = (vnode.el = hostCreateElement(type));

    // children
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent, anchor)
    } else if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.innerText = children;
    }


    // props
    Object.keys(props).forEach(key => {
      const val = props[key];
      hostPatchProps(el, key, null, val);
    })

    hostInsert(el, container, anchor);
  }

  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach(ele => {
      patch(null, ele, container, parentComponent, anchor);
    })
  }

  function unmountChildren (children) {
    children.forEach(child => {
      hostRemove(child.el);
    })
  }

  function processComponent(n1, n2: any, container: any, parentComponent, anchor) {
    mountComponent(n2, container, parentComponent, anchor)
  }
  function mountComponent(initialVNode: any, container, parentComponent, anchor) {
    // 创建组件实例
    const instance = createComponentInstance(initialVNode, parentComponent);

    // 初始化组件
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container, anchor)
  }

  function setupRenderEffect(instance, initialVNode, container, anchor) {


    effect(() => {
      if (!instance.isMounted) {
        clog('init')
        const { proxy } = instance;
        const subTree = (instance.subTree = instance.render.call(proxy));
        patch(null, subTree, container, instance, anchor);
        initialVNode.el = subTree.el;
        instance.isMounted = true;
      } else {
        clog('data changes update the view')
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const prevSubTree = instance.subTree;
        instance.subTree = subTree;
        patch(prevSubTree, subTree, container, instance, anchor);
      }

    })
  }

  return {
    createApp: createAppApi(render),
  }
}