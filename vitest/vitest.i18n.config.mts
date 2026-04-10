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
 * Node unit tests for repo-root i18n (vue-i18n message registry, specialCharacterFixer, externalFileLoader).
 * Colocate Vitest specs under i18n/_tests. This project does not use vitest.setup.ts so externalFileLoader stays real during coverage.
 * Enforces 100% v8 on all four metrics for all i18n TypeScript sources outside i18n/_tests (yarn test:coverage:i18n).
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
  assetsInclude: ['**/*.md'],
  test: {
    name: 'unit-i18n',
    environment: 'node',
    include: ['i18n/**/*.vitest.test.ts'],
    reporters: [...vitestTerminalReporters],
    outputFile: 'test-results/vitest-report/test-results-vitest-i18n.json',
    coverage: {
      provider: 'v8',
      skipFull: vitestCoverageSkipFull,
      include: [
        'i18n/index.ts',
        'i18n/externalFileLoader.ts',
        'i18n/specialCharactersFixer.ts',
        'i18n/en-US/index.ts',
        'i18n/fr/index.ts',
        'i18n/de/index.ts'
      ],
      exclude: [...vitestCoverageBaseExclude],
      thresholds: { ...vitestCoverageStrictThresholds }
    }
  }
})
