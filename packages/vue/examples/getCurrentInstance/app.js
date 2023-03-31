import { createTextVNode, getCurrentInstance, h } from '../../dist/guide-mini-vue.esm.js'
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
    console.log('App：', getCurrentInstance())
    return {
      name: 'hb'
    }
  }
}