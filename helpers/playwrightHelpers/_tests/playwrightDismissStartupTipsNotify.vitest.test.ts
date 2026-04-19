import type { Page } from 'playwright'
import { expect, test, vi } from 'vitest'

import L_unsortedAppTexts from 'app/i18n/en-US/globalFunctionality/L_unsortedAppTexts'

import {
  dismissStartupTipsNotifyIfPresent,
  startupTipsNotificationBanner,
  startupTipsNotifyHeadingEnUs
} from '../playwrightDismissStartupTipsNotify'

/**
 * startupTipsNotifyHeadingEnUs
 * Mirrors the Notify title string from en-US unsorted app texts so E2E helpers stay aligned with production copy.
 */
test('Test startupTipsNotifyHeadingEnUs matches L_unsortedAppTexts.didYouKnow', () => {
  expect(startupTipsNotifyHeadingEnUs).toBe(L_unsortedAppTexts.didYouKnow)
})

/**
 * startupTipsNotificationBanner
 * Builds a Playwright locator chain for the Quasar notify root filtered by the en-US heading.
 */
test('Test startupTipsNotificationBanner chains locator filter and first', () => {
  const first = vi.fn()
  const filter = vi.fn(() => ({ first }))
  const locator = vi.fn(() => ({ filter }))
  const page = { locator } as unknown as Page

  startupTipsNotificationBanner(page)

  expect(locator).toHaveBeenCalledWith('.q-notification')
  expect(filter).toHaveBeenCalledWith({ hasText: L_unsortedAppTexts.didYouKnow })
  expect(first).toHaveBeenCalledOnce()
})

/**
 * dismissStartupTipsNotifyIfPresent
 * Returns without clicking when the banner never becomes visible within the wait budget.
 */
test('Test dismissStartupTipsNotifyIfPresent returns when visible wait times out', async () => {
  const waitFor = vi.fn().mockRejectedValue(new Error('timeout'))
  const banner = { waitFor }
  const page = {
    locator: vi.fn(() => ({
      filter: vi.fn(() => ({
        first: vi.fn(() => banner)
      }))
    }))
  } as unknown as Page

  await dismissStartupTipsNotifyIfPresent(page)

  expect(waitFor).toHaveBeenCalledWith(
    expect.objectContaining({
      state: 'visible',
      timeout: 2000
    })
  )
})

/**
 * dismissStartupTipsNotifyIfPresent
 * Returns without waiting for hidden state when the close control click fails.
 */
test('Test dismissStartupTipsNotifyIfPresent returns when close click fails', async () => {
  const click = vi.fn().mockRejectedValue(new Error('not clickable'))
  const closeFirst = { click }
  const banner = {
    waitFor: vi.fn().mockResolvedValue(undefined),
    locator: vi.fn(() => ({
      first: vi.fn(() => closeFirst)
    }))
  }
  const page = {
    locator: vi.fn(() => ({
      filter: vi.fn(() => ({
        first: vi.fn(() => banner)
      }))
    }))
  } as unknown as Page

  await dismissStartupTipsNotifyIfPresent(page)

  expect(banner.waitFor).toHaveBeenCalledWith(
    expect.objectContaining({
      state: 'visible',
      timeout: 2000
    })
  )
  expect(click).toHaveBeenCalledOnce()
})

/**
 * dismissStartupTipsNotifyIfPresent
 * Completes when the banner hides after a successful close click.
 */
test('Test dismissStartupTipsNotifyIfPresent clicks close then waits for hidden', async () => {
  const click = vi.fn().mockResolvedValue(undefined)
  const closeFirst = { click }
  const banner = {
    waitFor: vi.fn().mockImplementation(async (opts?: { state?: string }) => {
      if (opts?.state === 'visible') {
        return undefined
      }
      if (opts?.state === 'hidden') {
        return undefined
      }
      throw new Error(`unexpected waitFor state ${opts?.state ?? 'undefined'}`)
    }),
    locator: vi.fn(() => ({
      first: vi.fn(() => closeFirst)
    }))
  }
  const page = {
    locator: vi.fn(() => ({
      filter: vi.fn(() => ({
        first: vi.fn(() => banner)
      }))
    }))
  } as unknown as Page

  await dismissStartupTipsNotifyIfPresent(page)

  expect(click).toHaveBeenCalledWith(expect.objectContaining({ timeout: 4000 }))
  expect(banner.waitFor).toHaveBeenCalledWith(
    expect.objectContaining({
      state: 'hidden',
      timeout: 8000
    })
  )
})

/**
 * dismissStartupTipsNotifyIfPresent
 * Resolves when the post-dismiss hidden wait rejects because the implementation treats dismissal as best-effort.
 */
test('Test dismissStartupTipsNotifyIfPresent ignores hidden wait rejection after click', async () => {
  const click = vi.fn().mockResolvedValue(undefined)
  const closeFirst = { click }
  const banner = {
    waitFor: vi.fn().mockImplementation(async (opts?: { state?: string }) => {
      if (opts?.state === 'visible') {
        return undefined
      }
      if (opts?.state === 'hidden') {
        throw new Error('still visible')
      }
      throw new Error(`unexpected waitFor state ${opts?.state ?? 'undefined'}`)
    }),
    locator: vi.fn(() => ({
      first: vi.fn(() => closeFirst)
    }))
  }
  const page = {
    locator: vi.fn(() => ({
      filter: vi.fn(() => ({
        first: vi.fn(() => banner)
      }))
    }))
  } as unknown as Page

  await expect(dismissStartupTipsNotifyIfPresent(page)).resolves.toBeUndefined()
})
