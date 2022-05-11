export { h } from './h'

export { renderSlots } from './helpers/renderSlots';

export { createTextVNode } from './vnode';

export { getCurrentInstance } from './components'

export { provide, inject } from './apiInject';

export { createRenderer } from './renderer'

// 流程
// 调用createApp初始化 返回一个对象
// 执行mount方法
// mount方法里首先 拿到根实例去初始化一个vnode， 然后调用render
// render里直接调用patch
// patch里面需要判断vnode是否为组件或者是element 分别调用processComponent和processElement 去走一遍流程
// processComponent里面需要去挂载组件既mountComponent
// mountComponent 首先创建一个组件实例，然后去初始化组件既： setupComponent
// setupComponent需要做的事情 1、初始化props 2、 初始化 slot 3、初始化有状态的组件 setupfulStateComponent
// setupfulStateComponent 里主要是把有setup与render的vnode 给绑定到组件实例上
// 最后执行setupRenderEffect 主要是把调用render 并把render返回的结果丢给patch 再次执行
