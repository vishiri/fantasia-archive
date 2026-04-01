import path from 'path'
import { fileURLToPath } from 'url'

import { defineConfig } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Core unit tests (no Vue SFC transforms). Keeps existing boot/electron/script suites stable.
 */
export default defineConfig({
  resolve: {
    alias: {
      '#q-app/wrappers': path.resolve(
        __dirname,
        'node_modules/@quasar/app-vite/exports/wrappers/wrappers.js'
      ),
      app: path.resolve(__dirname, '.'),
      src: path.resolve(__dirname, 'src'),
      'src-electron': path.resolve(__dirname, 'src-electron')
    }
  },
  test: {
    name: 'unit-core',
    environment: 'node',
    include: [
      'src-electron/**/*.vitest.test.ts',
      'src/scripts/**/*.vitest.test.ts',
      'src/boot/**/*.vitest.test.ts',
      'src/stores/**/*.vitest.test.ts',
      'src/i18n/**/*.vitest.test.ts'
    ],
    reporters: ['default', 'json'],
    outputFile: 'test-results/vitest-report/test-results-vitest.json'
  }
})
