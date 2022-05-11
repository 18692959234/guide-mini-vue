import { createVNode } from "./vnode";
export function createAppApi (render) {
  return function createApp (rootComponent) {
    return {
      mount (rootContainer) {
        // rootComponent -> vNode
        const vNode = createVNode(rootComponent);
  
        render(vNode, rootContainer)
      }
    }
  }
}