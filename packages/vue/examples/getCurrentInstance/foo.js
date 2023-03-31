import { h, renderSlots, getCurrentInstance } from "../../dist/guide-mini-vue.esm.js"

export const Foo = {
  name: 'Foo',
  setup (props, {emit}) {
    console.log('Foo：', getCurrentInstance())
  },
  render () {
    const age = 'heihei';
    return h('div', {aaa: 333,}, [renderSlots(this.$slots, 'default'), h('div', {}, '测试插槽'), renderSlots(this.$slots, 'bottom', {age})])
  }
}