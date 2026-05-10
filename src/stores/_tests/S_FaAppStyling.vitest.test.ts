import { beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { FA_APP_STYLING_STORE_DEFAULTS } from 'app/src-electron/mainScripts/appStyling/faAppStylingStoreDefaults'
import type { I_faAppStylingRoot } from 'app/types/I_faAppStylingDomain'
import type * as S_FaAppStylingStore from '../S_FaAppStyling'

const {
  notifyCreateMock,
  tMock,
  getAppStylingMock,
  setAppStylingMock
} = vi.hoisted(() => {
  return {
    notifyCreateMock: vi.fn(),
    tMock: vi.fn((key: string) => key),
    getAppStylingMock: vi.fn(async (): Promise<I_faAppStylingRoot> => ({ ...FA_APP_STYLING_STORE_DEFAULTS })),
    setAppStylingMock: vi.fn(async () => undefined)
  }
})

vi.mock('quasar', () => {
  return {
    Notify: { create: notifyCreateMock }
  }
})

vi.mock('app/i18n/externalFileLoader', () => {
  return {
    i18n: { global: { t: tMock } }
  }
})

let store: ReturnType<typeof S_FaAppStylingStore.S_FaAppStyling>

beforeEach(async () => {
  setActivePinia(createPinia())
  vi.resetModules()
  notifyCreateMock.mockReset()
  tMock.mockReset()
  tMock.mockImplementation((key: string) => key)
  getAppStylingMock.mockReset()
  getAppStylingMock.mockResolvedValue({ ...FA_APP_STYLING_STORE_DEFAULTS })
  setAppStylingMock.mockReset()
  setAppStylingMock.mockResolvedValue(undefined)

  Object.defineProperty(globalThis, 'window', {
    value: {
      faContentBridgeAPIs: {
        faAppStyling: {
          getAppStyling: getAppStylingMock,
          setAppStyling: setAppStylingMock
        }
      }
    },
    configurable: true,
    writable: true
  })

  const stores = await import('../S_FaAppStyling')
  store = stores.S_FaAppStyling()
})

/**
 * S_FaAppStyling / setCssLivePreview & clearCssLivePreview
 * Drives the injected style override while the app styling editor is open.
 */
test('Test that setCssLivePreview and clearCssLivePreview update cssLivePreview', () => {
  expect(store.cssLivePreview).toBeNull()
  store.setCssLivePreview('body { margin: 0; }')
  expect(store.cssLivePreview).toBe('body { margin: 0; }')
  store.clearCssLivePreview()
  expect(store.cssLivePreview).toBeNull()
})

/**
 * S_FaAppStyling / refreshAppStyling
 * Pulls the current root from the bridge and mirrors 'css' for global injection.
 */
test('Test that refreshAppStyling populates root and css from the IPC bridge', async () => {
  const incoming: I_faAppStylingRoot = {
    css: 'body { background: red; }',
    frame: null,
    schemaVersion: 1
  }
  getAppStylingMock.mockResolvedValueOnce(incoming)

  expect(store.root).toBeNull()
  expect(store.css).toBe('')

  const ok = await store.refreshAppStyling()

  expect(ok).toBe(true)
  expect(getAppStylingMock).toHaveBeenCalledOnce()
  expect(store.root).toEqual(incoming)
  expect(store.css).toBe(incoming.css)
})

/**
 * S_FaAppStyling / refreshAppStyling
 * No-op when the bridge method is missing; root and css remain at their initial values.
 */
test('Test that refreshAppStyling skips when getAppStyling is unavailable', async () => {
  Object.defineProperty(globalThis, 'window', {
    value: { faContentBridgeAPIs: {} },
    configurable: true,
    writable: true
  })
  vi.resetModules()
  const stores = await import('../S_FaAppStyling')
  const localStore = stores.S_FaAppStyling()

  const ok = await localStore.refreshAppStyling()
  expect(ok).toBe(false)
  expect(localStore.root).toBeNull()
  expect(localStore.css).toBe('')
})

/**
 * S_FaAppStyling / refreshAppStyling
 * Surfaces a sticky negative toast when the bridge rejects so the user knows persistence is broken.
 */
test('Test that refreshAppStyling notifies when getAppStyling rejects', async () => {
  getAppStylingMock.mockRejectedValueOnce(new Error('ipc read fail'))

  const ok = await store.refreshAppStyling()

  expect(ok).toBe(false)
  expect(getAppStylingMock).toHaveBeenCalledOnce()
  expect(store.root).toBeNull()
  expect(store.css).toBe('')
  expect(notifyCreateMock).toHaveBeenCalledWith(
    expect.objectContaining({
      message: 'globalFunctionality.faAppStyling.loadError',
      type: 'negative'
    })
  )
})

/**
 * S_FaAppStyling / updateAppStyling
 * Returns true, refreshes root from the bridge, and emits a positive save toast on success.
 */
test('Test that updateAppStyling returns true and re-reads root after success', async () => {
  const afterRoot: I_faAppStylingRoot = {
    css: 'a { color: blue; }',
    frame: null,
    schemaVersion: 1
  }
  getAppStylingMock.mockResolvedValueOnce(afterRoot)

  const ok = await store.updateAppStyling({ css: afterRoot.css })

  expect(ok).toBe(true)
  expect(setAppStylingMock).toHaveBeenCalledOnce()
  expect(setAppStylingMock).toHaveBeenCalledWith({ css: afterRoot.css })
  expect(store.root).toEqual(afterRoot)
  expect(store.css).toBe(afterRoot.css)
  expect(notifyCreateMock).toHaveBeenCalledWith(
    expect.objectContaining({
      message: 'globalFunctionality.faAppStyling.saveSuccess',
      type: 'positive'
    })
  )
})

/**
 * S_FaAppStyling / updateAppStyling
 * A successful save clears any in-editor live preview override so '#faUserCss' tracks persisted css only.
 */
test('Test that updateAppStyling clears cssLivePreview after a successful save', async () => {
  store.cssLivePreview = 'preview { color: red; }'
  const afterRoot: I_faAppStylingRoot = {
    css: 'a { color: blue; }',
    frame: null,
    schemaVersion: 1
  }
  getAppStylingMock.mockResolvedValueOnce(afterRoot)

  await store.updateAppStyling({ css: afterRoot.css })

  expect(store.cssLivePreview).toBeNull()
})

/**
 * S_FaAppStyling / updateAppStyling
 * Returns false (without throwing) when the bridge method is missing; nothing should be written.
 */
test('Test that updateAppStyling returns false when setAppStyling is unavailable', async () => {
  Object.defineProperty(globalThis, 'window', {
    value: {
      faContentBridgeAPIs: {
        faAppStyling: {
          getAppStyling: getAppStylingMock
        }
      }
    },
    configurable: true,
    writable: true
  })
  vi.resetModules()
  const stores = await import('../S_FaAppStyling')
  const localStore = stores.S_FaAppStyling()

  const ok = await localStore.updateAppStyling({ css: 'whatever' })
  expect(ok).toBe(false)
  expect(notifyCreateMock).not.toHaveBeenCalled()
})

/**
 * S_FaAppStyling / updateAppStyling
 * Re-throws the bridge error so the action manager's unified failure surface gets a single console row + toast.
 */
test('Test that updateAppStyling re-throws when setAppStyling rejects', async () => {
  setAppStylingMock.mockRejectedValueOnce(new Error('ipc write fail'))
  vi.spyOn(console, 'error').mockImplementation(() => undefined)

  await expect(store.updateAppStyling({ css: 'broken' })).rejects.toThrow('ipc write fail')
  expect(notifyCreateMock).not.toHaveBeenCalled()
})

/**
 * S_FaAppStyling / updateAppStyling
 * Re-throws when the post-save round-trip get rejects, surfaces a console.error log, and does not toast.
 */
test('Test that updateAppStyling re-throws when getAppStyling after save rejects', async () => {
  setAppStylingMock.mockResolvedValueOnce(undefined)
  getAppStylingMock.mockRejectedValueOnce(new Error('post save read fail'))
  vi.spyOn(console, 'error').mockImplementation(() => undefined)

  await expect(store.updateAppStyling({ css: 'persisted css' })).rejects.toThrow('post save read fail')
  expect(setAppStylingMock).toHaveBeenCalledOnce()
  expect(getAppStylingMock).toHaveBeenCalledOnce()
  expect(notifyCreateMock).not.toHaveBeenCalled()
})

/**
 * S_FaAppStyling / updateAppStyling
 * Wraps non-Error rejection from the post-save get into a real Error so downstream handlers always see an Error instance.
 */
test('Test that updateAppStyling wraps non-Error rejection from getAppStyling after save', async () => {
  setAppStylingMock.mockResolvedValueOnce(undefined)
  getAppStylingMock.mockRejectedValueOnce('plain string failure')
  vi.spyOn(console, 'error').mockImplementation(() => undefined)

  await expect(store.updateAppStyling({ css: 'persisted css' })).rejects.toThrow('plain string failure')
  expect(notifyCreateMock).not.toHaveBeenCalled()
})

/**
 * S_FaAppStyling / updateAppStyling
 * Wraps non-Error rejection from setAppStyling into a real Error so downstream handlers always see an Error instance.
 */
test('Test that updateAppStyling wraps non-Error rejection from setAppStyling', async () => {
  setAppStylingMock.mockRejectedValueOnce('plain write failure')
  vi.spyOn(console, 'error').mockImplementation(() => undefined)

  await expect(store.updateAppStyling({ css: 'broken' })).rejects.toThrow('plain write failure')
  expect(notifyCreateMock).not.toHaveBeenCalled()
})

/**
 * S_FaAppStyling / updateAppStyling
 * If the persisted CSS does not round-trip back identical to the patch, throw a saveError so the action manager surfaces it.
 */
test('Test that updateAppStyling throws saveError when retrieved css does not match the patch', async () => {
  getAppStylingMock.mockResolvedValueOnce({
    css: 'this is not what was sent',
    frame: null,
    schemaVersion: 1
  })
  vi.spyOn(console, 'error').mockImplementation(() => undefined)

  await expect(store.updateAppStyling({ css: 'sent css' })).rejects.toThrow(
    'globalFunctionality.faAppStyling.saveError'
  )
  expect(notifyCreateMock).not.toHaveBeenCalled()
})

/**
 * S_FaAppStyling / updateAppStyling
 * On save mismatch, 'cssLivePreview' stays set so the injected stylesheet still tracks the open editor.
 */
test('Test that updateAppStyling leaves cssLivePreview unchanged when save mismatch throws', async () => {
  store.cssLivePreview = 'body { color: lime; }'
  getAppStylingMock.mockResolvedValueOnce({
    css: 'retrieved mismatch',
    frame: null,
    schemaVersion: 1
  })
  vi.spyOn(console, 'error').mockImplementation(() => undefined)

  await expect(store.updateAppStyling({ css: 'sent css' })).rejects.toThrow(
    'globalFunctionality.faAppStyling.saveError'
  )
  expect(store.cssLivePreview).toBe('body { color: lime; }')
})

/**
 * S_FaAppStyling / updateAppStyling
 * Requires a string css property on the patch.
 */
test('Test that updateAppStyling throws saveMissingCss when css is not a string', async () => {
  await expect(
    store.updateAppStyling({ frame: null })
  ).rejects.toThrow('globalFunctionality.faAppStyling.saveMissingCss')
})

/**
 * S_FaAppStyling / persistAppStylingPartialSilent
 * Syncs root from the bridge without a success toast.
 */
test('Test that persistAppStylingPartialSilent updates root without notifying success', async () => {
  const merged: I_faAppStylingRoot = {
    css: 'body { color: red; }',
    frame: {
      height: 300,
      width: 400,
      x: 1,
      y: 2
    },
    schemaVersion: 1
  }
  getAppStylingMock.mockResolvedValueOnce(merged)
  store.root = {
    css: merged.css,
    frame: null,
    schemaVersion: 1
  }

  await store.persistAppStylingPartialSilent({
    frame: merged.frame
  })

  expect(setAppStylingMock).toHaveBeenCalledWith({ frame: merged.frame })
  expect(store.root).toEqual(merged)
  expect(notifyCreateMock).not.toHaveBeenCalledWith(
    expect.objectContaining({ type: 'positive' })
  )
})

test('Test that persistAppStylingPartialSilent re-throws when setAppStyling rejects', async () => {
  setAppStylingMock.mockRejectedValueOnce(new Error('write fail'))
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await expect(store.persistAppStylingPartialSilent({ frame: null })).rejects.toThrow('write fail')
})

test('Test that persistAppStylingPartialSilent wraps non-Error from setAppStyling', async () => {
  setAppStylingMock.mockRejectedValueOnce('plain')
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await expect(store.persistAppStylingPartialSilent({ frame: null })).rejects.toThrow('plain')
})

test('Test that persistAppStylingPartialSilent re-throws when getAppStyling after partial rejects', async () => {
  setAppStylingMock.mockResolvedValueOnce(undefined)
  getAppStylingMock.mockRejectedValueOnce(new Error('read fail'))
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await expect(store.persistAppStylingPartialSilent({ frame: null })).rejects.toThrow('read fail')
})

test('Test that persistAppStylingPartialSilent throws when setAppStyling is missing', async () => {
  Object.assign(window.faContentBridgeAPIs, {
    faAppStyling: {
      getAppStyling: getAppStylingMock
    }
  })
  vi.resetModules()
  const stores = await import('../S_FaAppStyling')
  const localStore = stores.S_FaAppStyling()
  await expect(localStore.persistAppStylingPartialSilent({ frame: null })).rejects.toThrow(
    'globalFunctionality.faAppStyling.loadError'
  )
})

test('Test that persistAppStylingPartialSilent wraps non-Error from getAppStyling after partial', async () => {
  setAppStylingMock.mockResolvedValueOnce(undefined)
  getAppStylingMock.mockRejectedValueOnce('plain read')
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await expect(store.persistAppStylingPartialSilent({ frame: null })).rejects.toThrow('plain read')
})
