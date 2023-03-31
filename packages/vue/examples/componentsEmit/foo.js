import { h } from "../../dist/guide-mini-vue.esm.js"

export const Foo = {
  setup (props, {emit}) {
    const emitAdd = () => {
      emit('add');

      emit('event-channel', 1, 2, 3)
    }
    return {
      emitAdd
    }
  },
  render () {
    const button = h('button', {
      onClick: this.emitAdd
    }, 'emitAdd')
    const text = h('div', {}, '123')
    return h('div', {}, [button, text])
  }
}