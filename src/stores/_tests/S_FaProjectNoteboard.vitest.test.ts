import { beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import type {
  I_faProjectNoteboardPatch,
  I_faProjectNoteboardRoot
} from 'app/types/I_faProjectNoteboardDomain'
import type * as S_FaProjectNoteboardStore from '../S_FaProjectNoteboard'

const emptyRoot: I_faProjectNoteboardRoot = {
  frame: null,
  schemaVersion: 1,
  text: ''
}

const {
  getProjectNoteboardMock,
  setProjectNoteboardMock,
  tMock
} = vi.hoisted(() => {
  return {
    getProjectNoteboardMock: vi.fn(async (): Promise<I_faProjectNoteboardRoot> => ({ ...emptyRoot })),
    setProjectNoteboardMock: vi.fn(async (): Promise<boolean> => true),
    tMock: vi.fn((key: string) => key)
  }
})

vi.mock('app/i18n/externalFileLoader', () => {
  return {
    i18n: { global: { t: tMock } }
  }
})

let store: ReturnType<typeof S_FaProjectNoteboardStore.S_FaProjectNoteboard>

beforeEach(async () => {
  setActivePinia(createPinia())
  vi.resetModules()
  getProjectNoteboardMock.mockReset()
  getProjectNoteboardMock.mockResolvedValue({ ...emptyRoot })
  setProjectNoteboardMock.mockReset()
  setProjectNoteboardMock.mockResolvedValue(true)
  tMock.mockReset()
  tMock.mockImplementation((key: string) => key)

  Object.defineProperty(globalThis, 'window', {
    value: {
      faContentBridgeAPIs: {
        projectManagement: {
          getProjectNoteboard: getProjectNoteboardMock,
          setProjectNoteboard: setProjectNoteboardMock
        }
      }
    },
    configurable: true,
    writable: true
  })

  const stores = await import('../S_FaProjectNoteboard')
  store = stores.S_FaProjectNoteboard()
})

test('Test that refreshProjectNoteboard returns false when the bridge is missing', async () => {
  Object.assign(window.faContentBridgeAPIs, { projectManagement: undefined as never })
  const ok = await store.refreshProjectNoteboard()
  expect(ok).toBe(false)
})

test('Test that refreshProjectNoteboard returns false when getProjectNoteboard is not a function', async () => {
  Object.assign(window.faContentBridgeAPIs, {
    projectManagement: {
      getProjectNoteboard: 'nope',
      setProjectNoteboard: setProjectNoteboardMock
    } as never
  })
  const ok = await store.refreshProjectNoteboard()
  expect(ok).toBe(false)
})

test('Test that refreshProjectNoteboard ignores a read from an older project', async () => {
  let resolveNoteboard: ((value: I_faProjectNoteboardRoot) => void) | undefined
  getProjectNoteboardMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveNoteboard = resolve
    })
  })
  const pending = store.refreshProjectNoteboard()
  await vi.waitUntil(() => getProjectNoteboardMock.mock.calls.length === 1)
  const { S_FaActiveProject } = await import('../S_FaActiveProject')
  S_FaActiveProject().clearActiveProject()
  const finishNoteboard = resolveNoteboard
  if (finishNoteboard === undefined) {
    throw new Error('missing noteboard resolver')
  }
  finishNoteboard({
    frame: null,
    schemaVersion: 1,
    text: 'stale note'
  })
  await expect(pending).resolves.toBe(false)
  expect(store.text).toBe('')
  expect(store.root).toBeNull()
})

test('Test that refreshProjectNoteboard keeps text typed while the read is in flight', async () => {
  let releaseGet: ((root: I_faProjectNoteboardRoot) => void) | undefined
  getProjectNoteboardMock.mockImplementationOnce(() => {
    return new Promise<I_faProjectNoteboardRoot>((resolve) => {
      releaseGet = resolve
    })
  })
  const refreshPromise = store.refreshProjectNoteboard()
  await vi.waitUntil(() => getProjectNoteboardMock.mock.calls.length === 1)
  store.text = 'typed'
  const finishGet = releaseGet
  if (finishGet === undefined) {
    throw new Error('missing project noteboard read resolver')
  }
  finishGet({
    ...emptyRoot,
    text: 'from-disk'
  })
  const ok = await refreshPromise
  expect(ok).toBe(true)
  expect(store.text).toBe('typed')
  expect(store.root?.text).toBe('typed')
})

test('Test that refreshProjectNoteboard mirrors text from the bridge', async () => {
  getProjectNoteboardMock.mockResolvedValueOnce({
    ...emptyRoot,
    text: 'hello'
  })
  const ok = await store.refreshProjectNoteboard()
  expect(ok).toBe(true)
  expect(store.text).toBe('hello')
})

test('Test that a refresh started first does not replace a later project noteboard save', async () => {
  let releaseFirstGet: ((root: I_faProjectNoteboardRoot) => void) | undefined
  const firstGet = new Promise<I_faProjectNoteboardRoot>((resolve) => {
    releaseFirstGet = resolve
  })
  getProjectNoteboardMock.mockImplementationOnce(() => firstGet)
  getProjectNoteboardMock.mockResolvedValueOnce({
    ...emptyRoot,
    text: 'saved'
  })

  const refreshPromise = store.refreshProjectNoteboard()
  await vi.waitUntil(() => getProjectNoteboardMock.mock.calls.length === 1)
  const persistPromise = store.persistProjectNoteboardPartialSilent({ text: 'saved' })
  const finishFirstGet = releaseFirstGet
  if (finishFirstGet === undefined) {
    throw new Error('missing project noteboard read resolver')
  }
  finishFirstGet({
    ...emptyRoot,
    text: 'stale'
  })
  const refreshed = await refreshPromise
  await persistPromise

  expect(refreshed).toBe(true)
  expect(store.text).toBe('saved')
  expect(setProjectNoteboardMock).toHaveBeenCalledWith({ text: 'saved' })
})

test('Test that persistProjectNoteboardPartialSilent updates root after a successful round trip', async () => {
  const patch: I_faProjectNoteboardPatch = { text: 'saved' }

  getProjectNoteboardMock.mockResolvedValueOnce({
    ...emptyRoot,
    text: 'saved'
  })
  await store.persistProjectNoteboardPartialSilent(patch)
  expect(setProjectNoteboardMock).toHaveBeenCalledWith(patch)
  expect(store.text).toBe('saved')
})

test('Test that frame-only persist keeps in-memory text when read-back text still empty (debounced text save)', async () => {
  store.applyRoot({
    ...emptyRoot,
    frame: null,
    text: 'draft-note'
  })
  const framePatch = {
    frame: {
      height: 400,
      width: 400,
      x: 12,
      y: 48
    }
  } as const satisfies I_faProjectNoteboardPatch
  getProjectNoteboardMock.mockResolvedValueOnce({
    ...emptyRoot,
    frame: framePatch.frame,
    text: ''
  })
  await store.persistProjectNoteboardPartialSilent(framePatch)
  expect(setProjectNoteboardMock).toHaveBeenCalledWith(framePatch)
  expect(store.text).toBe('draft-note')
  expect(store.root?.text).toBe('draft-note')
  expect(store.root?.frame).toEqual(framePatch.frame)
})

test('Test that frame-only persist keeps text typed during the round trip', async () => {
  store.applyRoot({
    ...emptyRoot,
    frame: null,
    text: 'draft-note'
  })
  const framePatch = {
    frame: {
      height: 400,
      width: 400,
      x: 12,
      y: 48
    }
  } as const satisfies I_faProjectNoteboardPatch
  getProjectNoteboardMock.mockImplementationOnce(async () => {
    store.text = 'typed-during-save'
    return {
      ...emptyRoot,
      frame: framePatch.frame,
      text: ''
    }
  })
  await store.persistProjectNoteboardPartialSilent(framePatch)
  expect(store.text).toBe('typed-during-save')
  expect(store.root?.text).toBe('typed-during-save')
})

test('Test that persistProjectNoteboardPartialSilent skips read-back when setProjectNoteboard resolves false', async () => {
  setProjectNoteboardMock.mockResolvedValueOnce(false)
  store.applyRoot({
    ...emptyRoot,
    text: 'preserve'
  })
  getProjectNoteboardMock.mockClear()
  await store.persistProjectNoteboardPartialSilent({ frame: null })
  expect(setProjectNoteboardMock).toHaveBeenCalledWith({ frame: null })
  expect(getProjectNoteboardMock).not.toHaveBeenCalled()
  expect(store.text).toBe('preserve')
})

test('Test that refreshProjectNoteboard returns false when getProjectNoteboard rejects', async () => {
  getProjectNoteboardMock.mockRejectedValueOnce(new Error('read fail'))
  const ok = await store.refreshProjectNoteboard()
  expect(ok).toBe(false)
})

test('Test that persistProjectNoteboardPartialSilent throws when setProjectNoteboard is missing', async () => {
  Object.assign(window.faContentBridgeAPIs, {
    projectManagement: {
      getProjectNoteboard: getProjectNoteboardMock
    }
  })
  await expect(store.persistProjectNoteboardPartialSilent({ text: 'x' })).rejects.toThrow(
    'globalFunctionality.faProjectNoteboard.bridgeMissing'
  )
})

test('Test that persistProjectNoteboardPartialSilent wraps non-Error from getProjectNoteboard after save', async () => {
  setProjectNoteboardMock.mockResolvedValueOnce(true)
  getProjectNoteboardMock.mockRejectedValueOnce('plain')
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await expect(store.persistProjectNoteboardPartialSilent({ text: 'x' })).rejects.toThrow('plain')
})

test('Test that persistProjectNoteboardPartialSilent wraps null from getProjectNoteboard after save', async () => {
  setProjectNoteboardMock.mockResolvedValueOnce(true)
  getProjectNoteboardMock.mockRejectedValueOnce(null)
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await expect(store.persistProjectNoteboardPartialSilent({ text: 'x' })).rejects.toThrow('null')
})

test('Test that persistProjectNoteboardPartialSilent throws when getProjectNoteboard rejects with Error after save', async () => {
  setProjectNoteboardMock.mockResolvedValueOnce(true)
  getProjectNoteboardMock.mockRejectedValueOnce(new Error('round trip fail'))
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await expect(store.persistProjectNoteboardPartialSilent({ text: 'x' })).rejects.toThrow(
    'round trip fail'
  )
})

test('Test that persistCurrentTextSilent writes current text', async () => {
  store.text = 'draft'
  getProjectNoteboardMock.mockResolvedValueOnce({
    ...emptyRoot,
    text: 'draft'
  })
  await store.persistCurrentTextSilent()
  expect(setProjectNoteboardMock).toHaveBeenCalledWith({ text: 'draft' })
})

test('Test that persistCurrentTextSilent keeps text typed during the round trip', async () => {
  store.text = 'draft'
  getProjectNoteboardMock.mockImplementationOnce(async () => {
    store.text = 'typed-during-save'
    return {
      ...emptyRoot,
      text: 'draft'
    }
  })
  await store.persistCurrentTextSilent()
  expect(store.text).toBe('typed-during-save')
  expect(store.root?.text).toBe('typed-during-save')
})

test('Test that persistProjectNoteboardPartialSilent throws when setProjectNoteboard fails with an Error', async () => {
  setProjectNoteboardMock.mockRejectedValueOnce(new Error('disk full'))
  await expect(store.persistProjectNoteboardPartialSilent({ text: 'x' })).rejects.toThrow('disk full')
})

test('Test that persistProjectNoteboardPartialSilent wraps null rejection from setProjectNoteboard', async () => {
  setProjectNoteboardMock.mockRejectedValueOnce(null)
  await expect(store.persistProjectNoteboardPartialSilent({ text: 'x' })).rejects.toThrow('null')
})

test('Test that persistProjectNoteboardPartialSilent wraps non-Error from setProjectNoteboard', async () => {
  setProjectNoteboardMock.mockRejectedValueOnce(404)
  await expect(store.persistProjectNoteboardPartialSilent({ text: 'x' })).rejects.toThrow('404')
})

test('Test that a project noteboard save does not write after the project changes', async () => {
  let releaseRefresh: ((root: I_faProjectNoteboardRoot) => void) | undefined
  getProjectNoteboardMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      releaseRefresh = resolve
    })
  })
  const refreshPromise = store.refreshProjectNoteboard()
  await vi.waitUntil(() => getProjectNoteboardMock.mock.calls.length === 1)
  const { S_FaActiveProject } = await import('../S_FaActiveProject')
  const persistPromise = store.persistProjectNoteboardPartialSilent({ text: 'old note' })
  S_FaActiveProject().clearActiveProject()
  const finishRefresh = releaseRefresh
  if (finishRefresh === undefined) {
    throw new Error('missing noteboard refresh resolver')
  }
  finishRefresh({
    ...emptyRoot,
    text: 'fresh'
  })
  await expect(persistPromise).resolves.toBeUndefined()
  await expect(refreshPromise).resolves.toBe(false)
  expect(setProjectNoteboardMock).not.toHaveBeenCalled()
  expect(store.text).toBe('')
})

test('Test that persistProjectNoteboardPartialSilent skips read-back when the project changes during the write', async () => {
  let releaseWrite: ((saved: boolean) => void) | undefined
  setProjectNoteboardMock.mockImplementationOnce(() => {
    return new Promise<boolean>((resolve) => {
      releaseWrite = resolve
    })
  })
  store.applyRoot({
    ...emptyRoot,
    text: 'kept'
  })
  const pending = store.persistProjectNoteboardPartialSilent({ text: 'old note' })
  await vi.waitUntil(() => setProjectNoteboardMock.mock.calls.length === 1)
  const { S_FaActiveProject } = await import('../S_FaActiveProject')
  S_FaActiveProject().clearActiveProject()
  const finishWrite = releaseWrite
  if (finishWrite === undefined) {
    throw new Error('missing noteboard write resolver')
  }
  finishWrite(true)
  await expect(pending).resolves.toBeUndefined()
  expect(getProjectNoteboardMock).not.toHaveBeenCalled()
  expect(store.text).toBe('kept')
})

test('Test that setWindowOpen updates isWindowOpen', () => {
  store.setWindowOpen(true)
  expect(store.isWindowOpen).toBe(true)
  store.setWindowOpen(false)
  expect(store.isWindowOpen).toBe(false)
})
