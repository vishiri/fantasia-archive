import { beforeEach, expect, test, vi } from 'vitest'

import { FA_APP_NOTEBOARD_IPC } from 'app/src-electron/electron-ipc-bridge'
import { FA_APP_NOTEBOARD_STORE_DEFAULTS } from 'app/src-electron/mainScripts/appNoteboard/appNoteboard_managerDefaults'

const {
  cleanupFaAppNoteboardMock,
  getFaAppNoteboardMock,
  ipcMainHandleMock
} = vi.hoisted(() => {
  return {
    cleanupFaAppNoteboardMock: vi.fn(),
    getFaAppNoteboardMock: vi.fn(),
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

vi.mock('app/src-electron/mainScripts/appNoteboard/appNoteboard_manager', () => {
  return {
    cleanupFaAppNoteboard: cleanupFaAppNoteboardMock,
    getFaAppNoteboard: getFaAppNoteboardMock
  }
})

beforeEach(async () => {
  vi.resetModules()
  ipcMainHandleMock.mockReset()
  getFaAppNoteboardMock.mockReset()
  cleanupFaAppNoteboardMock.mockReset()
})

function handlerFor (channel: string): (...args: unknown[]) => unknown {
  const call = ipcMainHandleMock.mock.calls.find((c) => c[0]! === channel)
  expect(call).toBeDefined()
  return call![1]! as (...args: unknown[]) => unknown
}

/**
 * registerFaAppNoteboardIpc
 * Get handler returns a snapshot of the persisted root.
 */
test('Test that app noteboard get handler returns a clone of the persisted root', async () => {
  const storeSnap = {
    frame: {
      height: 400,
      width: 400,
      x: 12,
      y: 34
    },
    schemaVersion: 1 as const,
    text: 'hello'
  }
  getFaAppNoteboardMock.mockReturnValue({
    set: vi.fn(),
    store: storeSnap
  })

  const { registerFaAppNoteboardIpc } = await import('../registerFaAppNoteboardIpc')
  registerFaAppNoteboardIpc()

  const getHandler = handlerFor(FA_APP_NOTEBOARD_IPC.getAsync)
  const out = getHandler() as typeof storeSnap

  expect(out).toEqual(storeSnap)
})

/**
 * registerFaAppNoteboardIpc
 * Set handler validates the patch, merges into the store, and runs cleanup.
 */
test('Test that app noteboard set handler merges patch and runs cleanup', async () => {
  const storeSnap = {
    ...FA_APP_NOTEBOARD_STORE_DEFAULTS,
    text: 'keep'
  }
  const setMock = vi.fn()
  const fakeStore = {
    set: setMock,
    store: storeSnap
  }
  getFaAppNoteboardMock.mockReturnValue(fakeStore)

  const { registerFaAppNoteboardIpc } = await import('../registerFaAppNoteboardIpc')
  registerFaAppNoteboardIpc()

  const setHandler = handlerFor(FA_APP_NOTEBOARD_IPC.setAsync)
  setHandler(null, { text: 'next' })

  expect(setMock).toHaveBeenCalledWith({
    frame: null,
    schemaVersion: 1,
    text: 'next'
  })
  expect(cleanupFaAppNoteboardMock).toHaveBeenCalledWith(fakeStore)
})

/**
 * registerFaAppNoteboardIpc
 * Set handler preserves text when only frame is patched.
 */
test('Test that app noteboard set handler merges frame-only patch', async () => {
  const storeSnap = {
    frame: null,
    schemaVersion: 1 as const,
    text: 'body'
  }
  const setMock = vi.fn()
  const fakeStore = {
    set: setMock,
    store: storeSnap
  }
  getFaAppNoteboardMock.mockReturnValue(fakeStore)

  const { registerFaAppNoteboardIpc } = await import('../registerFaAppNoteboardIpc')
  registerFaAppNoteboardIpc()

  const setHandler = handlerFor(FA_APP_NOTEBOARD_IPC.setAsync)
  setHandler(null, {
    frame: {
      height: 200,
      width: 200,
      x: 1,
      y: 2
    }
  })

  expect(setMock).toHaveBeenCalledWith({
    frame: {
      height: 200,
      width: 200,
      x: 1,
      y: 2
    },
    schemaVersion: 1,
    text: 'body'
  })
})

/**
 * registerFaAppNoteboardIpc
 * Set handler rejects malformed payloads without writing.
 */
test('Test that app noteboard set handler rejects non-plain payloads without writing', async () => {
  const setMock = vi.fn()
  getFaAppNoteboardMock.mockReturnValue({
    set: setMock,
    store: { ...FA_APP_NOTEBOARD_STORE_DEFAULTS }
  })

  const { registerFaAppNoteboardIpc } = await import('../registerFaAppNoteboardIpc')
  registerFaAppNoteboardIpc()

  const setHandler = handlerFor(FA_APP_NOTEBOARD_IPC.setAsync)
  expect(() => setHandler(null, null)).toThrow(TypeError)
  expect(setMock).not.toHaveBeenCalled()
})

/**
 * registerFaAppNoteboardIpc
 * Idempotent registration registers handlers only once.
 */
test('Test that registerFaAppNoteboardIpc is safe to call twice', async () => {
  getFaAppNoteboardMock.mockReturnValue({
    set: vi.fn(),
    store: { ...FA_APP_NOTEBOARD_STORE_DEFAULTS }
  })

  const { registerFaAppNoteboardIpc } = await import('../registerFaAppNoteboardIpc')
  registerFaAppNoteboardIpc()
  const first = ipcMainHandleMock.mock.calls.length
  registerFaAppNoteboardIpc()
  expect(ipcMainHandleMock.mock.calls.length).toBe(first)
})
