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

/**
 * Renderer-side TypeScript under src/ (boot, scripts, stores) — no Vue SFCs.
 * Locale logic lives in repo-root **i18n/** (**unit-i18n**). 100% v8 thresholds apply to the scoped include list (see **test:coverage:src** in package.json).
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
    name: 'unit-src-renderer',
    environment: 'node',
    include: [
      'src/scripts/**/*.vitest.test.ts',
      'src/boot/**/*.vitest.test.ts',
      'src/stores/**/*.vitest.test.ts'
    ],
    reporters: [...vitestTerminalReporters],
    outputFile: 'test-results/vitest-report/test-results-vitest-src-renderer.json',
    coverage: {
      provider: 'v8',
      skipFull: vitestCoverageSkipFull,
      include: [
        'src/boot/**/*.ts',
        'src/scripts/**/*.ts',
        'src/stores/**/*.ts'
      ],
      exclude: [
        ...vitestCoverageBaseExclude,
        'src/boot/**/tests/**',
        'src/scripts/**/tests/**',
        'src/stores/**/tests/**'
      ],
      thresholds: { ...vitestCoverageStrictThresholds }
    }
  }
})
