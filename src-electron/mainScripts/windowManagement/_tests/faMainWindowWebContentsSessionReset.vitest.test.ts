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

/**
 * registerFaMainWindowWebContentsSessionReset
 * Skips closing the DB on the initial load cycle before the first did-finish-load.
 */
test('Test that registerFaMainWindowWebContentsSessionReset does not close DB before first did-finish-load', () => {
  const onceHandlers: Record<string, () => void> = {}
  const onHandlers: Record<string, () => void> = {}
  const wc = {
    on: vi.fn((event: string, handler: () => void) => {
      onHandlers[event] = handler
    }),
    once: vi.fn((event: string, handler: () => void) => {
      onceHandlers[event] = handler
    })
  }

  registerFaMainWindowWebContentsSessionReset(wc as unknown as WebContents)
  onHandlers['did-start-loading']?.()
  expect(closeDbMock).not.toHaveBeenCalled()
})

/**
 * registerFaMainWindowWebContentsSessionReset
 * After the first load, did-start-loading clears the active project database handle.
 */
test('Test that registerFaMainWindowWebContentsSessionReset closes DB on reload after first did-finish-load', () => {
  const onceHandlers: Record<string, () => void> = {}
  const onHandlers: Record<string, () => void> = {}
  const wc = {
    on: vi.fn((event: string, handler: () => void) => {
      onHandlers[event] = handler
    }),
    once: vi.fn((event: string, handler: () => void) => {
      onceHandlers[event] = handler
    })
  }

  registerFaMainWindowWebContentsSessionReset(wc as unknown as WebContents)
  onceHandlers['did-finish-load']?.()
  onHandlers['did-start-loading']?.()
  expect(closeDbMock).toHaveBeenCalledOnce()
})
