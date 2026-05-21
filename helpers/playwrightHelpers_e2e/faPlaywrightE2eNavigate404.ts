import type { Page } from 'playwright'

import { waitForFaPlaywrightE2eAppShellPageTransitionIdle } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eNavigateHome'

/** Deliberately invalid hash route for ErrorNotFound E2E coverage. */
export const FA_PLAYWRIGHT_E2E_NONEXISTENT_ROUTE_PATH = '/this-route-does-not-exist-at-all-e2e-404'

/**
 * Navigates the packaged renderer to the catch-all ErrorNotFound route inside MainLayout.
 */
export async function gotoFaPlaywrightE2eNonexistentRouteFor404 (page: Page): Promise<void> {
  const currentUrl = page.url()
  const hashIndex = currentUrl.indexOf('#')
  const baseUrl = hashIndex >= 0 ? currentUrl.slice(0, hashIndex) : currentUrl
  await page.goto(`${baseUrl}#${FA_PLAYWRIGHT_E2E_NONEXISTENT_ROUTE_PATH}`, { waitUntil: 'domcontentloaded' })
  await waitForFaPlaywrightE2eAppShellPageTransitionIdle(page)
}
