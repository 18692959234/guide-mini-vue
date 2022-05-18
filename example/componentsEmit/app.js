import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './foo.js';
export const App = {
  name: 'App',
  render() {
    window.self = this;
    return h('div', {
      class: 'hello',
    }, [
      h('p', { id: 'p' }, this.name),
      h('span', {}, '我是sapan'),
      h(Foo, {
        onAdd () {
          console.log('123')
        },
        onEventChannel (...args) {
          console.log('eventChannel被触发了', args, arguments)
        }
      })
    ])
  },
  setup() {
    return {
      name: 'hb'
    }
  }
}