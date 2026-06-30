import { ensureVitestCoverageTmpDir } from './vitest.ensureCoverageTmp'

/**
 * Vitest globalSetup: ensure coverage temp dirs exist before workers start.
 */
export default function vitestCoverageTmpSetup (): void {
  ensureVitestCoverageTmpDir()
}
