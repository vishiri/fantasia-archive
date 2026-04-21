import { beforeEach, expect, test, vi } from 'vitest'

import { FA_PROGRAM_STYLING_IPC } from 'app/src-electron/electron-ipc-bridge'
import { FA_PROGRAM_STYLING_STORE_DEFAULTS } from 'app/src-electron/mainScripts/programStyling/faProgramStylingStoreDefaults'

const {
  cleanupFaProgramStylingMock,
  getFaProgramStylingMock,
  ipcMainHandleMock
} = vi.hoisted(() => {
  return {
    cleanupFaProgramStylingMock: vi.fn(),
    getFaProgramStylingMock: vi.fn(),
    ipcMainHandleMock: vi.fn()
  }
})

vi.mock('electron', () => {
  return {
    ipcMain: {
      handle: ipcMainHandleMock
    }
  }
})

vi.mock('app/src-electron/mainScripts/programStyling/faProgramStylingStore', () => {
  return {
    cleanupFaProgramStyling: cleanupFaProgramStylingMock,
    getFaProgramStyling: getFaProgramStylingMock
  }
})

beforeEach(async () => {
  vi.resetModules()
  ipcMainHandleMock.mockReset()
  getFaProgramStylingMock.mockReset()
  cleanupFaProgramStylingMock.mockReset()
})

function handlerFor (channel: string): (...args: unknown[]) => unknown {
  const call = ipcMainHandleMock.mock.calls.find((c) => c[0] === channel)
  expect(call).toBeDefined()
  return call![1] as (...args: unknown[]) => unknown
}

/**
 * registerFaProgramStylingIpc
 * Get handler returns a snapshot of the persisted root.
 */
test('Test that program styling get handler returns a clone of the persisted root', async () => {
  const storeSnap = {
    css: '/* current */',
    schemaVersion: 1 as const
  }
  getFaProgramStylingMock.mockReturnValue({
    set: vi.fn(),
    store: storeSnap
  })

  const { registerFaProgramStylingIpc } = await import('../registerFaProgramStylingIpc')
  registerFaProgramStylingIpc()

  const getHandler = handlerFor(FA_PROGRAM_STYLING_IPC.getAsync)
  const out = getHandler() as typeof storeSnap

  expect(out).toEqual(storeSnap)
})

/**
 * registerFaProgramStylingIpc
 * Set handler validates the patch and writes a normalized root then runs cleanup.
 */
test('Test that program styling set handler writes the parsed css and runs cleanup', async () => {
  const storeSnap = { ...FA_PROGRAM_STYLING_STORE_DEFAULTS }
  const setMock = vi.fn()
  const fakeStore = {
    set: setMock,
    store: storeSnap
  }
  getFaProgramStylingMock.mockReturnValue(fakeStore)

  const { registerFaProgramStylingIpc } = await import('../registerFaProgramStylingIpc')
  registerFaProgramStylingIpc()

  const setHandler = handlerFor(FA_PROGRAM_STYLING_IPC.setAsync)
  setHandler(null, { css: '.user { background: black; }' })

  expect(setMock).toHaveBeenCalledWith({
    css: '.user { background: black; }',
    schemaVersion: 1
  })
  expect(cleanupFaProgramStylingMock).toHaveBeenCalledWith(fakeStore)
})

/**
 * registerFaProgramStylingIpc
 * Set handler rejects malformed payloads via the strict patch schema (TypeError or ZodError) and never writes.
 */
test('Test that program styling set handler rejects non-plain payloads without writing', async () => {
  const setMock = vi.fn()
  getFaProgramStylingMock.mockReturnValue({
    set: setMock,
    store: { ...FA_PROGRAM_STYLING_STORE_DEFAULTS }
  })

  const { registerFaProgramStylingIpc } = await import('../registerFaProgramStylingIpc')
  registerFaProgramStylingIpc()

  const setHandler = handlerFor(FA_PROGRAM_STYLING_IPC.setAsync)
  expect(() => setHandler(null, null)).toThrow()
  expect(() => setHandler(null, { css: 12 })).toThrow()
  expect(setMock).not.toHaveBeenCalled()
})

/**
 * registerFaProgramStylingIpc
 * Second registration does not register duplicate ipcMain handlers.
 */
test('Test that registerFaProgramStylingIpc only registers ipc handlers once', async () => {
  getFaProgramStylingMock.mockReturnValue({
    set: vi.fn(),
    store: { ...FA_PROGRAM_STYLING_STORE_DEFAULTS }
  })

  const { registerFaProgramStylingIpc } = await import('../registerFaProgramStylingIpc')
  registerFaProgramStylingIpc()
  registerFaProgramStylingIpc()

  expect(ipcMainHandleMock).toHaveBeenCalledTimes(2)
})
