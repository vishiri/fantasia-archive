import { vi, expect, test, beforeEach } from 'vitest'

import type { I_faUserSettings } from 'app/types/I_faUserSettings'

import { FA_USER_SETTINGS_DEFAULTS } from '../faUserSettingsDefaults'

type T_storeConstructorOptions = {
  name: string
  defaults: I_faUserSettings
}

const constructCalls: T_storeConstructorOptions[] = []
const { ElectronStoreMock, persistedStoreExtras, storeReplacementCalls } = vi.hoisted(() => {
  return {
    ElectronStoreMock: vi.fn(),
    persistedStoreExtras: {} as Record<string, boolean>,
    storeReplacementCalls: [] as I_faUserSettings[]
  }
})

vi.mock('electron-store', () => {
  return {
    default: ElectronStoreMock.mockImplementation(function (
      this: { store: I_faUserSettings },
      opts: T_storeConstructorOptions
    ) {
      constructCalls.push(opts)
      let storeSnapshot = {
        ...opts.defaults,
        ...persistedStoreExtras
      } as I_faUserSettings

      Object.defineProperty(this, 'store', {
        configurable: true,
        enumerable: true,
        get () {
          return storeSnapshot
        },
        set (value: I_faUserSettings) {
          storeReplacementCalls.push(value)
          storeSnapshot = value
        }
      })
    })
  }
})

beforeEach(async () => {
  vi.resetModules()
  constructCalls.length = 0
  ElectronStoreMock.mockClear()
  storeReplacementCalls.length = 0
  for (const key of Object.keys(persistedStoreExtras)) {
    delete persistedStoreExtras[key]
  }
})

/**
 * getFaUserSettings
 * Lazily constructs one 'electron-store' instance with the Fantasia settings file name and boolean defaults.
 */
test('Test that getFaUserSettings creates the store once with expected name and defaults', async () => {
  const { getFaUserSettings } = await import('../userSettingsStore')
  const first = getFaUserSettings()
  const second = getFaUserSettings()

  expect(first).toBe(second)
  expect(ElectronStoreMock).toHaveBeenCalledTimes(1)
  expect(constructCalls[0]).toEqual({
    name: 'faUserSettings',
    defaults: { ...FA_USER_SETTINGS_DEFAULTS }
  })
})

/**
 * getFaUserSettings
 * Unknown persisted settings keys are removed and the sanitized settings are auto-saved once.
 */
test('Test that getFaUserSettings removes unknown persisted keys during startup cleanup', async () => {
  persistedStoreExtras.darkMode = true
  persistedStoreExtras.futureKey = true

  const { getFaUserSettings } = await import('../userSettingsStore')
  const store = getFaUserSettings()

  expect(storeReplacementCalls).toEqual([
    { ...FA_USER_SETTINGS_DEFAULTS, darkMode: true }
  ])
  expect((store.store as I_faUserSettings & Record<string, boolean>).futureKey).toBeUndefined()
})

/**
 * getFaUserSettings
 * Startup cleanup does not rewrite the store when all persisted keys still exist in defaults.
 */
test('Test that getFaUserSettings does not rewrite a clean persisted settings store', async () => {
  persistedStoreExtras.darkMode = true

  const { getFaUserSettings } = await import('../userSettingsStore')
  const store = getFaUserSettings()

  expect(storeReplacementCalls).toEqual([])
  expect(store.store.darkMode).toBe(true)
})
