import { h, renderSlots } from "../../../lib/guide-mini-vue.esm.js"

export const Foo = {
  setup (props, {emit}) {
  },
  render () {
    const age = 'heihei';
    return h('div', {}, [renderSlots(this.$slots, 'default'), h('div', {}, '测试插槽'), renderSlots(this.$slots, 'bottom', {age})])
  }
}