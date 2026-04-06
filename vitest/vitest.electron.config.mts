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
 * Electron main/preload unit tests only. Coverage is scoped to src-electron; 100% thresholds apply with '--coverage'.
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
    name: 'unit-electron',
    environment: 'node',
    include: ['src-electron/**/*.vitest.test.ts'],
    reporters: ['default', 'json'],
    outputFile: 'test-results/vitest-report/test-results-vitest-electron.json',
    coverage: {
      provider: 'v8',
      include: ['src-electron/**/*.ts'],
      exclude: [
        ...vitestCoverageBaseExclude,
        'src-electron/**/tests/**'
      ],
      thresholds: vitestCoverageStrictThresholds
    }
  }
})
