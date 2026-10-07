import { beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import type {
  I_faProjectStylingPatch,
  I_faProjectStylingRoot
} from 'app/types/I_faProjectStylingDomain'
import type * as S_FaProjectStylingStore from '../S_FaProjectStyling'

const emptyRoot: I_faProjectStylingRoot = {
  css: '',
  frame: null,
  schemaVersion: 1
}

const {
  getProjectStylingMock,
  notifyCreateMock,
  setProjectStylingMock,
  tMock
} = vi.hoisted(() => {
  return {
    getProjectStylingMock: vi.fn(async (): Promise<I_faProjectStylingRoot> => ({ ...emptyRoot })),
    notifyCreateMock: vi.fn(),
    setProjectStylingMock: vi.fn(async (): Promise<boolean> => true),
    tMock: vi.fn((key: string) => key)
  }
})

vi.mock('quasar', () => {
  return {
    Notify: { create: notifyCreateMock },
    copyToClipboard: vi.fn(async () => undefined)
  }
})

vi.mock('app/i18n/externalFileLoader', () => {
  return {
    i18n: { global: { t: tMock } }
  }
})

let store: ReturnType<typeof S_FaProjectStylingStore.S_FaProjectStyling>

beforeEach(async () => {
  setActivePinia(createPinia())
  vi.resetModules()
  getProjectStylingMock.mockReset()
  getProjectStylingMock.mockResolvedValue({ ...emptyRoot })
  setProjectStylingMock.mockReset()
  setProjectStylingMock.mockResolvedValue(true)
  notifyCreateMock.mockReset()
  tMock.mockReset()
  tMock.mockImplementation((key: string) => key)

  Object.defineProperty(globalThis, 'window', {
    value: {
      faContentBridgeAPIs: {
        projectManagement: {
          getProjectStyling: getProjectStylingMock,
          setProjectStyling: setProjectStylingMock
        }
      }
    },
    configurable: true,
    writable: true
  })

  const stores = await import('../S_FaProjectStyling')
  store = stores.S_FaProjectStyling()
})

test('Test that setCssLivePreview and clearCssLivePreview update cssLivePreview', () => {
  expect(store.cssLivePreview).toBeNull()
  store.setCssLivePreview('body { margin: 0; }')
  expect(store.cssLivePreview).toBe('body { margin: 0; }')
  store.clearCssLivePreview()
  expect(store.cssLivePreview).toBeNull()
})

test('Test that refreshProjectStyling returns false when the bridge is missing', async () => {
  Object.assign(window.faContentBridgeAPIs, { projectManagement: undefined as never })
  const ok = await store.refreshProjectStyling()
  expect(ok).toBe(false)
})

test('Test that refreshProjectStyling returns false when getProjectStyling is not a function', async () => {
  Object.assign(window.faContentBridgeAPIs, {
    projectManagement: {
      getProjectStyling: 'nope',
      setProjectStyling: setProjectStylingMock
    } as never
  })
  const ok = await store.refreshProjectStyling()
  expect(ok).toBe(false)
})

test('Test that refreshProjectStyling ignores a read from an older project', async () => {
  let resolveStyling: ((value: I_faProjectStylingRoot) => void) | undefined
  getProjectStylingMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveStyling = resolve
    })
  })
  const pending = store.refreshProjectStyling()
  const { S_FaActiveProject } = await import('../S_FaActiveProject')
  await vi.waitUntil(() => getProjectStylingMock.mock.calls.length === 1)
  S_FaActiveProject().clearActiveProject()
  const finishStyling = resolveStyling
  if (finishStyling === undefined) {
    throw new Error('missing styling resolver')
  }
  finishStyling({
    css: 'body{color:stale}',
    frame: null,
    schemaVersion: 1
  })
  await expect(pending).resolves.toBe(false)
  expect(store.css).toBe('')
  expect(store.root).toBeNull()
})

test('Test that refreshProjectStyling mirrors css from the bridge', async () => {
  getProjectStylingMock.mockResolvedValueOnce({
    ...emptyRoot,
    css: 'body{color:red}'
  })
  const ok = await store.refreshProjectStyling()
  expect(ok).toBe(true)
  expect(store.css).toBe('body{color:red}')
})

test('Test that a refresh started first does not replace a later project styling save', async () => {
  let releaseFirstGet: ((root: I_faProjectStylingRoot) => void) | undefined
  const firstGet = new Promise<I_faProjectStylingRoot>((resolve) => {
    releaseFirstGet = resolve
  })
  getProjectStylingMock.mockImplementationOnce(() => firstGet)
  getProjectStylingMock.mockResolvedValueOnce({
    ...emptyRoot,
    css: 'saved'
  })

  const refreshPromise = store.refreshProjectStyling()
  await vi.waitUntil(() => getProjectStylingMock.mock.calls.length === 1)
  const persistPromise = store.persistProjectStylingPartialSilent({ css: 'saved' })
  const finishFirstGet = releaseFirstGet
  if (finishFirstGet === undefined) {
    throw new Error('missing project styling read resolver')
  }
  finishFirstGet({
    ...emptyRoot,
    css: 'stale'
  })
  const refreshed = await refreshPromise
  await persistPromise

  expect(refreshed).toBe(true)
  expect(store.css).toBe('saved')
  expect(setProjectStylingMock).toHaveBeenCalledWith({ css: 'saved' })
})

test('Test that persistProjectStylingPartialSilent updates root after a successful round trip', async () => {
  const patch: I_faProjectStylingPatch = { css: 'saved' }

  getProjectStylingMock.mockResolvedValueOnce({
    ...emptyRoot,
    css: 'saved'
  })
  await store.persistProjectStylingPartialSilent(patch)
  expect(setProjectStylingMock).toHaveBeenCalledWith(patch)
  expect(store.css).toBe('saved')
})

test('Test that css-only persist keeps in-memory css when read-back css still empty (debounced css save)', async () => {
  store.applyRoot({
    ...emptyRoot,
    css: '.draft{display:block}',
    frame: null
  })
  const framePatch = {
    frame: {
      height: 400,
      width: 400,
      x: 12,
      y: 48
    }
  } as const satisfies I_faProjectStylingPatch
  getProjectStylingMock.mockResolvedValueOnce({
    ...emptyRoot,
    css: '',
    frame: framePatch.frame
  })
  await store.persistProjectStylingPartialSilent(framePatch)
  expect(setProjectStylingMock).toHaveBeenCalledWith(framePatch)
  expect(store.css).toBe('.draft{display:block}')
  expect(store.root?.css).toBe('.draft{display:block}')
  expect(store.root?.frame).toEqual(framePatch.frame)
})

test('Test that frame-only persist keeps css typed during the round trip', async () => {
  store.applyRoot({
    ...emptyRoot,
    css: '.draft{display:block}',
    frame: null
  })
  const framePatch = {
    frame: {
      height: 400,
      width: 400,
      x: 12,
      y: 48
    }
  } as const satisfies I_faProjectStylingPatch
  getProjectStylingMock.mockImplementationOnce(async () => {
    store.css = '.typed{color:red}'
    return {
      ...emptyRoot,
      css: '',
      frame: framePatch.frame
    }
  })
  await store.persistProjectStylingPartialSilent(framePatch)
  expect(store.css).toBe('.typed{color:red}')
  expect(store.root?.css).toBe('.typed{color:red}')
})

test('Test that css persist keeps css typed during the round trip', async () => {
  store.applyRoot({
    ...emptyRoot,
    css: '.saved{color:black}',
    frame: null
  })
  getProjectStylingMock.mockImplementationOnce(async () => {
    store.css = '.typed{color:red}'
    return {
      ...emptyRoot,
      css: '.saved{color:black}',
      frame: null
    }
  })
  await store.persistProjectStylingPartialSilent({ css: '.saved{color:black}' })
  expect(store.css).toBe('.typed{color:red}')
  expect(store.root?.css).toBe('.typed{color:red}')
})

test('Test that persistProjectStylingPartialSilent skips read-back when setProjectStyling resolves false', async () => {
  setProjectStylingMock.mockResolvedValueOnce(false)
  store.applyRoot({
    ...emptyRoot,
    css: 'preserve'
  })
  getProjectStylingMock.mockClear()
  await store.persistProjectStylingPartialSilent({ frame: null })
  expect(setProjectStylingMock).toHaveBeenCalledWith({ frame: null })
  expect(getProjectStylingMock).not.toHaveBeenCalled()
  expect(store.css).toBe('preserve')
})

test('Test that refreshProjectStyling throws when getProjectStyling rejects', async () => {
  getProjectStylingMock.mockRejectedValueOnce(new Error('read fail'))
  await expect(store.refreshProjectStyling()).rejects.toThrow(
    'globalFunctionality.faProjectStyling.loadError'
  )
  expect(notifyCreateMock).not.toHaveBeenCalled()
})

test('Test that persistProjectStylingPartialSilent throws when setProjectStyling is missing', async () => {
  Object.assign(window.faContentBridgeAPIs, {
    projectManagement: {
      getProjectStyling: getProjectStylingMock
    }
  })
  await expect(store.persistProjectStylingPartialSilent({ css: 'x' })).rejects.toThrow(
    'globalFunctionality.faProjectStyling.bridgeMissing'
  )
})

test('Test that persistProjectStylingPartialSilent wraps non-Error from getProjectStyling after save', async () => {
  setProjectStylingMock.mockResolvedValueOnce(true)
  getProjectStylingMock.mockRejectedValueOnce('plain')
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await expect(store.persistProjectStylingPartialSilent({ css: 'x' })).rejects.toThrow('plain')
})

test('Test that persistProjectStylingPartialSilent wraps null from getProjectStyling after save', async () => {
  setProjectStylingMock.mockResolvedValueOnce(true)
  getProjectStylingMock.mockRejectedValueOnce(null)
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await expect(store.persistProjectStylingPartialSilent({ css: 'x' })).rejects.toThrow('null')
})

test('Test that persistProjectStylingPartialSilent throws when getProjectStyling rejects with Error after save', async () => {
  setProjectStylingMock.mockResolvedValueOnce(true)
  getProjectStylingMock.mockRejectedValueOnce(new Error('round trip fail'))
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await expect(store.persistProjectStylingPartialSilent({ css: 'x' })).rejects.toThrow(
    'round trip fail'
  )
})

test('Test that persistCurrentCssSilent writes current css', async () => {
  store.css = 'draft'
  getProjectStylingMock.mockResolvedValueOnce({
    ...emptyRoot,
    css: 'draft'
  })
  await store.persistCurrentCssSilent()
  expect(setProjectStylingMock).toHaveBeenCalledWith({ css: 'draft' })
})

test('Test that persistProjectStylingPartialSilent throws when setProjectStyling fails with an Error', async () => {
  setProjectStylingMock.mockRejectedValueOnce(new Error('disk full'))
  await expect(store.persistProjectStylingPartialSilent({ css: 'x' })).rejects.toThrow('disk full')
})

test('Test that persistProjectStylingPartialSilent wraps null rejection from setProjectStyling', async () => {
  setProjectStylingMock.mockRejectedValueOnce(null)
  await expect(store.persistProjectStylingPartialSilent({ css: 'x' })).rejects.toThrow('null')
})

test('Test that persistProjectStylingPartialSilent wraps non-Error from setProjectStyling', async () => {
  setProjectStylingMock.mockRejectedValueOnce(404)
  await expect(store.persistProjectStylingPartialSilent({ css: 'x' })).rejects.toThrow('404')
})

test('Test that savePersistedCssFromEditor returns false when bridge methods are missing', async () => {
  Object.assign(window.faContentBridgeAPIs, { projectManagement: undefined as never })
  const ok = await store.savePersistedCssFromEditor('x')
  expect(ok).toBe(false)
})

test('Test that savePersistedCssFromEditor returns false when setProjectStyling resolves false', async () => {
  setProjectStylingMock.mockResolvedValueOnce(false)
  const ok = await store.savePersistedCssFromEditor('body { margin: 0; }')
  expect(ok).toBe(false)
  expect(getProjectStylingMock).not.toHaveBeenCalled()
})

test('Test that savePersistedCssFromEditor applies root, clears live preview, and notifies on success', async () => {
  store.setCssLivePreview('ok')
  getProjectStylingMock.mockResolvedValueOnce({
    ...emptyRoot,
    css: 'ok'
  })
  const ok = await store.savePersistedCssFromEditor('ok')
  expect(ok).toBe(true)
  expect(store.css).toBe('ok')
  expect(store.cssLivePreview).toBeNull()
  expect(notifyCreateMock).toHaveBeenCalledWith({
    group: false,
    message: 'globalFunctionality.faProjectStyling.saveSuccess',
    type: 'positive'
  })
})

test('Test that savePersistedCssFromEditor keeps a live preview typed during save', async () => {
  store.setCssLivePreview('typed during save')
  getProjectStylingMock.mockResolvedValueOnce({
    ...emptyRoot,
    css: 'ok'
  })
  const ok = await store.savePersistedCssFromEditor('ok')
  expect(ok).toBe(true)
  expect(store.cssLivePreview).toBe('typed during save')
})

test('Test that savePersistedCssFromEditor throws when persisted css mismatches', async () => {
  getProjectStylingMock.mockResolvedValueOnce({
    ...emptyRoot,
    css: 'other'
  })
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await expect(store.savePersistedCssFromEditor('wanted')).rejects.toThrow(
    'globalFunctionality.faProjectStyling.saveError'
  )
})

test('Test that savePersistedCssFromEditor throws when setProjectStyling rejects', async () => {
  setProjectStylingMock.mockRejectedValueOnce(new Error('write fail'))
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await expect(store.savePersistedCssFromEditor('x')).rejects.toThrow('write fail')
})

test('Test that savePersistedCssFromEditor wraps non-Error rejection from setProjectStyling', async () => {
  setProjectStylingMock.mockRejectedValueOnce('plain')
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await expect(store.savePersistedCssFromEditor('x')).rejects.toThrow('plain')
})

test('Test that savePersistedCssFromEditor throws when getProjectStyling rejects after save', async () => {
  setProjectStylingMock.mockResolvedValueOnce(true)
  getProjectStylingMock.mockRejectedValueOnce(new Error('read after save'))
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await expect(store.savePersistedCssFromEditor('x')).rejects.toThrow('read after save')
})

test('Test that savePersistedCssFromEditor wraps non-Error from getProjectStyling after save', async () => {
  setProjectStylingMock.mockResolvedValueOnce(true)
  getProjectStylingMock.mockRejectedValueOnce(null)
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await expect(store.savePersistedCssFromEditor('x')).rejects.toThrow('null')
})

test('Test that a project styling save does not write after the project changes', async () => {
  let releaseRefresh: ((root: I_faProjectStylingRoot) => void) | undefined
  getProjectStylingMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      releaseRefresh = resolve
    })
  })
  const refreshPromise = store.refreshProjectStyling()
  await vi.waitUntil(() => getProjectStylingMock.mock.calls.length === 1)
  const savePromise = store.savePersistedCssFromEditor('body{color:old}')
  await Promise.resolve()
  await Promise.resolve()
  const { S_FaActiveProject } = await import('../S_FaActiveProject')
  const { FaActionUserCanceledError } = await import(
    'app/src/scripts/actionManager/functions/faActionUserCanceledError'
  )
  S_FaActiveProject().clearActiveProject()
  const finishRefresh = releaseRefresh
  if (finishRefresh === undefined) {
    throw new Error('missing styling refresh resolver')
  }
  finishRefresh({
    ...emptyRoot,
    css: 'fresh'
  })
  await expect(savePromise).rejects.toBeInstanceOf(FaActionUserCanceledError)
  await expect(refreshPromise).resolves.toBe(false)
  expect(setProjectStylingMock).not.toHaveBeenCalled()
  expect(notifyCreateMock).not.toHaveBeenCalled()
  expect(store.css).toBe('')
})

test('Test that a project styling save does not write while a project open is in flight', async () => {
  let releaseRefresh: ((root: I_faProjectStylingRoot) => void) | undefined
  getProjectStylingMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      releaseRefresh = resolve
    })
  })
  const refreshPromise = store.refreshProjectStyling()
  await vi.waitUntil(() => getProjectStylingMock.mock.calls.length === 1)
  const savePromise = store.savePersistedCssFromEditor('body{color:old}')
  await Promise.resolve()
  await Promise.resolve()
  const { S_FaActiveProject } = await import('../S_FaActiveProject')
  const { FaActionUserCanceledError } = await import(
    'app/src/scripts/actionManager/functions/faActionUserCanceledError'
  )
  vi.spyOn(S_FaActiveProject(), 'isProjectReplacementInFlight').mockReturnValue(true)
  const finishRefresh = releaseRefresh
  if (finishRefresh === undefined) {
    throw new Error('missing styling refresh resolver')
  }
  finishRefresh({
    ...emptyRoot,
    css: 'fresh'
  })
  await expect(savePromise).rejects.toBeInstanceOf(FaActionUserCanceledError)
  await expect(refreshPromise).resolves.toBe(true)
  expect(setProjectStylingMock).not.toHaveBeenCalled()
  expect(notifyCreateMock).not.toHaveBeenCalled()
})

test('Test that a silent project styling persist does not write after the project changes', async () => {
  let releaseRefresh: ((root: I_faProjectStylingRoot) => void) | undefined
  getProjectStylingMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      releaseRefresh = resolve
    })
  })
  const refreshPromise = store.refreshProjectStyling()
  await vi.waitUntil(() => getProjectStylingMock.mock.calls.length === 1)
  const persistPromise = store.persistProjectStylingPartialSilent({ css: 'old' })
  await Promise.resolve()
  await Promise.resolve()
  const { S_FaActiveProject } = await import('../S_FaActiveProject')
  S_FaActiveProject().clearActiveProject()
  const finishRefresh = releaseRefresh
  if (finishRefresh === undefined) {
    throw new Error('missing styling refresh resolver')
  }
  finishRefresh({
    ...emptyRoot,
    css: 'fresh'
  })
  await expect(persistPromise).resolves.toBeUndefined()
  await expect(refreshPromise).resolves.toBe(false)
  expect(setProjectStylingMock).not.toHaveBeenCalled()
  expect(store.css).toBe('')
})

test('Test that savePersistedCssFromEditor skips read-back when the project changes during the write', async () => {
  let releaseWrite: ((saved: boolean) => void) | undefined
  setProjectStylingMock.mockImplementationOnce(() => {
    return new Promise<boolean>((resolve) => {
      releaseWrite = resolve
    })
  })
  store.applyRoot({
    ...emptyRoot,
    css: 'kept'
  })
  const pending = store.savePersistedCssFromEditor('body{color:old}')
  await vi.waitUntil(() => setProjectStylingMock.mock.calls.length === 1)
  const { S_FaActiveProject } = await import('../S_FaActiveProject')
  const { FaActionUserCanceledError } = await import(
    'app/src/scripts/actionManager/functions/faActionUserCanceledError'
  )
  S_FaActiveProject().clearActiveProject()
  const finishWrite = releaseWrite
  if (finishWrite === undefined) {
    throw new Error('missing styling write resolver')
  }
  finishWrite(true)
  await expect(pending).rejects.toBeInstanceOf(FaActionUserCanceledError)
  expect(getProjectStylingMock).not.toHaveBeenCalled()
  expect(notifyCreateMock).not.toHaveBeenCalled()
  expect(store.css).toBe('kept')
})
