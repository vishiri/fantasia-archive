import { beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { FA_KEYBINDS_STORE_DEFAULTS } from 'app/src-electron/mainScripts/keybinds/faKeybindsStoreDefaults'
import type { I_faKeybindsSnapshot } from 'app/types/I_faKeybindsDomain'
import type * as S_FaKeybindsStore from '../S_FaKeybinds'

const {
  notifyCreateMock,
  tMock,
  getKeybindsMock,
  setKeybindsMock
} = vi.hoisted(() => {
  return {
    notifyCreateMock: vi.fn(),
    tMock: vi.fn((key: string) => key),
    getKeybindsMock: vi.fn(async (): Promise<I_faKeybindsSnapshot> => ({
      platform: 'win32',
      store: { ...FA_KEYBINDS_STORE_DEFAULTS }
    })),
    setKeybindsMock: vi.fn(async () => undefined)
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

let store: ReturnType<typeof S_FaKeybindsStore.S_FaKeybinds>

beforeEach(async () => {
  setActivePinia(createPinia())
  vi.resetModules()
  notifyCreateMock.mockReset()
  tMock.mockReset()
  tMock.mockImplementation((key: string) => key)
  getKeybindsMock.mockReset()
  getKeybindsMock.mockResolvedValue({
    platform: 'win32',
    store: { ...FA_KEYBINDS_STORE_DEFAULTS }
  })
  setKeybindsMock.mockReset()
  setKeybindsMock.mockResolvedValue(undefined)

  Object.defineProperty(globalThis, 'window', {
    value: {
      faContentBridgeAPIs: {
        faKeybinds: {
          getKeybinds: getKeybindsMock,
          setKeybinds: setKeybindsMock
        }
      }
    },
    configurable: true,
    writable: true
  })

  const stores = await import('../S_FaKeybinds')
  store = stores.S_FaKeybinds()
})

/**
 * S_FaKeybinds / refreshKeybinds
 * Populates snapshot from the bridge when getKeybinds exists.
 */
test('Test that refreshKeybinds populates snapshot from the IPC bridge', async () => {
  const snap: I_faKeybindsSnapshot = {
    platform: 'darwin',
    store: {
      ...FA_KEYBINDS_STORE_DEFAULTS,
      overrides: {
        openProgramSettings: {
          code: 'KeyA',
          mods: ['ctrl']
        }
      }
    }
  }
  getKeybindsMock.mockResolvedValueOnce(snap)

  expect(store.snapshot).toBeNull()
  await store.refreshKeybinds()

  expect(getKeybindsMock).toHaveBeenCalledOnce()
  expect(store.snapshot).toEqual(snap)
})

/**
 * S_FaKeybinds / refreshKeybinds
 * No-op when the bridge method is missing.
 */
test('Test that refreshKeybinds skips when getKeybinds is unavailable', async () => {
  Object.defineProperty(globalThis, 'window', {
    value: { faContentBridgeAPIs: {} },
    configurable: true,
    writable: true
  })
  vi.resetModules()
  const stores = await import('../S_FaKeybinds')
  const localStore = stores.S_FaKeybinds()

  await localStore.refreshKeybinds()
  expect(localStore.snapshot).toBeNull()
})

/**
 * S_FaKeybinds / refreshKeybinds
 * Shows negative notify when getKeybinds rejects.
 */
test('Test that refreshKeybinds notifies when getKeybinds rejects', async () => {
  getKeybindsMock.mockRejectedValueOnce(new Error('ipc read fail'))
  expect(store.snapshot).toBeNull()

  await store.refreshKeybinds()

  expect(getKeybindsMock).toHaveBeenCalledOnce()
  expect(store.snapshot).toBeNull()
  expect(notifyCreateMock).toHaveBeenCalledWith(
    expect.objectContaining({
      message: 'globalFunctionality.faKeybinds.loadError',
      type: 'negative'
    })
  )
})

/**
 * S_FaKeybinds / updateKeybinds
 * Returns true and refreshes after a successful save.
 */
test('Test that updateKeybinds returns true and refreshes after success', async () => {
  const afterSnap = {
    platform: 'win32' as const,
    store: {
      ...FA_KEYBINDS_STORE_DEFAULTS,
      overrides: { openProgramSettings: null }
    }
  }
  getKeybindsMock.mockResolvedValueOnce(afterSnap)

  const ok = await store.updateKeybinds({
    overrides: { openProgramSettings: null },
    replaceAllOverrides: true
  })

  expect(ok).toBe(true)
  expect(setKeybindsMock).toHaveBeenCalledOnce()
  expect(store.snapshot).toEqual(afterSnap)
  expect(notifyCreateMock).toHaveBeenCalled()
})

/**
 * S_FaKeybinds / updateKeybinds
 * Returns false and shows negative notify when setKeybinds rejects.
 */
test('Test that updateKeybinds returns false when setKeybinds rejects', async () => {
  setKeybindsMock.mockRejectedValueOnce(new Error('ipc fail'))

  const ok = await store.updateKeybinds({
    overrides: {},
    replaceAllOverrides: true
  })

  expect(ok).toBe(false)
  expect(notifyCreateMock).toHaveBeenCalled()
})

/**
 * S_FaKeybinds / updateKeybinds
 * Returns false when setKeybinds is missing.
 */
test('Test that updateKeybinds returns false when setKeybinds is unavailable', async () => {
  Object.defineProperty(globalThis, 'window', {
    value: {
      faContentBridgeAPIs: {
        faKeybinds: {
          getKeybinds: getKeybindsMock
        }
      }
    },
    configurable: true,
    writable: true
  })
  vi.resetModules()
  const stores = await import('../S_FaKeybinds')
  const localStore = stores.S_FaKeybinds()

  const ok = await localStore.updateKeybinds({
    replaceAllOverrides: true,
    overrides: {}
  })
  expect(ok).toBe(false)
})

/**
 * S_FaKeybinds / setSuspendGlobalKeybindDispatch
 * Toggles the suspend flag used by the global keydown router.
 */
test('Test that setSuspendGlobalKeybindDispatch updates the flag', () => {
  expect(store.suspendGlobalKeybindDispatch).toBe(false)
  store.setSuspendGlobalKeybindDispatch(true)
  expect(store.suspendGlobalKeybindDispatch).toBe(true)
})
