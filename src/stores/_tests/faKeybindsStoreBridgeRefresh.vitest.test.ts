import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import { FA_KEYBINDS_STORE_DEFAULTS } from 'app/src-electron/mainScripts/keybinds/faKeybindsStoreDefaults'
import type { I_faKeybindsSnapshot } from 'app/types/I_faKeybindsDomain'

const { notifyCreateMock, tMock, getKeybindsMock } = vi.hoisted(() => {
  return {
    notifyCreateMock: vi.fn(),
    tMock: vi.fn((key: string) => key),
    getKeybindsMock: vi.fn(async (): Promise<I_faKeybindsSnapshot> => ({
      platform: 'win32',
      store: { ...FA_KEYBINDS_STORE_DEFAULTS }
    }))
  }
})

vi.mock('quasar', () => {
  return { Notify: { create: notifyCreateMock } }
})

vi.mock('app/i18n/externalFileLoader', () => {
  return { i18n: { global: { t: tMock } } }
})

/**
 * runFaKeybindsRefreshKeybinds
 * Leaves snapshot unchanged when getKeybinds is not a function on the bridge.
 */
test('Test that runFaKeybindsRefreshKeybinds no-ops when getKeybinds is missing', async () => {
  vi.resetModules()
  notifyCreateMock.mockReset()
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { faContentBridgeAPIs: {} },
    writable: true
  })

  const { runFaKeybindsRefreshKeybinds } = await import('../faKeybindsStoreBridgeRefresh')
  const snapshot = ref<I_faKeybindsSnapshot | null>(null)

  await runFaKeybindsRefreshKeybinds(snapshot)

  expect(snapshot.value).toBeNull()
  expect(notifyCreateMock).not.toHaveBeenCalled()
})

/**
 * runFaKeybindsRefreshKeybinds
 * Writes snapshot when getKeybinds resolves.
 */
test('Test that runFaKeybindsRefreshKeybinds assigns snapshot on success', async () => {
  vi.resetModules()
  getKeybindsMock.mockReset()
  getKeybindsMock.mockResolvedValue({
    platform: 'darwin',
    store: { ...FA_KEYBINDS_STORE_DEFAULTS }
  })
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: { faKeybinds: { getKeybinds: getKeybindsMock } }
    },
    writable: true
  })

  const { runFaKeybindsRefreshKeybinds } = await import('../faKeybindsStoreBridgeRefresh')
  const snapshot = ref<I_faKeybindsSnapshot | null>(null)

  await runFaKeybindsRefreshKeybinds(snapshot)

  expect(getKeybindsMock).toHaveBeenCalledOnce()
  expect(snapshot.value?.platform).toBe('darwin')
})

/**
 * runFaKeybindsRefreshKeybinds
 * Notifies when getKeybinds rejects.
 */
test('Test that runFaKeybindsRefreshKeybinds notifies on getKeybinds failure', async () => {
  vi.resetModules()
  notifyCreateMock.mockReset()
  getKeybindsMock.mockReset()
  getKeybindsMock.mockRejectedValueOnce(new Error('bridge fail'))
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: { faKeybinds: { getKeybinds: getKeybindsMock } }
    },
    writable: true
  })

  const { runFaKeybindsRefreshKeybinds } = await import('../faKeybindsStoreBridgeRefresh')
  const snapshot = ref<I_faKeybindsSnapshot | null>(null)

  await runFaKeybindsRefreshKeybinds(snapshot)

  expect(snapshot.value).toBeNull()
  expect(notifyCreateMock).toHaveBeenCalledWith(
    expect.objectContaining({
      message: 'globalFunctionality.faKeybinds.loadError',
      type: 'negative'
    })
  )
})
