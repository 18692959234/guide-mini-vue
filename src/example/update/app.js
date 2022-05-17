import { h, ref } from '../../../lib/guide-mini-vue.esm.js'
// import { Foo } from './foo.js';
export const App = {
  name: 'App',
  render () {
    return h('div', {...this.props}, [
      h('div', {}, `count: ${this.count}`),
      h('button', { onClick: this.click }, 'button'),
      h('button', { onClick: this.update }, '更新props 为新的值'),
      h('button', { onClick: this.setUndefined }, '更新props 为null 并删除props'),
      h('button', { onClick: this.deleteProps }, '旧的props 不存在于新的props上 并删除props'),
    ])
  },
  setup () {
    const count = ref(0);
    const click = () => {
      count.value++;
      console.log(count.value)
    }

    const props = ref({
      foo: 'foo',
      bar: 'bar'
    })
    const update = () => {
      props.value.foo = 'new-foo'
    }

    const setUndefined = () => {
      props.value.foo = undefined;
    }

    const deleteProps = () => {
      props.value = {
        foo: 'foo'
      }
    }

    return {
      count,
      click,
      update,
      setUndefined,
      deleteProps,
      props
    }
  }
}