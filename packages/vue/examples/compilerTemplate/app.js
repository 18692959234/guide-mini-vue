import { ref, reactive } from '../../dist/guide-mini-vue.esm.js'
export const App = {
  name: 'App',
  template: '<div>hello: {{user.name}}, 你已经{{user.age}}岁了</div>',
  setup() {
    const count = (window.count = ref(0));
    const user = (window.user = reactive({name: '胡波', age: 25}));
    return {
      count,
      user
    }
  }
}