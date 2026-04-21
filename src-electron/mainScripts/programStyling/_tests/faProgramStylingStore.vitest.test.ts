import { beforeEach, expect, test, vi } from 'vitest'

import type ElectronStore from 'electron-store'
import type { I_faProgramStylingRoot } from 'app/types/I_faProgramStylingDomain'

import { FA_PROGRAM_STYLING_STORE_DEFAULTS } from '../faProgramStylingStoreDefaults'

type T_storeConstructorOptions = {
  defaults: I_faProgramStylingRoot
  name: string
}

const constructCalls: T_storeConstructorOptions[] = []
const { ElectronStoreMock, persistedStoreExtras, storeReplacementCalls } = vi.hoisted(() => {
  return {
    ElectronStoreMock: vi.fn(),
    persistedStoreExtras: {} as Record<string, unknown>,
    storeReplacementCalls: [] as I_faProgramStylingRoot[]
  }
})

vi.mock('electron-store', () => {
  return {
    default: ElectronStoreMock.mockImplementation(function (
      this: { store: I_faProgramStylingRoot },
      opts: T_storeConstructorOptions
    ) {
      constructCalls.push(opts)
      let storeSnapshot = {
        ...opts.defaults,
        ...persistedStoreExtras
      } as I_faProgramStylingRoot & Record<string, unknown>

      Object.defineProperty(this, 'store', {
        configurable: true,
        enumerable: true,
        get () {
          return storeSnapshot
        },
        set (value: I_faProgramStylingRoot) {
          storeReplacementCalls.push(value)
          storeSnapshot = value as I_faProgramStylingRoot & Record<string, unknown>
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
 * getFaProgramStyling
 * Lazily constructs one electron-store with the Fantasia program styling file name and defaults.
 */
test('Test that getFaProgramStyling creates the store once with expected name and defaults', async () => {
  const { getFaProgramStyling } = await import('../faProgramStylingStore')
  const first = getFaProgramStyling()
  const second = getFaProgramStyling()

  expect(first).toBe(second)
  expect(ElectronStoreMock).toHaveBeenCalledTimes(1)
  expect(constructCalls[0]).toEqual({
    name: 'faProgramStyling',
    defaults: { ...FA_PROGRAM_STYLING_STORE_DEFAULTS }
  })
})

/**
 * cleanupFaProgramStyling
 * Does not rewrite when persisted data is already a clean schemaVersion 1 root with a string css.
 */
test('Test that getFaProgramStyling does not rewrite a clean persisted store', async () => {
  persistedStoreExtras.css = '/* user theme */'
  persistedStoreExtras.schemaVersion = 1

  const { getFaProgramStyling } = await import('../faProgramStylingStore')
  getFaProgramStyling()

  expect(storeReplacementCalls.length).toBe(0)
})

/**
 * cleanupFaProgramStyling
 * Strips unexpected top-level keys and rewrites the store once.
 */
test('Test that getFaProgramStyling strips unexpected top-level keys', async () => {
  persistedStoreExtras.css = 'body { color: red; }'
  persistedStoreExtras.schemaVersion = 1
  persistedStoreExtras.junkTopLevel = true

  const { getFaProgramStyling } = await import('../faProgramStylingStore')
  getFaProgramStyling()

  expect(storeReplacementCalls.length).toBeGreaterThanOrEqual(1)
  const last = storeReplacementCalls.at(-1)
  expect(last).toEqual({
    css: 'body { color: red; }',
    schemaVersion: 1
  })
})

/**
 * cleanupFaProgramStyling
 * Coerces non-string css values to an empty string and rewrites with schemaVersion 1.
 */
test('Test that getFaProgramStyling coerces non-string css to empty', async () => {
  persistedStoreExtras.css = 12345 as unknown as string
  persistedStoreExtras.schemaVersion = 1

  const { getFaProgramStyling } = await import('../faProgramStylingStore')
  getFaProgramStyling()

  expect(storeReplacementCalls.length).toBeGreaterThanOrEqual(1)
  const last = storeReplacementCalls.at(-1)
  expect(last).toEqual({
    css: '',
    schemaVersion: 1
  })
})

/**
 * cleanupFaProgramStyling
 * Rewrites when schemaVersion does not match the current contract.
 */
test('Test that getFaProgramStyling normalizes mismatched schemaVersion', async () => {
  persistedStoreExtras.css = 'a { color: blue; }'
  persistedStoreExtras.schemaVersion = 99

  const { getFaProgramStyling } = await import('../faProgramStylingStore')
  getFaProgramStyling()

  expect(storeReplacementCalls.length).toBeGreaterThanOrEqual(1)
  const last = storeReplacementCalls.at(-1)
  expect(last).toEqual({
    css: 'a { color: blue; }',
    schemaVersion: 1
  })
})

/**
 * cleanupFaProgramStyling
 * Treats a null persisted store snapshot like an empty root and writes the normalized defaults.
 */
test('Test that cleanupFaProgramStyling handles null store snapshot', async () => {
  const { cleanupFaProgramStyling } = await import('../faProgramStylingStore')
  const written: I_faProgramStylingRoot[] = []
  const fake = {} as ElectronStore<I_faProgramStylingRoot>
  Object.defineProperty(fake, 'store', {
    configurable: true,
    enumerable: true,
    get () {
      return null
    },
    set (value: I_faProgramStylingRoot) {
      written.push(value)
    }
  })
  cleanupFaProgramStyling(fake)
  expect(written.length).toBeGreaterThan(0)
  expect(written[0]).toEqual({
    css: '',
    schemaVersion: 1
  })
})
