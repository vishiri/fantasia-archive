// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook'

import importPlugin from 'eslint-plugin-import'
import jsoncParser from 'jsonc-eslint-parser'
import neostandard from 'neostandard'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import tseslint from 'typescript-eslint'

export default [...neostandard({
  ts: true,
  filesTs: ['**/*.mts', '**/*.cts'],
  env: ['browser', 'node'],
  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.quasar/**',
    '**/storybook-static/**',
    '**/src-capacitor/**',
    '**/src-cordova/**',
    '**/src-ssr/**',
    '**/test-results/**',
    'quasar.config.*.temporary.compiled*'
  ],
  globals: {
    ga: 'readonly',
    cordova: 'readonly',
    __statics: 'readonly',
    __QUASAR_SSR__: 'readonly',
    __QUASAR_SSR_SERVER__: 'readonly',
    __QUASAR_SSR_CLIENT__: 'readonly',
    __QUASAR_SSR_PWA__: 'readonly',
    process: 'readonly',
    Capacitor: 'readonly',
    chrome: 'readonly'
  }
}), ...pluginVue.configs['flat/recommended'], {
  files: ['**/*.vue'],
  languageOptions: {
    parser: vueParser,
    parserOptions: {
      parser: tseslint.parser,
      extraFileExtensions: ['.vue']
    }
  }
}, {
  plugins: {
    import: importPlugin,
    '@typescript-eslint': tseslint.plugin
  },
  rules: {
    'import/first': 'off',
    'import/namespace': 'error',
    'import/default': 'error',
    'import/export': 'error',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/named': 'off',
    'arrow-parens': 'off',
    'generator-star-spacing': 'off',
    'multiline-ternary': 'off',
    'no-void': 'off',
    'one-var': 'off',
    'prefer-promise-reject-errors': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    camelcase: 'off',
    'object-shorthand': 'off',
    'quote-props': 'off',
    '@stylistic/quote-props': 'off',
    quotes: ['warn', 'single', { avoidEscape: true }],
    '@typescript-eslint/no-explicit-any': ['error', { ignoreRestArgs: true }],
    '@typescript-eslint/no-require-imports': 'off',
    'object-curly-newline': ['error', {
      ObjectExpression: {
        minProperties: 2,
        multiline: true,
        consistent: true
      }
    }],
    'object-property-newline': ['error', {
      allowAllPropertiesOnSameLine: false
    }]
  }
}, {
  files: ['**/*.json', '**/*.jsonc', '**/*.json5'],
  languageOptions: {
    parser: jsoncParser
  },
  rules: {
    'object-curly-newline': ['error', {
      ObjectExpression: {
        minProperties: 2,
        multiline: true,
        consistent: true
      }
    }],
    'object-property-newline': ['error', {
      allowAllPropertiesOnSameLine: false
    }]
  }
}, ...storybook.configs['flat/recommended']]
