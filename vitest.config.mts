import path from 'path'
import { fileURLToPath } from 'url'

import { defineConfig } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      // Match Quasar tsconfig `app/*` → repo root so electron-preload imports resolve under Vitest.
      app: path.resolve(__dirname, '.')
    }
  },
  test: {
    include: ['**/*vitest.@(spec|test).?(c|m)[jt]s?(x)'],
    reporters: ['default', 'json'],
    outputFile: 'test-results/vitest-report/test-results-vitest.json'
  }
})
