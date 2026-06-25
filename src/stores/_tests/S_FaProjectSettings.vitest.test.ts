import { beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type * as S_FaProjectSettingsStore from '../S_FaProjectSettings'

const {
  refreshFromBridgeMock,
  persistPatchFromStoreMock
} = vi.hoisted(() => {
  return {
    persistPatchFromStoreMock: vi.fn(async (_opts: {
      applyRoot: (next: I_faProjectSettingsRoot) => void
      patch: { projectName?: string }
    }) => undefined),
    refreshFromBridgeMock: vi.fn(async (_opts: {
      applyRoot: (next: I_faProjectSettingsRoot) => void
    }) => true)
  }
})

vi.mock('../scripts/sFaProjectSettingsBridge', () => {
  return {
    faProjectSettingsPersistPatchFromStore: persistPatchFromStoreMock,
    faProjectSettingsRefreshFromBridge: refreshFromBridgeMock
  }
})

let store: ReturnType<typeof S_FaProjectSettingsStore.S_FaProjectSettings>

beforeEach(async () => {
  setActivePinia(createPinia())
  vi.resetModules()
  refreshFromBridgeMock.mockReset()
  refreshFromBridgeMock.mockResolvedValue(true)
  persistPatchFromStoreMock.mockReset()

  const stores = await import('../S_FaProjectSettings')
  store = stores.S_FaProjectSettings()
})

/**
 * S_FaProjectSettings / applyRoot
 * Stores the canonical settings snapshot on the Pinia ref.
 */
test('Test that applyRoot sets root on the store', () => {
  const snapshot = {
    projectName: 'Arcovia',
    schemaVersion: 1 as const
  }
  store.applyRoot(snapshot)
  expect(store.root).toEqual(snapshot)
})

/**
 * S_FaProjectSettings / refreshProjectSettings
 * Delegates hydration to the bridge helper.
 */
test('Test that refreshProjectSettings delegates to faProjectSettingsRefreshFromBridge', async () => {
  const snapshot = {
    projectName: 'From Bridge',
    schemaVersion: 1 as const
  }
  refreshFromBridgeMock.mockImplementationOnce(async (opts: {
    applyRoot: (next: I_faProjectSettingsRoot) => void
  }) => {
    opts.applyRoot(snapshot)
    return true
  })
  const ok = await store.refreshProjectSettings()
  expect(ok).toBe(true)
  expect(store.root).toEqual(snapshot)
})

/**
 * S_FaProjectSettings / updateProjectSettings
 * Persists through faProjectSettingsPersistPatchFromStore with applyRoot wired.
 */
test('Test that updateProjectSettings persists via bridge helper', async () => {
  const patch = { projectName: 'Next' }
  await store.updateProjectSettings(patch)
  expect(persistPatchFromStoreMock).toHaveBeenCalledOnce()
  const callArg = persistPatchFromStoreMock.mock.calls[0]![0]! as {
    applyRoot: (next: I_faProjectSettingsRoot) => void
    patch: typeof patch
  }
  expect(callArg.patch).toEqual(patch)
  callArg.applyRoot({
    projectName: 'Applied',
    schemaVersion: 1
  })
  expect(store.root?.projectName).toBe('Applied')
})
