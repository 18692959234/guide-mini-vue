import { PublicInstanceProxyHandlers } from "./componentPublicInstance";

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type
  }
  return component
}

// 初始化组件需要做的事情
// initProps
// initSlots
// setupStatefulComponent
export function setupComponent(instance) {
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
  const component = instance.type;
  instance.proxy = new Proxy({_: instance}, PublicInstanceProxyHandlers);
  const { setup } = component;
  if (setup) {
    const setupResult = setup();

    handleSetupResult(instance, setupResult)
  }
}
function handleSetupResult(instance, setupResult) {
  if (typeof setupResult === 'object') {
      instance.setupState = setupResult
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  const component = instance.type;
  if (component.render) {
    instance.render = component.render;
  }
}

