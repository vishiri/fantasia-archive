import type { WebContents } from 'electron'
import { afterEach, expect, test, vi } from 'vitest'

const closeDbMock = vi.hoisted(() => vi.fn())

vi.mock('app/src-electron/mainScripts/projectManagement/faProjectActiveDatabase', () => {
  return {
    closeFaProjectActiveDatabase: closeDbMock
  }
})

import { registerFaMainWindowWebContentsSessionReset } from '../faMainWindowWebContentsSessionReset'

afterEach(() => {
  closeDbMock.mockReset()
})

const navDetailsMainDocument = {
  isMainFrame: true,
  isSameDocument: false
}

/**
 * registerFaMainWindowWebContentsSessionReset
 * Skips closing the DB on the initial load cycle before the first did-finish-load.
 */
test('Test that registerFaMainWindowWebContentsSessionReset does not close DB before first did-finish-load', () => {
  const onceHandlers: Record<string, () => void> = {}
  const onHandlers: Record<string, (d: typeof navDetailsMainDocument) => void> = {}
  const wc = {
    on: vi.fn((event: string, handler: (d: typeof navDetailsMainDocument) => void) => {
      onHandlers[event] = handler
    }),
    once: vi.fn((event: string, handler: () => void) => {
      onceHandlers[event] = handler
    })
  }

  registerFaMainWindowWebContentsSessionReset(wc as unknown as WebContents)
  onHandlers['did-start-navigation']?.(navDetailsMainDocument)
  expect(closeDbMock).not.toHaveBeenCalled()
})

/**
 * registerFaMainWindowWebContentsSessionReset
 * After the first load, main-frame non-same-document navigation clears the active project database handle.
 */
test('Test that registerFaMainWindowWebContentsSessionReset closes DB on document navigation after first did-finish-load', () => {
  const onceHandlers: Record<string, () => void> = {}
  const onHandlers: Record<string, (d: typeof navDetailsMainDocument) => void> = {}
  const wc = {
    on: vi.fn((event: string, handler: (d: typeof navDetailsMainDocument) => void) => {
      onHandlers[event] = handler
    }),
    once: vi.fn((event: string, handler: () => void) => {
      onceHandlers[event] = handler
    })
  }

  registerFaMainWindowWebContentsSessionReset(wc as unknown as WebContents)
  onceHandlers['did-finish-load']?.()
  onHandlers['did-start-navigation']?.(navDetailsMainDocument)
  expect(closeDbMock).toHaveBeenCalledOnce()
})

test('Test that registerFaMainWindowWebContentsSessionReset ignores same-document navigations', () => {
  const onceHandlers: Record<string, () => void> = {}
  const onHandlers: Record<string, (d: { isMainFrame: boolean, isSameDocument: boolean }) => void> = {}
  const wc = {
    on: vi.fn((event: string, handler: (d: { isMainFrame: boolean, isSameDocument: boolean }) => void) => {
      onHandlers[event] = handler
    }),
    once: vi.fn((event: string, handler: () => void) => {
      onceHandlers[event] = handler
    })
  }

  registerFaMainWindowWebContentsSessionReset(wc as unknown as WebContents)
  onceHandlers['did-finish-load']?.()
  onHandlers['did-start-navigation']?.({
    isMainFrame: true,
    isSameDocument: true
  })
  expect(closeDbMock).not.toHaveBeenCalled()
})

test('Test that registerFaMainWindowWebContentsSessionReset ignores subframe navigations', () => {
  const onceHandlers: Record<string, () => void> = {}
  const onHandlers: Record<string, (d: { isMainFrame: boolean, isSameDocument: boolean }) => void> = {}
  const wc = {
    on: vi.fn((event: string, handler: (d: { isMainFrame: boolean, isSameDocument: boolean }) => void) => {
      onHandlers[event] = handler
    }),
    once: vi.fn((event: string, handler: () => void) => {
      onceHandlers[event] = handler
    })
  }

  registerFaMainWindowWebContentsSessionReset(wc as unknown as WebContents)
  onceHandlers['did-finish-load']?.()
  onHandlers['did-start-navigation']?.({
    isMainFrame: false,
    isSameDocument: false
  })
  expect(closeDbMock).not.toHaveBeenCalled()
})
