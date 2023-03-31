import { h } from "../../dist/guide-mini-vue.esm.js"

export const Foo = {
  setup (props) {
    console.log(props)

    props.fooText++;
  },
  render () {
    return h('div', {}, `123:${this.fooText}`)
  }
}