import { h, ref } from '../../../lib/guide-mini-vue.esm.js'
// import { Foo } from './foo.js';
export const App = {
  name: 'App',
  render () {
    return h('div', {}, [
      h('div', {}, `count: ${this.count}`),
      h('button', { onClick: this.click }, 'button')
    ])
  },
  setup () {
    const count = ref(0);
    const click = () => {
      count.value++;
      console.log(count.value)
    }
    return {
      count,
      click
    }
  }
}