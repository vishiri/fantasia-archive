import { expect, test, vi } from 'vitest'

import type { WebContents } from 'electron'

import { forwardFaChromiumForwardedKeyChordInPage } from '../faChromiumForwardedKeyChordPageDispatchWiring'

test('forwardFaChromiumForwardedKeyChordInPage runs page dispatch script when webContents is live', () => {
  const executeJavaScript = vi.fn<(script: string) => Promise<unknown>>(() => Promise.resolve(undefined))
  const wc = {
    executeJavaScript,
    isDestroyed: () => false
  }

  forwardFaChromiumForwardedKeyChordInPage(wc as unknown as WebContents, 'KeyO')

  expect(executeJavaScript).toHaveBeenCalledOnce()
  expect(String(executeJavaScript.mock.calls[0]![0]!)).toContain('KeyO')
})

test('forwardFaChromiumForwardedKeyChordInPage skips destroyed webContents', () => {
  const executeJavaScript = vi.fn()
  const wc = {
    executeJavaScript,
    isDestroyed: () => true
  }

  forwardFaChromiumForwardedKeyChordInPage(wc as unknown as WebContents, 'KeyO')

  expect(executeJavaScript).not.toHaveBeenCalled()
})
