import type { Page } from 'playwright'
import { expect } from '@playwright/test'

/**
 * Reads the hash route segment from a packaged Electron renderer URL (for example '#/home' → '/home').
 */
export function readFaPlaywrightE2eHashRoute (pageUrl: string): string {
  const hashIndex = pageUrl.indexOf('#')
  if (hashIndex < 0) {
    return ''
  }
  const hash = pageUrl.slice(hashIndex + 1)
  if (hash === '' || hash === '/') {
    return '/'
  }
  return hash.startsWith('/') ? hash : `/${hash}`
}

/**
 * Polls until the renderer hash route matches the expected workspace or welcome path.
 */
export async function expectFaPlaywrightE2eHashRoute (
  page: Page,
  expectedRoute: string
): Promise<void> {
  const normalized = expectedRoute === '/'
    ? '/'
    : (expectedRoute.startsWith('/') ? expectedRoute : `/${expectedRoute}`)

  await expect.poll(() => readFaPlaywrightE2eHashRoute(page.url())).toBe(normalized)
}

/**
 * Welcome route keeps MainLayout chrome with SplashPage and no workspace drawer band.
 */
export async function expectFaPlaywrightE2eWelcomeShell (page: Page): Promise<void> {
  const mainLayout = page.locator('[data-test-locator="mainLayout"]')
  await expect(mainLayout).toBeVisible()
  await expect(mainLayout).toHaveClass(/appShellLayout--welcome/)
  await expect(page.locator('[data-test-locator="splashPage"]')).toBeVisible()
  await expect(page.locator('.appShellLayout--workspace')).toHaveCount(0)
}

/**
 * Workspace route shows the left drawer inside the MainLayout shell.
 */
export async function expectFaPlaywrightE2eWorkspaceShell (page: Page): Promise<void> {
  const mainLayout = page.locator('[data-test-locator="mainLayout"]')
  await expect(mainLayout).toBeVisible()
  await expect(mainLayout).toHaveClass(/appShellLayout--workspace/)
  await expect(page.locator(
    '[data-test-locator="mainLayout"].appShellLayout--workspace [data-test-locator="mainLayout-drawer"]'
  )).toBeVisible()
}
