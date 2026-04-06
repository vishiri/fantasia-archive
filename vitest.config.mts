import path from 'path'
import { fileURLToPath } from 'url'

import { defineConfig } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Vitest multi-project root: workspace root is the repo so globs like `src-electron/**` resolve correctly.
 * Child configs live under vitest/ and merge via `extends`.
 */
export default defineConfig({
  root: __dirname,
  test: {
    projects: [
      {
        extends: './vitest/vitest.electron.config.mts'
      },
      {
        extends: './vitest/vitest.src-renderer.config.mts'
      },
      {
        extends: './vitest/vitest.helpers.config.mts'
      },
      {
        extends: './vitest/vitest.components.config.mts'
      }
    ]
  }
})
