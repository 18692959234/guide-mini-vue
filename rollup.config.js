import typescript from '@rollup/plugin-typescript';
export default {
  input: './packages/vue/src/index.ts',
  output: [
    {
      format: 'esm',
      file: 'packages/vue/dist/guide-mini-vue.esm.js'
    },
    {
      format: 'cjs',
      file: "packages/vue/dist/guide-mini-vue.cjs.js"
    },
  ],
  plugins: [typescript()]
}