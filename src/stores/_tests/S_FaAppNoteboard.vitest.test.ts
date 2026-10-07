import { beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { FA_APP_NOTEBOARD_STORE_DEFAULTS } from 'app/src-electron/mainScripts/appNoteboard/appNoteboard_managerDefaults'
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

test('Test that refreshNoteboard keeps text typed while the read is in flight', async () => {
  let releaseGet: ((root: I_faAppNoteboardRoot) => void) | undefined
  getNoteboardMock.mockImplementationOnce(() => {
    return new Promise<I_faAppNoteboardRoot>((resolve) => {
      releaseGet = resolve
    })
  })
  const refreshPromise = store.refreshNoteboard()
  await vi.waitUntil(() => getNoteboardMock.mock.calls.length === 1)
  store.text = 'typed'
  const finishGet = releaseGet
  if (finishGet === undefined) {
    throw new Error('missing noteboard read resolver')
  }
  finishGet({
    ...FA_APP_NOTEBOARD_STORE_DEFAULTS,
    text: 'from-disk'
  })
  const ok = await refreshPromise
  expect(ok).toBe(true)
  expect(store.text).toBe('typed')
  expect(store.root?.text).toBe('typed')
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

test('Test that a refresh started first does not replace a later noteboard save', async () => {
  let releaseFirstGet: ((root: I_faAppNoteboardRoot) => void) | undefined
  const firstGet = new Promise<I_faAppNoteboardRoot>((resolve) => {
    releaseFirstGet = resolve
  })
  getNoteboardMock.mockImplementationOnce(() => firstGet)
  getNoteboardMock.mockResolvedValueOnce({
    ...FA_APP_NOTEBOARD_STORE_DEFAULTS,
    text: 'saved'
  })

  const refreshPromise = store.refreshNoteboard()
  await vi.waitUntil(() => getNoteboardMock.mock.calls.length === 1)
  const persistPromise = store.persistNoteboardPartialSilent({ text: 'saved' })
  const finishFirstGet = releaseFirstGet
  if (finishFirstGet === undefined) {
    throw new Error('missing noteboard read resolver')
  }
  finishFirstGet({
    ...FA_APP_NOTEBOARD_STORE_DEFAULTS,
    text: 'stale'
  })
  const refreshed = await refreshPromise
  await persistPromise

  expect(refreshed).toBe(true)
  expect(store.text).toBe('saved')
  expect(setNoteboardMock).toHaveBeenCalledWith({ text: 'saved' })
})

test('Test that frame-only persist keeps text typed during the round trip', async () => {
  store.applyRoot({
    ...FA_APP_NOTEBOARD_STORE_DEFAULTS,
    text: 'draft-note'
  })
  const framePatch = {
    frame: {
      height: 400,
      width: 400,
      x: 12,
      y: 48
    }
  } as const satisfies I_faAppNoteboardPatch
  getNoteboardMock.mockImplementationOnce(async () => {
    store.text = 'typed-during-save'
    return {
      ...FA_APP_NOTEBOARD_STORE_DEFAULTS,
      frame: framePatch.frame,
      text: ''
    }
  })
  await store.persistNoteboardPartialSilent(framePatch)
  expect(store.text).toBe('typed-during-save')
  expect(store.root?.text).toBe('typed-during-save')
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

test('Test that persistCurrentTextSilent keeps text typed during the round trip', async () => {
  store.text = 'draft'
  getNoteboardMock.mockImplementationOnce(async () => {
    store.text = 'typed-during-save'
    return {
      ...FA_APP_NOTEBOARD_STORE_DEFAULTS,
      text: 'draft'
    }
  })
  await store.persistCurrentTextSilent()
  expect(store.text).toBe('typed-during-save')
  expect(store.root?.text).toBe('typed-during-save')
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
