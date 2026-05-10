import { beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { FA_APP_NOTEBOARD_STORE_DEFAULTS } from 'app/src-electron/mainScripts/appNoteboard/faAppNoteboardStoreDefaults'
import type {
  I_faAppNoteboardPatch,
  I_faAppNoteboardRoot
} from 'app/types/I_faAppNoteboardDomain'
import type * as S_FaAppNoteboardStore from '../S_FaAppNoteboard'

const {
  getNoteboardMock,
  setNoteboardMock,
  tMock
} = vi.hoisted(() => {
  return {
    getNoteboardMock: vi.fn(async (): Promise<I_faAppNoteboardRoot> => ({ ...FA_APP_NOTEBOARD_STORE_DEFAULTS })),
    setNoteboardMock: vi.fn(async () => undefined),
    tMock: vi.fn((key: string) => key)
  }
})

vi.mock('app/i18n/externalFileLoader', () => {
  return {
    i18n: { global: { t: tMock } }
  }
})

let store: ReturnType<typeof S_FaAppNoteboardStore.S_FaAppNoteboard>

beforeEach(async () => {
  setActivePinia(createPinia())
  vi.resetModules()
  getNoteboardMock.mockReset()
  getNoteboardMock.mockResolvedValue({ ...FA_APP_NOTEBOARD_STORE_DEFAULTS })
  setNoteboardMock.mockReset()
  setNoteboardMock.mockResolvedValue(undefined)
  tMock.mockReset()
  tMock.mockImplementation((key: string) => key)

  Object.defineProperty(globalThis, 'window', {
    value: {
      faContentBridgeAPIs: {
        faAppNoteboard: {
          getNoteboard: getNoteboardMock,
          setNoteboard: setNoteboardMock
        }
      }
    },
    configurable: true,
    writable: true
  })

  const stores = await import('../S_FaAppNoteboard')
  store = stores.S_FaAppNoteboard()
})

test('Test that refreshNoteboard returns false when the bridge is missing', async () => {
  Object.assign(window.faContentBridgeAPIs, { faAppNoteboard: undefined as never })
  const ok = await store.refreshNoteboard()
  expect(ok).toBe(false)
})

test('Test that refreshNoteboard returns false when getNoteboard is not a function', async () => {
  Object.assign(window.faContentBridgeAPIs, {
    faAppNoteboard: {
      getNoteboard: 'nope',
      setNoteboard: setNoteboardMock
    } as never
  })
  const ok = await store.refreshNoteboard()
  expect(ok).toBe(false)
})

test('Test that refreshNoteboard mirrors text from the bridge', async () => {
  getNoteboardMock.mockResolvedValueOnce({
    ...FA_APP_NOTEBOARD_STORE_DEFAULTS,
    text: 'hello'
  })
  const ok = await store.refreshNoteboard()
  expect(ok).toBe(true)
  expect(store.text).toBe('hello')
})

test('Test that persistNoteboardPartialSilent updates root after a successful round trip', async () => {
  const patch: I_faAppNoteboardPatch = { text: 'saved' }
  getNoteboardMock.mockResolvedValueOnce({
    ...FA_APP_NOTEBOARD_STORE_DEFAULTS,
    text: 'saved'
  })
  await store.persistNoteboardPartialSilent(patch)
  expect(setNoteboardMock).toHaveBeenCalledWith(patch)
  expect(store.text).toBe('saved')
})

test('Test that refreshNoteboard returns false when getNoteboard rejects', async () => {
  getNoteboardMock.mockRejectedValueOnce(new Error('read fail'))
  const ok = await store.refreshNoteboard()
  expect(ok).toBe(false)
})

test('Test that persistNoteboardPartialSilent throws when setNoteboard is missing', async () => {
  Object.assign(window.faContentBridgeAPIs, {
    faAppNoteboard: {
      getNoteboard: getNoteboardMock
    }
  })
  await expect(store.persistNoteboardPartialSilent({ text: 'x' })).rejects.toThrow(
    'globalFunctionality.faAppNoteboard.bridgeMissing'
  )
})

test('Test that persistNoteboardPartialSilent wraps non-Error from getNoteboard after save', async () => {
  setNoteboardMock.mockResolvedValueOnce(undefined)
  getNoteboardMock.mockRejectedValueOnce('plain')
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await expect(store.persistNoteboardPartialSilent({ text: 'x' })).rejects.toThrow('plain')
})

test('Test that persistNoteboardPartialSilent wraps null from getNoteboard after save', async () => {
  setNoteboardMock.mockResolvedValueOnce(undefined)
  getNoteboardMock.mockRejectedValueOnce(null)
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await expect(store.persistNoteboardPartialSilent({ text: 'x' })).rejects.toThrow('null')
})

test('Test that persistNoteboardPartialSilent throws when getNoteboard rejects with Error after save', async () => {
  setNoteboardMock.mockResolvedValueOnce(undefined)
  getNoteboardMock.mockRejectedValueOnce(new Error('round trip fail'))
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await expect(store.persistNoteboardPartialSilent({ text: 'x' })).rejects.toThrow('round trip fail')
})

test('Test that persistCurrentTextSilent writes current text', async () => {
  store.text = 'draft'
  getNoteboardMock.mockResolvedValueOnce({
    ...FA_APP_NOTEBOARD_STORE_DEFAULTS,
    text: 'draft'
  })
  await store.persistCurrentTextSilent()
  expect(setNoteboardMock).toHaveBeenCalledWith({ text: 'draft' })
})

test('Test that persistNoteboardPartialSilent throws when setNoteboard fails with an Error', async () => {
  setNoteboardMock.mockRejectedValueOnce(new Error('disk full'))
  await expect(store.persistNoteboardPartialSilent({ text: 'x' })).rejects.toThrow('disk full')
})

test('Test that persistNoteboardPartialSilent wraps null rejection from setNoteboard', async () => {
  setNoteboardMock.mockRejectedValueOnce(null)
  await expect(store.persistNoteboardPartialSilent({ text: 'x' })).rejects.toThrow('null')
})

test('Test that persistNoteboardPartialSilent wraps non-Error from setNoteboard', async () => {
  setNoteboardMock.mockRejectedValueOnce(404)
  await expect(store.persistNoteboardPartialSilent({ text: 'x' })).rejects.toThrow('404')
})

test('Test that setWindowOpen updates isWindowOpen', () => {
  store.setWindowOpen(true)
  expect(store.isWindowOpen).toBe(true)
  store.setWindowOpen(false)
  expect(store.isWindowOpen).toBe(false)
})
