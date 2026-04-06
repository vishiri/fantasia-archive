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

/** 100% lines/statements/functions for **.ts; branches omitted (v8 counts iterator/comparator edges oddly on some loops). */
const vitestSrcTsStrictThresholdsNoBranches = {
  statements: vitestCoverageStrictThresholds.statements,
  functions: vitestCoverageStrictThresholds.functions,
  lines: vitestCoverageStrictThresholds.lines
} as const

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
 * **.ts** files under those trees use 100% statements/functions/lines thresholds (branches omitted for this slice—v8 over-counts some iterator edges).
 * **.vue** files have no failing threshold; watermarks use a 60% lower bound so HTML/text reports flag weak Vue coverage for human review.
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
        'src/components/**/tests/**',
        'src/layouts/**/tests/**',
        'src/pages/**/tests/**',
        '**/*.stories.ts'
      ],
      watermarks: {
        statements: [60, 90],
        branches: [60, 85],
        functions: [60, 90],
        lines: [60, 85]
      },
      thresholds: {
        'src/components/**/*.ts': { ...vitestSrcTsStrictThresholdsNoBranches },
        'src/layouts/**/*.ts': { ...vitestSrcTsStrictThresholdsNoBranches },
        'src/pages/**/*.ts': { ...vitestSrcTsStrictThresholdsNoBranches }
      }
    }
  }
})
