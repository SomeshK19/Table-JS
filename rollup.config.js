import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';

export default {
  input: 'src/index.tsx',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  ],
  external: [
    'react',
    'react-dom',
    '@mui/material',
    '@mui/icons-material',
    '@mui/system',
    'react-router-dom',
  ],
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      clean: true,
    }),
    postcss({
      extensions: ['.scss'],
      extract: 'styles.css',
      modules: false,
      use: ['sass'],
    }),
    copy({
      targets: [
        { src: 'src/assets/**/*', dest: 'dist/assets' },
      ],
    }),
  ],
};