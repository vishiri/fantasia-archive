import type { Page } from 'playwright'
import { expect } from '@playwright/test'

import L_faProjectSession from 'app/i18n/en-US/globalFunctionality/L_faProjectSession'

/**
 * Substitutes a project display name into vue-i18n notify templates that use a projectName placeholder.
 */
export function interpolateFaProjectSessionNotify (
  template: string,
  projectName: string
): string {
  return template.split('{projectName}').join(projectName)
}

/**
 * Idempotent open flows show the already-active warning and must not emit another loaded notify.
 */
export async function expectFaPlaywrightE2eProjectAlreadyActiveReuseAfter (
  page: Page,
  projectName: string,
  loadedNotifyText: string,
  run: () => Promise<void>
): Promise<void> {
  const loadedLocator = page.getByText(loadedNotifyText)
  const loadedCountBefore = await loadedLocator.count()
  const warningText = interpolateFaProjectSessionNotify(
    L_faProjectSession.openRejectedAlreadyActive,
    projectName
  )
  await run()
  await expect(page.getByText(warningText)).toBeVisible()
  await expect.poll(async () => loadedLocator.count()).toBe(loadedCountBefore)
}

/**
 * Quiet resume (splash or 404) must not surface already-active or loaded toasts.
 */
export async function expectFaPlaywrightE2eNoProjectSessionNotifyForName (
  page: Page,
  projectName: string
): Promise<void> {
  const warningNotify = interpolateFaProjectSessionNotify(
    L_faProjectSession.openRejectedAlreadyActive,
    projectName
  )
  const loadedNotify = interpolateFaProjectSessionNotify(
    L_faProjectSession.notifyProjectLoaded,
    projectName
  )
  await expect(page.getByText(warningNotify)).toHaveCount(0)
  await expect(page.getByText(loadedNotify)).toHaveCount(0)
}

/**
 * Runs a quiet resume action and asserts no new already-active or loaded notify appears
 * (stale Quasar banners from earlier steps in the same serial suite are allowed).
 */
export async function expectFaPlaywrightE2eQuietProjectSessionResumeForName (
  page: Page,
  projectName: string,
  run: () => Promise<void>
): Promise<void> {
  const warningNotify = interpolateFaProjectSessionNotify(
    L_faProjectSession.openRejectedAlreadyActive,
    projectName
  )
  const loadedNotify = interpolateFaProjectSessionNotify(
    L_faProjectSession.notifyProjectLoaded,
    projectName
  )
  const warningLocator = page.getByText(warningNotify)
  const loadedLocator = page.getByText(loadedNotify)
  const warningCountBefore = await warningLocator.count()
  const loadedCountBefore = await loadedLocator.count()
  await run()
  await expect.poll(async () => warningLocator.count()).toBe(warningCountBefore)
  await expect.poll(async () => loadedLocator.count()).toBe(loadedCountBefore)
}
