import { shallowReadonly } from "../reactivity/reactive";
import { proxyRefs } from "../reactivity/ref";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";

export function createComponentInstance(vnode, parent) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    slots: {},
    next: null,
    parent,
    provides: parent ? parent.provides : {},
    isMounted: false,
    subTree: {},
    emit: () => {}
  }
  component.emit = emit.bind(null, component) as any;
  return component
}

// 初始化组件需要做的事情
// initProps
// initSlots
// setupStatefulComponent
export function setupComponent(instance) {
  initProps(instance, instance.vnode.props);
  initSlots(instance, instance.vnode.children);
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
  const component = instance.type;
  instance.proxy = new Proxy({_: instance}, PublicInstanceProxyHandlers);
  const { setup } = component;
  if (setup) {
    setCurrentInstance(instance);
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    });
    setCurrentInstance(null);
    handleSetupResult(instance, setupResult)
  }
}
function handleSetupResult(instance, setupResult) {
  if (typeof setupResult === 'object') {
      instance.setupState = proxyRefs(setupResult)
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  const component = instance.type;
  if (component.render) {
    instance.render = component.render;
  }
}

let currentInstance = null;
export function getCurrentInstance () {
  return currentInstance;
}

export function setCurrentInstance (instance) {
  currentInstance = instance;
}
