// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook'

import importPlugin from 'eslint-plugin-import'
import jsoncParser from 'jsonc-eslint-parser'
import neostandard from 'neostandard'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import tseslint from 'typescript-eslint'

import { faTwoLevelPlugin } from './eslint-rules/faTwoLevelPlugin.mjs'
import { typesFolderPlugin } from './eslint-rules/typesFolderPlugin.mjs'

/**
 * Paths excluded from max-lines / max-lines-per-function (see .cursor/rules/code-size-decomposition.mdc).
 */
const codeSizeRuleIgnores = [
  '**/*.vitest.test.ts',
  '**/*playwright*.ts',
  '**/*.playwright.spec.ts',
  '**/*.stories.ts',
  '**/*.config.mjs',
  '**/*.config.mts',
  '**/*.config.ts',
  '**/eslint.config.mjs',
  '**/commitlint.config.mjs',
  'i18n/**/*.ts',
  'types/**/*.ts',
  '**/*.d.ts',
  'vitest/**/*.mts',
  '.storybook-workspace/**',
  '**/quasar.config.ts',
  '**/quasar.config.js',
  '.utility-scripts/**/*.mjs',
  'testRunner_*.mjs',
  '**/testRunner_*.mjs',
  '**/*_manager.ts',
  'src/stores/S_*.ts',
  '**/_data/**/*.ts',
  'eslint-rules/**'
]

/** Level-1 functions/*.ts — no NPM / in-repo value imports (types/ only as import type). */
const faTwoLevelFunctionsGlobs = [
  'src/**/functions/**/*.ts',
  'src-electron/**/functions/**/*.ts'
]

const faTwoLevelNpmRestrictedPaths = [
  {
    name: 'vue',
    message: 'Level-1 functions/ must not import NPM packages; inject via the manager.'
  },
  {
    name: 'pinia',
    message: 'Level-1 functions/ must not import NPM packages; inject via the manager.'
  },
  {
    name: 'quasar',
    message: 'Level-1 functions/ must not import NPM packages; inject via the manager.'
  },
  {
    name: 'neverthrow',
    message: 'Level-1 functions/ must not import NPM packages; inject via the manager.'
  },
  {
    name: 'vue-i18n',
    message: 'Level-1 functions/ must not import NPM packages; inject via the manager.'
  },
  {
    name: 'vue-router',
    message: 'Level-1 functions/ must not import NPM packages; inject via the manager.'
  },
  {
    name: 'axios',
    message: 'Level-1 functions/ must not import NPM packages; inject via the manager.'
  },
  {
    name: 'lodash-es',
    message: 'Level-1 functions/ must not import NPM packages; inject via the manager.'
  },
  {
    name: 'monaco-editor',
    message: 'Level-1 functions/ must not import NPM packages; inject via the manager.'
  }
]

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
    '**/coverage/**',
    'eslint*.json',
    '.utility-scripts/.eslint-report.json',
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
    '@typescript-eslint': tseslint.plugin,
    'fa-two-level': faTwoLevelPlugin,
    'types-folder': typesFolderPlugin
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
}, {
  files: ['**/*playwright*.ts'],
  rules: {
    // Playwright requires object destructuring on the first test callback argument; '{}' is valid when no fixtures are used.
    'no-empty-pattern': 'off'
  }
}, {
  files: ['**/*.{ts,mts,cts}'],
  ignores: codeSizeRuleIgnores,
  rules: {
    'max-lines': ['error', {
      max: 200,
      skipBlankLines: true,
      skipComments: true
    }],
    'max-lines-per-function': ['error', {
      max: 100,
      skipBlankLines: true,
      skipComments: true,
      IIFEs: true
    }]
  }
}, {
  files: ['**/*.vue'],
  ignores: ['.storybook-workspace/**'],
  rules: {
    'max-lines': ['error', {
      max: 250,
      skipBlankLines: true,
      skipComments: true
    }],
    'max-lines-per-function': ['error', {
      max: 100,
      skipBlankLines: true,
      skipComments: true,
      IIFEs: true
    }]
  }
}, {
  files: ['src/components/**/_*.vue'],
  rules: {
    // Infrastructure helpers use defineOptions name _Fa… per AGENTS.md Helper / wrapper SFC naming.
    'vue/component-definition-name-casing': 'off'
  }
}, {
  files: ['**/*.{js,mjs,cjs}'],
  ignores: [
    ...codeSizeRuleIgnores,
    '**/node_modules/**',
    '**/dist/**',
    '**/.quasar/**',
    '**/storybook-static/**'
  ],
  rules: {
    'max-lines': ['error', {
      max: 200,
      skipBlankLines: true,
      skipComments: true
    }],
    'max-lines-per-function': ['error', {
      max: 100,
      skipBlankLines: true,
      skipComments: true,
      IIFEs: true
    }]
  }
}, {
  files: faTwoLevelFunctionsGlobs,
  rules: {
    'import/no-restricted-paths': ['error', {
      zones: [
        {
          target: './src/**/functions',
          from: './src',
          except: ['./types'],
          message: 'Level-1 functions/ may not import from src/ except types/ (use import type only).'
        },
        {
          target: './src-electron/**/functions',
          from: './src-electron',
          except: ['./shared'],
          message: 'Level-1 functions/ may not import from src-electron/ except shared schemas as import type.'
        },
        {
          target: './src/**/functions',
          from: './src-electron',
          message: 'Level-1 functions/ may not import from src-electron/.'
        },
        {
          target: './src-electron/**/functions',
          from: './src',
          message: 'Level-1 functions/ may not import from src/.'
        },
        {
          target: './src/**/functions',
          from: './i18n',
          message: 'Level-1 functions/ may not import i18n; pass translated strings from the manager.'
        },
        {
          target: './src/**/functions',
          from: './node_modules',
          message: 'Level-1 functions/ must not import NPM packages.'
        },
        {
          target: './src-electron/**/functions',
          from: './node_modules',
          message: 'Level-1 functions/ must not import NPM packages.'
        }
      ]
    }],
    '@typescript-eslint/no-restricted-imports': ['error', {
      paths: [
        ...faTwoLevelNpmRestrictedPaths,
        {
          name: 'app/types/*',
          allowTypeImports: true
        },
        {
          name: 'app/i18n/**',
          message: 'Level-1 functions/ may not import i18n.'
        }
      ],
      patterns: [
        {
          group: ['app/src/**', 'src/**', 'app/src-electron/**'],
          allowTypeImports: true,
          message: 'Level-1 functions/ may only use import type from app/types/, not value imports from src/.'
        }
      ]
    }],
    '@typescript-eslint/consistent-type-imports': ['error', {
      prefer: 'type-imports',
      fixStyle: 'separate-type-imports'
    }],
    'fa-two-level/functions-only-type-imports': 'error',
    'fa-two-level/no-functions-import-manager': 'error'
  }
}, {
  files: [
    'src/**/*.{ts,vue}',
    'src-electron/**/*.ts'
  ],
  ignores: [
    ...faTwoLevelFunctionsGlobs,
    '**/*.vitest.test.ts',
    '**/*playwright*.ts',
    '**/*.stories.ts',
    'i18n/**/*.ts',
    'types/**/*.ts',
    'helpers/playwrightHelpers_*/**',
    'e2e-tests/**'
  ],
  rules: {
    'import/no-restricted-paths': ['error', {
      zones: [
        {
          target: './src/**',
          from: './src/**/functions',
          except: [
            './src/**/**/*_manager.ts',
            './src/stores',
            './src/**/_data',
            './src/**/_tests'
          ],
          message: 'Import functions/ only from *_manager.ts, S_*.ts, _data/, or tests.'
        },
        {
          target: './src-electron/**',
          from: './src/**/functions',
          except: [
            './src-electron/**/register*Ipc.ts',
            './src-electron/**/contentBridgeAPIs/**'
          ],
          message: 'Renderer functions/ are imported from managers, stores, _data/, or tests only.'
        }
      ]
    }],
    'fa-two-level/feature-scripts-layout': 'error',
    'fa-two-level/require-manager-when-functions': 'error',
    'fa-two-level/stores-functions-layout': 'error',
    'fa-two-level/manager-wiring-only': 'error'
  }
}, {
  files: [
    '**/*_manager.ts'
  ],
  ignores: [
    '**/*.vitest.test.ts'
  ],
  rules: {
    'fa-two-level/manager-wiring-only': 'error'
  }
}, {
  files: [
    'src/components/**/*.vue',
    'src/layouts/**/*.vue',
    'src/pages/**/*.vue',
    'src/App.vue'
  ],
  rules: {
    'fa-two-level/vue-script-import-allowlist': 'error'
  }
}, {
  files: ['src-electron/mainScripts/**/*.ts'],
  ignores: [
    '**/*.vitest.test.ts',
    'src-electron/mainScripts/projectManagement/faProjectActiveDatabaseWiring.ts',
    'src-electron/mainScripts/projectManagement/faProjectDatabaseEnsureConnectedWiring.ts',
    'src-electron/mainScripts/projectManagement/faProjectReconnectAtKnownPathWiring.ts',
    'src-electron/mainScripts/projectManagement/faProjectOpenRunWiring.ts',
    'src-electron/mainScripts/projectManagement/faProjectCreateRunWiring.ts'
  ],
  rules: {
    'no-restricted-imports': ['error', {
      paths: [
        {
          name: 'app/src-electron/mainScripts/projectManagement/faProjectActiveDatabaseWiring',
          importNames: ['getFaProjectActiveDatabase'],
          message: 'Use runWithFaProjectDatabaseForIpcAsync / runWithFaProjectDatabaseSync from faProjectDatabaseEnsureConnectedWiring.ts (faProjectOpenRunWiring may read the active handle during open).'
        },
        {
          name: 'app/src-electron/mainScripts/projectManagement/faProjectActiveDatabaseWiring',
          importNames: ['getFaProjectLastKnownActiveProjectFilePath'],
          message: 'Use faProjectDatabaseEnsureConnectedWiring.ts internals only through that module; see .cursor/rules/fa-project-database-access.mdc.'
        },
        {
          name: 'app/src-electron/mainScripts/projectManagement/faProjectActiveDatabaseWiring',
          importNames: ['replaceFaProjectActiveDatabase'],
          message: 'replaceFaProjectActiveDatabase is only for open, create, and reconnect paths; see .cursor/rules/fa-project-database-access.mdc.'
        }
      ]
    }]
  }
}, {
  files: ['**/*.{ts,vue}'],
  ignores: [
    'types/**',
    '**/*.d.ts',
    'i18n/**',
    '**/node_modules/**',
    '**/dist/**',
    '**/.quasar/**',
    '**/storybook-static/**'
  ],
  rules: {
    'types-folder/no-exported-types-outside-types': 'error'
  }
}, ...storybook.configs['flat/recommended']]
