// eslint.config.js
const babelParser = require('@babel/eslint-parser')

module.exports = [
  {
    rules: {
      camelcase: 'off',
      'eslint-comments/no-use': 'off',
      'eslint-comments/no-unused-disable': 'off',
      'i18n-text/no-en': 'off',
      'import/no-commonjs': 'off',
      'import/no-namespace': 'off',
      'no-console': 'off',
      'no-unused-vars': 'off',
      semi: 'off'
    },
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        sourceType: 'script',
        babelOptions: {
          babelrc: false,
          configFile: false,
          // your babel options
          presets: ['@babel/preset-env']
        }
      }
    }
  },
  {
    ignores: [
      '.*',
      'node_modules/**',
      'dist/**',
      'dist/index.js',
      'coverage/**',
      '*.json'
    ]
  }
]
