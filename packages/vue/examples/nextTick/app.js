import { getCurrentInstance, h, nextTick, ref } from '../../dist/guide-mini-vue.esm.js'
export const App = {
  name: 'App',
  render() {
    window.self = this;
    return h('div', {}, [
      h('button', {onClick: this.click}, 'button'),
      h('div', {}, `我这里看count:${this.count}`)
    ])
  },
  setup() {
    const instance = getCurrentInstance();
    const count = ref(0);
    const click = () => {
      for (let i = 0; i < 100; i++) {
        count.value = count.value + 1;
      }
      console.log(instance.vnode.el.innerText)

      nextTick(() => {
        console.log(instance.vnode.el.innerText)
      })
    }
    return {
      count,
      click
    }
  }
}