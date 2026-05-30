import { beforeEach, expect, test, vi } from 'vitest'

import { FA_APP_STYLING_IPC } from 'app/src-electron/electron-ipc-bridge'
import { FA_APP_STYLING_STORE_DEFAULTS } from 'app/src-electron/mainScripts/appStyling/appStyling_managerDefaults'

const {
  cleanupFaAppStylingMock,
  getFaAppStylingMock,
  ipcMainHandleMock
} = vi.hoisted(() => {
  return {
    cleanupFaAppStylingMock: vi.fn(),
    getFaAppStylingMock: vi.fn(),
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

vi.mock('app/src-electron/mainScripts/appStyling/appStyling_manager', () => {
  return {
    cleanupFaAppStyling: cleanupFaAppStylingMock,
    getFaAppStyling: getFaAppStylingMock
  }
})

beforeEach(async () => {
  vi.resetModules()
  ipcMainHandleMock.mockReset()
  getFaAppStylingMock.mockReset()
  cleanupFaAppStylingMock.mockReset()
})

function handlerFor (channel: string): (...args: unknown[]) => unknown {
  const call = ipcMainHandleMock.mock.calls.find((c) => c[0] === channel)
  expect(call).toBeDefined()
  return call![1] as (...args: unknown[]) => unknown
}

/**
 * registerFaAppStylingIpc
 * Get handler returns a snapshot of the persisted root.
 */
test('Test that app styling get handler returns a clone of the persisted root', async () => {
  const storeSnap = {
    css: '/* current */',
    frame: null,
    schemaVersion: 1 as const
  }
  getFaAppStylingMock.mockReturnValue({
    set: vi.fn(),
    store: storeSnap
  })

  const { registerFaAppStylingIpc } = await import('../registerFaAppStylingIpc')
  registerFaAppStylingIpc()

  const getHandler = handlerFor(FA_APP_STYLING_IPC.getAsync)
  const out = getHandler() as typeof storeSnap

  expect(out).toEqual(storeSnap)
})

/**
 * registerFaAppStylingIpc
 * Set handler validates the patch and writes a normalized root then runs cleanup.
 */
test('Test that app styling set handler writes the parsed css and runs cleanup', async () => {
  const storeSnap = { ...FA_APP_STYLING_STORE_DEFAULTS }
  const setMock = vi.fn()
  const fakeStore = {
    set: setMock,
    store: storeSnap
  }
  getFaAppStylingMock.mockReturnValue(fakeStore)

  const { registerFaAppStylingIpc } = await import('../registerFaAppStylingIpc')
  registerFaAppStylingIpc()

  const setHandler = handlerFor(FA_APP_STYLING_IPC.setAsync)
  setHandler(null, { css: '.user { background: black; }' })

  expect(setMock).toHaveBeenCalledWith({
    css: '.user { background: black; }',
    frame: null,
    schemaVersion: 1
  })
  expect(cleanupFaAppStylingMock).toHaveBeenCalledWith(fakeStore)
})

test('Test that app styling set handler keeps current css when patch only updates frame', async () => {
  const storeSnap = {
    css: '/* keep-me */',
    frame: null,
    schemaVersion: 1 as const
  }
  const setMock = vi.fn()
  const fakeStore = {
    set: setMock,
    store: storeSnap
  }
  getFaAppStylingMock.mockReturnValue(fakeStore)

  const { registerFaAppStylingIpc } = await import('../registerFaAppStylingIpc')
  registerFaAppStylingIpc()

  const setHandler = handlerFor(FA_APP_STYLING_IPC.setAsync)
  setHandler(null, {
    frame: {
      height: 400,
      width: 440,
      x: 10,
      y: 20
    }
  })

  expect(setMock).toHaveBeenCalledWith({
    css: '/* keep-me */',
    frame: {
      height: 400,
      width: 440,
      x: 10,
      y: 20
    },
    schemaVersion: 1
  })
})

/**
 * registerFaAppStylingIpc
 * Set handler rejects malformed payloads via the strict patch schema (TypeError or ZodError) and never writes.
 */
test('Test that app styling set handler rejects non-plain payloads without writing', async () => {
  const setMock = vi.fn()
  getFaAppStylingMock.mockReturnValue({
    set: setMock,
    store: { ...FA_APP_STYLING_STORE_DEFAULTS }
  })

  const { registerFaAppStylingIpc } = await import('../registerFaAppStylingIpc')
  registerFaAppStylingIpc()

  const setHandler = handlerFor(FA_APP_STYLING_IPC.setAsync)
  expect(() => setHandler(null, null)).toThrow()
  expect(() => setHandler(null, { css: 12 })).toThrow()
  expect(() => setHandler(null, {})).toThrow()
  expect(setMock).not.toHaveBeenCalled()
})

/**
 * registerFaAppStylingIpc
 * Second registration does not register duplicate ipcMain handlers.
 */
test('Test that registerFaAppStylingIpc only registers ipc handlers once', async () => {
  getFaAppStylingMock.mockReturnValue({
    set: vi.fn(),
    store: { ...FA_APP_STYLING_STORE_DEFAULTS }
  })

  const { registerFaAppStylingIpc } = await import('../registerFaAppStylingIpc')
  registerFaAppStylingIpc()
  registerFaAppStylingIpc()

  expect(ipcMainHandleMock).toHaveBeenCalledTimes(2)
})
