import path from 'path'
import { fileURLToPath } from 'url'

import { defineConfig } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Node unit tests for modules under helpers/ (e.g. helpers/playwrightHelpers/).
 * Convention: colocate *.vitest.test.ts under each package's tests/ tree; this glob picks up every helper subtree.
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
    name: 'unit-helpers',
    environment: 'node',
    include: ['helpers/**/*.vitest.test.ts'],
    reporters: ['default', 'json'],
    outputFile: 'test-results/vitest-report/test-results-vitest-helpers.json'
  }
})
