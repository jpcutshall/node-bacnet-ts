import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';

export default {
  input: 'build/src/main.js',
  output: [
    {
      file: 'dist/app.js',
      format: 'cjs',
    },
    {
      file: 'dist/app.min.js',
      format: 'cjs',
      plugins: [terser()],
    },
  ],
  plugins: [resolve(), commonjs(), json()],
};