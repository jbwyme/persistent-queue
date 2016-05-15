import babel from 'rollup-plugin-babel';

export default {
  format: 'es6',
  entry: 'src/index.js',
  dest: 'build/index.es6.js',
  plugins: [
    babel({
      babelrc: false,
      ignore: ['node_modules/**', 'src/json2'],
      presets: ['es2015-rollup']
    }),
  ]
};
