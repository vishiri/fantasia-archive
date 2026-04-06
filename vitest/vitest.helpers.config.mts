import path from 'path'
import { fileURLToPath } from 'url'

import { defineConfig } from 'vitest/config'

import {
  vitestCoverageBaseExclude,
  vitestCoverageStrictThresholds
} from './vitest.coverage.shared'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

/**
 * Node unit tests for modules under helpers/ (e.g. helpers/playwrightHelpers/).
 * Convention: colocate *.vitest.test.ts under each package's tests/ tree; this glob picks up every helper subtree.
 * Vitest workspace configs live under vitest/ at the repo root so this coverage gate applies only to real helper packages.
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
    reporters: ['default', 'json'],
    outputFile: 'test-results/vitest-report/test-results-vitest-helpers.json',
    coverage: {
      provider: 'v8',
      include: ['helpers/**/*.ts'],
      exclude: [
        ...vitestCoverageBaseExclude,
        'helpers/**/tests/**'
      ],
      thresholds: vitestCoverageStrictThresholds
    }
  }
})
