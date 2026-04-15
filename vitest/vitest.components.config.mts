import path from 'path'
import { fileURLToPath } from 'url'

import vue from '@vitejs/plugin-vue'
import type { UserConfig } from 'vite'
import { defineConfig } from 'vitest/config'

import {
  vitestCoverageBaseExclude,
  vitestCoverageSkipFull,
  vitestCoverageStrictThresholds
} from './vitest.coverage.shared'
import { vitestTerminalReporters } from './vitest.reporters.shared'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

/**
 * Vite's published SassPreprocessorOptions omit the sass compiler 'api' field; vite and sass-embedded still read it at runtime.
 */
type T_vitestComponentsScssOpts = NonNullable<
  NonNullable<NonNullable<UserConfig['css']>['preprocessorOptions']>['scss']
>

/**
 * Vue SFC unit tests — jsdom + SFC transforms: components, layouts, and pages.
 * **.ts** files under those trees: **100%** statements, branches, functions, lines (merged per Vitest **`coverage.thresholds`** glob).
 * **.vue** SFCs: **no** failing **`coverage.thresholds`** entry; **`watermarks`** use a **60%** lower band so weak totals show orange or red in reports.
 */
export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'legacy'
      } as T_vitestComponentsScssOpts
    }
  },
  resolve: {
    alias: {
      '#q-app/wrappers': path.resolve(
        repoRoot,
        'node_modules/@quasar/app-vite/exports/wrappers/wrappers.js'
      ),
      app: repoRoot,
      src: path.resolve(repoRoot, 'src'),
      components: path.resolve(repoRoot, 'src/components'),
      'src-electron': path.resolve(repoRoot, 'src-electron')
    },
    conditions: ['import', 'module', 'browser', 'default']
  },
  assetsInclude: ['**/*.md'],
  test: {
    name: 'unit-components',
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, 'vitest.setup.ts')],
    include: [
      'src/components/**/*.vitest.test.ts',
      'src/layouts/**/*.vitest.test.ts',
      'src/pages/**/*.vitest.test.ts'
    ],
    reporters: [...vitestTerminalReporters],
    outputFile: 'test-results/vitest-report/test-results-vitest-components.json',
    clearMocks: true,
    pool: 'forks',
    coverage: {
      provider: 'v8',
      skipFull: vitestCoverageSkipFull,
      include: [
        'src/components/**/*.vue',
        'src/components/**/*.ts',
        'src/layouts/**/*.vue',
        'src/pages/**/*.vue'
      ],
      exclude: [
        ...vitestCoverageBaseExclude,
        'src/components/**/_tests/**',
        'src/layouts/**/_tests/**',
        'src/pages/**/_tests/**',
        '**/*.stories.ts',
        // Storybook-only catalogues (see AGENTS.md foundation section); strict gates apply to product UI only.
        'src/components/foundation/**'
      ],
      watermarks: {
        statements: [60, 100],
        branches: [60, 100],
        functions: [60, 100],
        lines: [60, 100]
      },
      thresholds: {
        'src/components/**/*.ts': { ...vitestCoverageStrictThresholds },
        'src/layouts/**/*.ts': { ...vitestCoverageStrictThresholds },
        'src/pages/**/*.ts': { ...vitestCoverageStrictThresholds }
      }
    }
  }
})
