import { beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { FA_PROGRAM_STYLING_STORE_DEFAULTS } from 'app/src-electron/mainScripts/programStyling/faProgramStylingStoreDefaults'
import type { I_faProgramStylingRoot } from 'app/types/I_faProgramStylingDomain'
import type * as S_FaProgramStylingStore from '../S_FaProgramStyling'

const {
  notifyCreateMock,
  tMock,
  getProgramStylingMock,
  setProgramStylingMock
} = vi.hoisted(() => {
  return {
    notifyCreateMock: vi.fn(),
    tMock: vi.fn((key: string) => key),
    getProgramStylingMock: vi.fn(async (): Promise<I_faProgramStylingRoot> => ({ ...FA_PROGRAM_STYLING_STORE_DEFAULTS })),
    setProgramStylingMock: vi.fn(async () => undefined)
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

let store: ReturnType<typeof S_FaProgramStylingStore.S_FaProgramStyling>

beforeEach(async () => {
  setActivePinia(createPinia())
  vi.resetModules()
  notifyCreateMock.mockReset()
  tMock.mockReset()
  tMock.mockImplementation((key: string) => key)
  getProgramStylingMock.mockReset()
  getProgramStylingMock.mockResolvedValue({ ...FA_PROGRAM_STYLING_STORE_DEFAULTS })
  setProgramStylingMock.mockReset()
  setProgramStylingMock.mockResolvedValue(undefined)

  Object.defineProperty(globalThis, 'window', {
    value: {
      faContentBridgeAPIs: {
        faProgramStyling: {
          getProgramStyling: getProgramStylingMock,
          setProgramStyling: setProgramStylingMock
        }
      }
    },
    configurable: true,
    writable: true
  })

  const stores = await import('../S_FaProgramStyling')
  store = stores.S_FaProgramStyling()
})

/**
 * S_FaProgramStyling / refreshProgramStyling
 * Pulls the current root from the bridge and mirrors 'css' for global injection.
 */
test('Test that refreshProgramStyling populates root and css from the IPC bridge', async () => {
  const incoming: I_faProgramStylingRoot = {
    css: 'body { background: red; }',
    schemaVersion: 1
  }
  getProgramStylingMock.mockResolvedValueOnce(incoming)

  expect(store.root).toBeNull()
  expect(store.css).toBe('')

  await store.refreshProgramStyling()

  expect(getProgramStylingMock).toHaveBeenCalledOnce()
  expect(store.root).toEqual(incoming)
  expect(store.css).toBe(incoming.css)
})

/**
 * S_FaProgramStyling / refreshProgramStyling
 * No-op when the bridge method is missing; root and css remain at their initial values.
 */
test('Test that refreshProgramStyling skips when getProgramStyling is unavailable', async () => {
  Object.defineProperty(globalThis, 'window', {
    value: { faContentBridgeAPIs: {} },
    configurable: true,
    writable: true
  })
  vi.resetModules()
  const stores = await import('../S_FaProgramStyling')
  const localStore = stores.S_FaProgramStyling()

  await localStore.refreshProgramStyling()
  expect(localStore.root).toBeNull()
  expect(localStore.css).toBe('')
})

/**
 * S_FaProgramStyling / refreshProgramStyling
 * Surfaces a sticky negative toast when the bridge rejects so the user knows persistence is broken.
 */
test('Test that refreshProgramStyling notifies when getProgramStyling rejects', async () => {
  getProgramStylingMock.mockRejectedValueOnce(new Error('ipc read fail'))

  await store.refreshProgramStyling()

  expect(getProgramStylingMock).toHaveBeenCalledOnce()
  expect(store.root).toBeNull()
  expect(store.css).toBe('')
  expect(notifyCreateMock).toHaveBeenCalledWith(
    expect.objectContaining({
      message: 'globalFunctionality.faProgramStyling.loadError',
      type: 'negative'
    })
  )
})

/**
 * S_FaProgramStyling / updateProgramStyling
 * Returns true, refreshes root from the bridge, and emits a positive save toast on success.
 */
test('Test that updateProgramStyling returns true and re-reads root after success', async () => {
  const afterRoot: I_faProgramStylingRoot = {
    css: 'a { color: blue; }',
    schemaVersion: 1
  }
  getProgramStylingMock.mockResolvedValueOnce(afterRoot)

  const ok = await store.updateProgramStyling({ css: afterRoot.css })

  expect(ok).toBe(true)
  expect(setProgramStylingMock).toHaveBeenCalledOnce()
  expect(setProgramStylingMock).toHaveBeenCalledWith({ css: afterRoot.css })
  expect(store.root).toEqual(afterRoot)
  expect(store.css).toBe(afterRoot.css)
  expect(notifyCreateMock).toHaveBeenCalledWith(
    expect.objectContaining({
      message: 'globalFunctionality.faProgramStyling.saveSuccess',
      type: 'positive'
    })
  )
})

/**
 * S_FaProgramStyling / updateProgramStyling
 * Returns false (without throwing) when the bridge method is missing; nothing should be written.
 */
test('Test that updateProgramStyling returns false when setProgramStyling is unavailable', async () => {
  Object.defineProperty(globalThis, 'window', {
    value: {
      faContentBridgeAPIs: {
        faProgramStyling: {
          getProgramStyling: getProgramStylingMock
        }
      }
    },
    configurable: true,
    writable: true
  })
  vi.resetModules()
  const stores = await import('../S_FaProgramStyling')
  const localStore = stores.S_FaProgramStyling()

  const ok = await localStore.updateProgramStyling({ css: 'whatever' })
  expect(ok).toBe(false)
  expect(notifyCreateMock).not.toHaveBeenCalled()
})

/**
 * S_FaProgramStyling / updateProgramStyling
 * Re-throws the bridge error so the action manager's unified failure surface gets a single console row + toast.
 */
test('Test that updateProgramStyling re-throws when setProgramStyling rejects', async () => {
  setProgramStylingMock.mockRejectedValueOnce(new Error('ipc write fail'))
  vi.spyOn(console, 'error').mockImplementation(() => undefined)

  await expect(store.updateProgramStyling({ css: 'broken' })).rejects.toThrow('ipc write fail')
  expect(notifyCreateMock).not.toHaveBeenCalled()
})

/**
 * S_FaProgramStyling / updateProgramStyling
 * Re-throws when the post-save round-trip get rejects, surfaces a console.error log, and does not toast.
 */
test('Test that updateProgramStyling re-throws when getProgramStyling after save rejects', async () => {
  setProgramStylingMock.mockResolvedValueOnce(undefined)
  getProgramStylingMock.mockRejectedValueOnce(new Error('post save read fail'))
  vi.spyOn(console, 'error').mockImplementation(() => undefined)

  await expect(store.updateProgramStyling({ css: 'persisted css' })).rejects.toThrow('post save read fail')
  expect(setProgramStylingMock).toHaveBeenCalledOnce()
  expect(getProgramStylingMock).toHaveBeenCalledOnce()
  expect(notifyCreateMock).not.toHaveBeenCalled()
})

/**
 * S_FaProgramStyling / updateProgramStyling
 * Wraps non-Error rejection from the post-save get into a real Error so downstream handlers always see an Error instance.
 */
test('Test that updateProgramStyling wraps non-Error rejection from getProgramStyling after save', async () => {
  setProgramStylingMock.mockResolvedValueOnce(undefined)
  getProgramStylingMock.mockRejectedValueOnce('plain string failure')
  vi.spyOn(console, 'error').mockImplementation(() => undefined)

  await expect(store.updateProgramStyling({ css: 'persisted css' })).rejects.toThrow('plain string failure')
  expect(notifyCreateMock).not.toHaveBeenCalled()
})

/**
 * S_FaProgramStyling / updateProgramStyling
 * Wraps non-Error rejection from setProgramStyling into a real Error so downstream handlers always see an Error instance.
 */
test('Test that updateProgramStyling wraps non-Error rejection from setProgramStyling', async () => {
  setProgramStylingMock.mockRejectedValueOnce('plain write failure')
  vi.spyOn(console, 'error').mockImplementation(() => undefined)

  await expect(store.updateProgramStyling({ css: 'broken' })).rejects.toThrow('plain write failure')
  expect(notifyCreateMock).not.toHaveBeenCalled()
})

/**
 * S_FaProgramStyling / updateProgramStyling
 * If the persisted CSS does not round-trip back identical to the patch, throw a saveError so the action manager surfaces it.
 */
test('Test that updateProgramStyling throws saveError when retrieved css does not match the patch', async () => {
  getProgramStylingMock.mockResolvedValueOnce({
    css: 'this is not what was sent',
    schemaVersion: 1
  })
  vi.spyOn(console, 'error').mockImplementation(() => undefined)

  await expect(store.updateProgramStyling({ css: 'sent css' })).rejects.toThrow(
    'globalFunctionality.faProgramStyling.saveError'
  )
  expect(notifyCreateMock).not.toHaveBeenCalled()
})
