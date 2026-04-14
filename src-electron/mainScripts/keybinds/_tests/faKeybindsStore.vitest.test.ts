import { beforeEach, expect, test, vi } from 'vitest'

import type ElectronStore from 'electron-store'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'

import { FA_KEYBINDS_STORE_DEFAULTS } from '../faKeybindsStoreDefaults'

type T_storeConstructorOptions = {
  defaults: I_faKeybindsRoot
  name: string
}

const constructCalls: T_storeConstructorOptions[] = []
const { ElectronStoreMock, persistedStoreExtras, storeReplacementCalls } = vi.hoisted(() => {
  return {
    ElectronStoreMock: vi.fn(),
    persistedStoreExtras: {} as Record<string, unknown>,
    storeReplacementCalls: [] as I_faKeybindsRoot[]
  }
})

vi.mock('electron-store', () => {
  return {
    default: ElectronStoreMock.mockImplementation(function (
      this: { store: I_faKeybindsRoot },
      opts: T_storeConstructorOptions
    ) {
      constructCalls.push(opts)
      let storeSnapshot = {
        ...opts.defaults,
        ...persistedStoreExtras
      } as I_faKeybindsRoot & Record<string, unknown>

      Object.defineProperty(this, 'store', {
        configurable: true,
        enumerable: true,
        get () {
          return storeSnapshot
        },
        set (value: I_faKeybindsRoot) {
          storeReplacementCalls.push(value)
          storeSnapshot = value as I_faKeybindsRoot & Record<string, unknown>
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
 * getFaKeybinds
 * Lazily constructs one electron-store with the Fantasia keybind file name and defaults.
 */
test('Test that getFaKeybinds creates the store once with expected name and defaults', async () => {
  const { getFaKeybinds } = await import('../faKeybindsStore')
  const first = getFaKeybinds()
  const second = getFaKeybinds()

  expect(first).toBe(second)
  expect(ElectronStoreMock).toHaveBeenCalledTimes(1)
  expect(constructCalls[0]).toEqual({
    name: 'faKeybinds',
    defaults: { ...FA_KEYBINDS_STORE_DEFAULTS }
  })
})

/**
 * cleanupFaKeybinds
 * Strips unknown override command ids and rewrites the store once.
 */
test('Test that getFaKeybinds removes unknown override keys during startup cleanup', async () => {
  persistedStoreExtras.overrides = {
    futureCommand: {
      code: 'KeyZ',
      mods: ['alt']
    },
    openProgramSettings: null
  }
  persistedStoreExtras.schemaVersion = 1

  const { getFaKeybinds } = await import('../faKeybindsStore')
  getFaKeybinds()

  expect(storeReplacementCalls.length).toBeGreaterThanOrEqual(1)
  const last = storeReplacementCalls.at(-1)
  expect(last?.overrides.openProgramSettings).toBeNull()
  expect('futureCommand' in (last?.overrides ?? {})).toBe(false)
})

/**
 * cleanupFaKeybinds
 * Does not rewrite when persisted data only contains known keys and schemaVersion 1.
 */
test('Test that getFaKeybinds does not rewrite a clean persisted keybind store', async () => {
  persistedStoreExtras.overrides = {
    openProgramSettings: null
  }
  persistedStoreExtras.schemaVersion = 1

  const { getFaKeybinds } = await import('../faKeybindsStore')
  getFaKeybinds()

  expect(storeReplacementCalls.length).toBe(0)
})

/**
 * cleanupFaKeybinds
 * Copies plain-object chord overrides from disk into the normalized map.
 */
test('Test that cleanupFaKeybinds keeps object chord overrides', async () => {
  persistedStoreExtras.overrides = {
    openProgramSettings: {
      code: 'Comma',
      mods: ['meta']
    }
  }
  persistedStoreExtras.schemaVersion = 1

  const { getFaKeybinds } = await import('../faKeybindsStore')
  getFaKeybinds()

  expect(storeReplacementCalls.length).toBe(0)
})

/**
 * cleanupFaKeybinds
 * Ignores array-shaped override values and rewrites when unknown keys exist.
 */
test('Test that cleanupFaKeybinds drops array override values when disk also has unknown keys', async () => {
  persistedStoreExtras.overrides = {
    futureCommand: {
      code: 'KeyZ',
      mods: ['alt']
    },
    openProgramSettings: ['not', 'a', 'chord']
  }
  persistedStoreExtras.schemaVersion = 1

  const { getFaKeybinds } = await import('../faKeybindsStore')
  getFaKeybinds()

  expect(storeReplacementCalls.length).toBeGreaterThanOrEqual(1)
  const last = storeReplacementCalls.at(-1)
  expect(last?.overrides.openProgramSettings).toBeUndefined()
})

/**
 * cleanupFaKeybinds
 * Rewrites when unexpected top-level keys exist on disk.
 */
test('Test that cleanupFaKeybinds strips unexpected top-level keys', async () => {
  persistedStoreExtras.overrides = {}
  persistedStoreExtras.schemaVersion = 1
  persistedStoreExtras.junkTopLevel = true

  const { getFaKeybinds } = await import('../faKeybindsStore')
  getFaKeybinds()

  expect(storeReplacementCalls.length).toBeGreaterThanOrEqual(1)
})

/**
 * cleanupFaKeybinds
 * Treats a null persisted store object like an empty root before normalization.
 */
test('Test that cleanupFaKeybinds handles null store snapshot', async () => {
  const { cleanupFaKeybinds } = await import('../faKeybindsStore')
  const written: I_faKeybindsRoot[] = []
  const fake = {} as ElectronStore<I_faKeybindsRoot>
  Object.defineProperty(fake, 'store', {
    configurable: true,
    enumerable: true,
    get () {
      return null
    },
    set (value: I_faKeybindsRoot) {
      written.push(value)
    }
  })
  cleanupFaKeybinds(fake)
  expect(written.length).toBeGreaterThan(0)
})
