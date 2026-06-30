import path from 'path'
import { fileURLToPath } from 'url'

import { defineConfig } from 'vitest/config'

import {
  vitestCoverageBaseExclude,
  vitestCoverageSkipFull,
  vitestCoverageStrictThresholds
} from './vitest.coverage.shared'
import { vitestTerminalReporters } from './vitest.reporters.shared'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

/** Playwright harness packages stay out of Vitest strict coverage—they are exercised by Playwright specs. */
const PLAYWRIGHT_HELPERS_COVERAGE_EXCLUDE = [
  'helpers/playwrightHelpers_universal/**',
  'helpers/playwrightHelpers_component/**',
  'helpers/playwrightHelpers_e2e/**'
] as const

/**
 * Node unit tests for modules under helpers/ excluding Playwright-only harness trees.
 * Playwright helpers (helpers/playwrightHelpers_*) intentionally have no *.vitest.test.ts corpus today.
 */
export default defineConfig({
  resolve: {
    alias: {
      '#q-app/wrappers': path.resolve(
        repoRoot,
        'node_modules/@quasar/app-vite/exports/wrappers/wrappers.js'
      ),
      app: repoRoot,
      src: path.resolve(repoRoot, 'src'),
      'src-electron': path.resolve(repoRoot, 'src-electron')
    }
  },
  test: {
    name: 'unit-helpers',
    environment: 'node',
    include: ['helpers/**/*.vitest.test.ts'],
    exclude: [
      ...PLAYWRIGHT_HELPERS_COVERAGE_EXCLUDE,
      'helpers/playwrightHelpers/**'
    ],
    passWithNoTests: true,
    reporters: [...vitestTerminalReporters],
    outputFile: 'test-results/vitest-report/test-results-vitest-helpers.json',
    globalSetup: [path.resolve(__dirname, 'vitest.coverageTmpSetup.mts')],
    coverage: {
      provider: 'v8',
      skipFull: vitestCoverageSkipFull,
      include: ['helpers/**/*.ts'],
      exclude: [
        ...vitestCoverageBaseExclude,
        'helpers/**/_tests/**',
        ...PLAYWRIGHT_HELPERS_COVERAGE_EXCLUDE,
        'helpers/playwrightHelpers/**'
      ],
      thresholds: { ...vitestCoverageStrictThresholds }
    }
  }
})
