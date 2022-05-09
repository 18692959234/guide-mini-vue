import { h } from '../../../lib/guide-mini-vue.esm.js'
import { Foo } from './foo.js';
export const App = {
  name: 'App',
  render() {
    return h(Foo, {}, {
      default: () => h('div', {}, '插槽1'), 
      bottom: ({age}) => h('div', {}, '插槽2' + age)
    })
  },
  setup() {
    return {
      name: 'hb'
    }
  }
}