import { h } from '../../../lib/a.esm.js'
export const App = {
  render () {
    window.self = this;
    return h('div',{ class: 'hello' }, [
      h('p', { id: 'p' }, this.name),
      h('span', {}, '我是sapan')
    ])
  },
  setup () {
    return {
      name: 'hb'
    }
  }
}