// import pkg from "./package.json"
import typescript from '@rollup/plugin-typescript';
export default {
  input: './src/index.ts',
  output: [
    {
      format: 'esm',
      file: 'lib/a.esm.js'
    },
    {
      format: 'cjs',
      file: 'lib/a.cjs.js'
    },
  ],
  plugins: [typescript()]
}