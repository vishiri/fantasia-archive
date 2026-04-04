import path from 'path'
import { fileURLToPath } from 'url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Vue component unit tests (src/components tree) — jsdom + SFC transforms only.
 */
export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'legacy'
      }
    }
  },
  resolve: {
    alias: {
      '#q-app/wrappers': path.resolve(
        __dirname,
        'node_modules/@quasar/app-vite/exports/wrappers/wrappers.js'
      ),
      app: path.resolve(__dirname, '.'),
      src: path.resolve(__dirname, 'src'),
      components: path.resolve(__dirname, 'src/components'),
      'src-electron': path.resolve(__dirname, 'src-electron')
    },
    conditions: ['import', 'module', 'browser', 'default']
  },
  assetsInclude: ['**/*.md'],
  test: {
    name: 'unit-components',
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, 'vitest.setup.ts')],
    include: ['src/components/**/*.vitest.test.ts'],
    reporters: ['default', 'json'],
    outputFile: 'test-results/vitest-report/test-results-vitest-components.json',
    clearMocks: true,
    pool: 'forks'
  }
})
