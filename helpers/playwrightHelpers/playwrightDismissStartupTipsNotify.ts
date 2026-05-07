import type { Page } from 'playwright'
import { ResultAsync } from 'neverthrow'

import L_unsortedAppTexts from 'app/i18n/en-US/globalFunctionality/L_unsortedAppTexts'

/**
 * English copy of the Quasar Notify title used by tipsTricksTriviaNotification (default E2E locale).
 * E2E specs call dismissStartupTipsNotifyIfPresent so menu clicks and shortcuts are not blocked by the banner.
 */
export const startupTipsNotifyHeadingEnUs = L_unsortedAppTexts.didYouKnow

/**
 * Locator for the startup tips Quasar notification when the UI is in en-US (isolated Playwright user data).
 */
export function startupTipsNotificationBanner (page: Page) {
  return page.locator('.q-notification').filter({ hasText: startupTipsNotifyHeadingEnUs }).first()
}

/**
 * Closes the startup tips / tricks Notify via its action button if it is visible, so Playwright clicks are not intercepted.
 * Safe no-op when the banner is absent, already dismissed, or another locale is active.
 * The visible wait is kept short when the banner is absent so beforeAll hooks do not stall for seconds.
 */
export async function dismissStartupTipsNotifyIfPresent (page: Page): Promise<void> {
  const banner = startupTipsNotificationBanner(page)
  const visibleGate = await ResultAsync.fromPromise(
    banner.waitFor({
      state: 'visible',
      timeout: 2000
    }),
    (): undefined => undefined
  )
  if (visibleGate.isErr()) {
    return
  }
  const closeControl = banner
    .locator('.q-notification__actions .q-btn, .q-notification__actions button')
    .first()
  const clickGate = await ResultAsync.fromPromise(
    closeControl.click({ timeout: 4000 }),
    (): undefined => undefined
  )
  if (clickGate.isErr()) {
    return
  }
  await ResultAsync.fromPromise(
    banner.waitFor({
      state: 'hidden',
      timeout: 8000
    }),
    (): undefined => undefined
  ).unwrapOr(undefined)
}
