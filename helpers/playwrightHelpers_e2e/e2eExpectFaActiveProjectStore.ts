import type { Page } from 'playwright'
import { expect } from '@playwright/test'

const MISSING_PROBE_SENTINEL = '__fa_e2e_active_project_probe_missing__'

/**
 * Asserts S_FaActiveProject session name in the renderer via the E2E-only window probe (no menu labels).
 */
export async function e2eExpectFaActiveProjectStoreName (
  page: Page,
  expectedName: string
): Promise<void> {
  await expect.poll(async () =>
    await page.evaluate<string | null>(() => {
      const probe = window.__faE2eGetActiveProjectSnapshot
      if (typeof probe !== 'function') {
        return MISSING_PROBE_SENTINEL
      }
      return probe()?.name ?? null
    })
  ).toBe(expectedName)
}
