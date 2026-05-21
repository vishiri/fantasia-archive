import type { Page } from 'playwright'
import { expect } from '@playwright/test'

import { waitForFaPlaywrightE2eAppShellPageTransitionIdle } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eNavigateHome'

/** data-test-locator on the splash Resume split button root. */
export const FA_PLAYWRIGHT_E2E_SPLASH_RESUME_DROPDOWN_LOCATOR = 'splashPage-btn-resume-latest'

/** Quasar menu open slack for the resume split caret (matches AppControlMenus specs). */
export const FA_PLAYWRIGHT_E2E_SPLASH_RESUME_MENU_ANIMATION_MS = 600

/**
 * Primary segment label on the splash Resume split button (uppercase in UI).
 */
export async function expectFaPlaywrightE2eSplashResumePrimaryLabel (
  page: Page,
  expectedLabel: string
): Promise<void> {
  const primary = page.locator(
    `[data-test-locator="${FA_PLAYWRIGHT_E2E_SPLASH_RESUME_DROPDOWN_LOCATOR}"] .q-btn-dropdown--current`
  )
  await expect(primary).toBeVisible()
  await expect(primary).toHaveText(expectedLabel)
}

/**
 * Clicks the splash Resume split primary segment (not the MRU caret).
 */
export async function clickFaPlaywrightE2eSplashResumePrimarySegment (page: Page): Promise<void> {
  await waitForFaPlaywrightE2eAppShellPageTransitionIdle(page)
  await page.locator(
    `[data-test-locator="${FA_PLAYWRIGHT_E2E_SPLASH_RESUME_DROPDOWN_LOCATOR}"] .q-btn-dropdown--current`
  ).click()
  await waitForFaPlaywrightE2eAppShellPageTransitionIdle(page)
}

async function dismissOpenMenus (page: Page): Promise<void> {
  await page.keyboard.press('Escape')
  await page.waitForTimeout(150)
}

/**
 * Opens the splash Resume Latest split caret and waits for the MRU menu panel.
 */
export async function openFaPlaywrightE2eSplashResumeDropdown (page: Page): Promise<void> {
  await dismissOpenMenus(page)
  await waitForFaPlaywrightE2eAppShellPageTransitionIdle(page)
  await page.locator(
    `[data-test-locator="${FA_PLAYWRIGHT_E2E_SPLASH_RESUME_DROPDOWN_LOCATOR}"] .q-btn-dropdown__arrow-container`
  ).click()
  await page.waitForTimeout(FA_PLAYWRIGHT_E2E_SPLASH_RESUME_MENU_ANIMATION_MS)
}

/**
 * Asserts MRU row labels in the splash resume menu, newest-first by row index.
 */
export async function expectFaPlaywrightE2eSplashResumeDropdownLabelsOrdered (
  page: Page,
  expectedLabelsNewestFirst: readonly string[]
): Promise<void> {
  const menuRoot = page.locator('[data-test-locator="splashPage-resumeMenu"]')
  await expect(menuRoot).toBeVisible()
  for (let i = 0; i < expectedLabelsNewestFirst.length; i++) {
    const row = page.locator(`[data-test-locator="splashPage-recentProject-${String(i)}"]`)
    await expect(row).toBeVisible()
    await expect(row.locator('.q-item__label').first()).toHaveText(expectedLabelsNewestFirst[i]!)
  }
}
