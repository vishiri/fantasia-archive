import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import { FA_KEYBINDS_STORE_DEFAULTS } from 'app/src-electron/mainScripts/keybinds/keybinds_managerDefaults'
import type { I_faKeybindsSnapshot } from 'app/types/I_faKeybindsDomain'

const { tMock, getKeybindsMock } = vi.hoisted(() => {
  return {
    tMock: vi.fn((key: string) => key),
    getKeybindsMock: vi.fn(async (): Promise<I_faKeybindsSnapshot> => ({
      platform: 'win32',
      store: { ...FA_KEYBINDS_STORE_DEFAULTS }
    }))
  }
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
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { faContentBridgeAPIs: {} },
    writable: true
  })

  const { runFaKeybindsRefreshKeybinds } = await import('../scripts/sFaKeybindsBridgeRefresh')
  const snapshot = ref<I_faKeybindsSnapshot | null>(null)

  await runFaKeybindsRefreshKeybinds(snapshot)

  expect(snapshot.value).toBeNull()
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

  const { runFaKeybindsRefreshKeybinds } = await import('../scripts/sFaKeybindsBridgeRefresh')
  const snapshot = ref<I_faKeybindsSnapshot | null>(null)

  await runFaKeybindsRefreshKeybinds(snapshot)

  expect(getKeybindsMock).toHaveBeenCalledOnce()
  expect(snapshot.value?.platform).toBe('darwin')
})

/**
 * runFaKeybindsRefreshKeybinds
 * Throws when getKeybinds rejects so callers route failure through the action manager.
 */
test('Test that runFaKeybindsRefreshKeybinds throws on getKeybinds failure', async () => {
  vi.resetModules()
  getKeybindsMock.mockReset()
  getKeybindsMock.mockRejectedValueOnce(new Error('bridge fail'))
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: { faKeybinds: { getKeybinds: getKeybindsMock } }
    },
    writable: true
  })

  const { runFaKeybindsRefreshKeybinds } = await import('../scripts/sFaKeybindsBridgeRefresh')
  const snapshot = ref<I_faKeybindsSnapshot | null>(null)

  await expect(runFaKeybindsRefreshKeybinds(snapshot)).rejects.toThrow(
    'globalFunctionality.faKeybinds.loadError'
  )
  expect(snapshot.value).toBeNull()
})
