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

type T_e2eActiveProbePoll = 'missing-probe' | 'empty' | string

/**
 * Asserts **S_FaActiveProject** has no loaded session (Pinia snapshot name absent) after navigation or reload.
 */
export async function e2eExpectFaActiveProjectStoreEmpty (page: Page): Promise<void> {
  await expect.poll(async () =>
    await page.evaluate<T_e2eActiveProbePoll>(() => {
      const probe = window.__faE2eGetActiveProjectSnapshot
      if (typeof probe !== 'function') {
        return 'missing-probe'
      }
      const snap = probe()
      if (snap === null) {
        return 'empty'
      }
      return snap.name
    })
  , { timeout: 30_000 }).toBe('empty')
}
