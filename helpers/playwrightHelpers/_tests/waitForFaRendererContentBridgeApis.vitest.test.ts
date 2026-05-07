import type { Page } from 'playwright'
import { afterEach, expect, test, vi } from 'vitest'

import {
  waitForFaE2eRendererDomReady,
  waitForFaRendererContentBridgeApis
} from '../waitForFaRendererContentBridgeApis'

afterEach(() => {
  vi.restoreAllMocks()
})

/**
 * waitForFaRendererContentBridgeApis
 * Resolves immediately when the component-testing route is already current.
 */
test('waitForFaRendererContentBridgeApis resolves when the current URL is a component-testing route', async () => {
  const url = vi.fn(() => 'app://./index.html#/componentTesting/DialogAboutFantasiaArchive')
  const waitForTimeout = vi.fn().mockResolvedValue(undefined)
  const appWindow = {
    url,
    waitForTimeout
  } as unknown as Page

  await waitForFaRendererContentBridgeApis(appWindow)

  expect(url).toHaveBeenCalledOnce()
  expect(waitForTimeout).not.toHaveBeenCalled()
})

/**
 * waitForFaRendererContentBridgeApis
 * Polls the URL until Vue Router reaches the component-testing route.
 */
test('waitForFaRendererContentBridgeApis polls until the URL is a component-testing route', async () => {
  const url = vi.fn()
    .mockReturnValueOnce('app://./index.html#/')
    .mockReturnValueOnce('app://./index.html#/componentTesting/DialogAboutFantasiaArchive')
  const waitForTimeout = vi.fn().mockResolvedValue(undefined)
  const appWindow = {
    url,
    waitForTimeout
  } as unknown as Page

  await waitForFaRendererContentBridgeApis(appWindow)

  expect(url).toHaveBeenCalledTimes(2)
  expect(waitForTimeout).toHaveBeenCalledWith(100)
})

/**
 * waitForFaRendererContentBridgeApis
 * Throws when the component-testing route never appears before the timeout.
 */
test('waitForFaRendererContentBridgeApis throws when component-testing route does not appear', async () => {
  let nowMs = 0
  vi.spyOn(Date, 'now').mockImplementation(() => nowMs)

  const url = vi.fn(() => 'app://./index.html#/')
  const waitForTimeout = vi.fn(async (ms: number) => {
    nowMs += ms
    return undefined
  })
  const appWindow = {
    url,
    waitForTimeout
  } as unknown as Page

  await expect(waitForFaRendererContentBridgeApis(appWindow)).rejects.toThrow(
    /Timed out waiting for component-testing route/
  )
})

/**
 * waitForFaE2eRendererDomReady
 * Waits for DOMContentLoaded in E2E startup flows.
 */
test('waitForFaE2eRendererDomReady delegates to waitForLoadState domcontentloaded', async () => {
  const waitForLoadState = vi.fn().mockResolvedValue(undefined)
  const appWindow = {
    waitForLoadState
  } as unknown as Page

  await waitForFaE2eRendererDomReady(appWindow)

  expect(waitForLoadState).toHaveBeenCalledWith(
    'domcontentloaded',
    {
      timeout: 30_000
    }
  )
})
