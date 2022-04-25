import { h } from '../../../lib/guide-mini-vue.esm.js'
import { Foo } from './foo.js';
export const App = {
  name: 'App',
  render() {
    window.self = this;
    return h('div', {
      class: 'hello',
      onClick() { console.log('onClick') }, onMouseDown() {
        console.log('onmousedown')
      }
    }, [
      h('p', { id: 'p' }, this.name),
      h('span', {}, '我是sapan'),
      h(Foo, {fooText: 123})
    ])
  },
  setup() {
    return {
      name: 'hb'
    }
  }
}