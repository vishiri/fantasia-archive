import type { Page } from 'playwright'
import { expect } from '@playwright/test'

import { FA_APP_SHELL_PAGE_TRANSITION_MS } from 'app/src/scripts/appRouting/faAppShellPageTransition'

const FA_E2E_ROUTE_SHELL_TIMEOUT_MS = 20_000
const FA_E2E_PAGE_TRANSITION_SETTLE_TIMEOUT_MS = FA_APP_SHELL_PAGE_TRANSITION_MS + 5_000

/**
 * Waits until the MainLayout page crossfade is not blocking pointer events.
 */
export async function waitForFaPlaywrightE2eAppShellPageTransitionIdle (page: Page): Promise<void> {
  await expect.poll(async () => {
    return await page.locator(
      '.fa-appShellPage-enter-active, .fa-appShellPage-leave-active'
    ).count()
  }, { timeout: FA_E2E_PAGE_TRANSITION_SETTLE_TIMEOUT_MS }).toBe(0)
}

/**
 * Waits until the welcome route has mounted inside the shared MainLayout shell.
 */
export async function waitForFaPlaywrightE2eSplashRouteReady (page: Page): Promise<void> {
  await page.locator('[data-test-locator="mainLayout"]').waitFor({
    state: 'visible',
    timeout: FA_E2E_ROUTE_SHELL_TIMEOUT_MS
  })
  await page.locator('[data-test-locator="splashPage"]').waitFor({
    state: 'visible',
    timeout: FA_E2E_ROUTE_SHELL_TIMEOUT_MS
  })
}

/**
 * Navigates the packaged Electron renderer to the welcome route (SplashPage under MainLayout).
 */
export async function navigateFaPlaywrightE2eToSplashRoute (page: Page): Promise<void> {
  const currentUrl = page.url()
  const hashRoute = currentUrl.includes('#') ? currentUrl.slice(currentUrl.indexOf('#') + 1) : ''
  const onWelcomeRoute = hashRoute === '' || hashRoute === '/'
  if (!onWelcomeRoute) {
    const hashIndex = currentUrl.indexOf('#')
    const baseUrl = hashIndex >= 0 ? currentUrl.slice(0, hashIndex) : currentUrl
    await page.goto(`${baseUrl}#/`, { waitUntil: 'domcontentloaded' })
    await waitForFaPlaywrightE2eSplashRouteReady(page)
    await waitForFaPlaywrightE2eAppShellPageTransitionIdle(page)
    return
  }
  await waitForFaPlaywrightE2eSplashRouteReady(page)
}

/**
 * Navigates the packaged Electron renderer from the welcome route to the legacy home workspace shell.
 */
export async function navigateFaPlaywrightE2eToHomeRoute (page: Page): Promise<void> {
  const currentUrl = page.url()
  if (currentUrl.includes('#/home')) {
    await page.locator('[data-test-locator="mainLayout"]').waitFor({
      state: 'visible',
      timeout: FA_E2E_ROUTE_SHELL_TIMEOUT_MS
    })
    await page.locator('[data-test-locator="mainLayout-drawer"]').waitFor({
      state: 'visible',
      timeout: FA_E2E_ROUTE_SHELL_TIMEOUT_MS
    })
    return
  }

  const hashIndex = currentUrl.indexOf('#')
  const baseUrl = hashIndex >= 0 ? currentUrl.slice(0, hashIndex) : currentUrl
  await page.goto(`${baseUrl}#/home`, { waitUntil: 'domcontentloaded' })
  await page.locator('[data-test-locator="mainLayout"]').waitFor({
    state: 'visible',
    timeout: FA_E2E_ROUTE_SHELL_TIMEOUT_MS
  })
  await page.locator('[data-test-locator="mainLayout-drawer"]').waitFor({
    state: 'visible',
    timeout: FA_E2E_ROUTE_SHELL_TIMEOUT_MS
  })
  await waitForFaPlaywrightE2eAppShellPageTransitionIdle(page)
}
