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

    // 1. sync from start
    // (a b) c
    // (a b) d e
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

    // 2. sync from end
    // a (b c)
    // d e (b c)
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

    // 3. common sequence + mount
    // (a b)
    // (a b) c
    // i = 2, e1 = 1, e2 = 2
    // (a b)
    // c (a b)
    // i = 0, e1 = -1, e2 = 0
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
    }
    // 4. common sequence + unmount
    // (a b) c
    // (a b)
    // i = 2, e1 = 2, e2 = 1
    // a (b c)
    // (b c)
    // i = 0, e1 = 0, e2 = -1
    else if ( i > e2) {
      while ( i <= e1 ) {
        hostRemove(c1[i].el);
        i++;
      }
    }
    
    // 5. unknown sequence
    // [i ... e1 + 1]: a b [c d e] f g
    // [i ... e2 + 1]: a b [e d c h] f g
    // i = 2, e1 = 4, e2 = 5
    else {
      // 中间对比

      let s1 = i;  // prev starting index
      let s2 = i;  // next starting index
      const toBePatched = e2 - s2 + 1;
      let patched = 0;
      // 先去遍历老的，查查看老的元素存不存在于新的里面
      const keyToNewIndexMap = new Map();

      // 初始化一个数组，数组的长度为中间部分不相等元素的个数，并初始值为0，0代表需要新创建的元素
      const newIndexToOldIndexMap = new Array(toBePatched);

      let moved = false;
      let maxNewIndexSoFar = 0;
      for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;
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

          // 依次遍历老节点的中间元素，映射到新节点的下标对比（maxNewIndexSoFar存的是上个老节点映射到新节点的下标），如果是递增那么表示无需移动，否则是要移动元素的。
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }

          // 把要移动的元素 在旧数据里面的下标位置记录下来， i+1是为了不影响初始化的0
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      }

      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];

      let j = increasingNewIndexSequence.length -1;
      
      // 采用倒序是为了保证插入的位置是正确的，因为如果正序插入，在某个节点之前插入节点（假设这个节点为A），A还未处理过，所以不稳定
      for (let i = toBePatched - 1; i >= 0;  i--) {
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor);
        } else if (moved) {
          // 这里无论从头开始对比 或者是从尾进行对比只是为了 找出需要移动的节点
          // i的值其实换算到老节点的下标就是 newIndexToOldIndexMap[i], 而需要移动的元素就为c1[newIndexToOldIndexMap[i]]
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            hostInsert(nextChild.el, container, anchor)
          } else {
            j--;
          }
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

/**
 * @name 求最长子序列
 */
function getSequence(arr) {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}