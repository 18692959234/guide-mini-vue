import { createTextVNode, h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './foo.js';
export const App = {
  name: 'App',
  render() {
    return h(Foo, {}, {
      default: () => h('div', {'data-aaa': 'sss'}, [h('div',{}, '插槽1'), createTextVNode('测试Text')]), 
      bottom: ({age}) => h('div', {}, '插槽2' + age)
    })
  },
  setup() {
    return {
      name: 'hb'
    }
  }
}