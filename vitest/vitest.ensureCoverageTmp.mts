import fs from 'node:fs'
import path from 'node:path'

/**
 * Vitest v8 coverage workers expect coverage temp dirs on Windows.
 */
export function ensureVitestCoverageTmpDir (): void {
  fs.mkdirSync(path.join(process.cwd(), 'coverage', '.tmp'), {
    recursive: true
  })
  fs.mkdirSync(path.join(process.cwd(), 'test-results', 'coverage-components', '.tmp'), {
    recursive: true
  })
}
