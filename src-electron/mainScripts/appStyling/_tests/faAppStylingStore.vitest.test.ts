import { beforeEach, expect, test, vi } from 'vitest'

import type ElectronStore from 'electron-store'
import type { I_faAppStylingRoot } from 'app/types/I_faAppStylingDomain'

import { FA_APP_STYLING_STORE_DEFAULTS } from '../faAppStylingStoreDefaults'

type T_storeConstructorOptions = {
  defaults: I_faAppStylingRoot
  name: string
}

const constructCalls: T_storeConstructorOptions[] = []
const { ElectronStoreMock, persistedStoreExtras, storeReplacementCalls } = vi.hoisted(() => {
  return {
    ElectronStoreMock: vi.fn(),
    persistedStoreExtras: {} as Record<string, unknown>,
    storeReplacementCalls: [] as I_faAppStylingRoot[]
  }
})

vi.mock('electron-store', () => {
  return {
    default: ElectronStoreMock.mockImplementation(function (
      this: { store: I_faAppStylingRoot },
      opts: T_storeConstructorOptions
    ) {
      constructCalls.push(opts)
      let storeSnapshot = {
        ...opts.defaults,
        ...persistedStoreExtras
      } as I_faAppStylingRoot & Record<string, unknown>

      Object.defineProperty(this, 'store', {
        configurable: true,
        enumerable: true,
        get () {
          return storeSnapshot
        },
        set (value: I_faAppStylingRoot) {
          storeReplacementCalls.push(value)
          storeSnapshot = value as I_faAppStylingRoot & Record<string, unknown>
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
 * getFaAppStyling
 * Lazily constructs one electron-store with the expected file name and defaults.
 */
test('Test that getFaAppStyling creates the store once with expected name and defaults', async () => {
  const { getFaAppStyling } = await import('../faAppStylingStore')
  const first = getFaAppStyling()
  const second = getFaAppStyling()

  expect(first).toBe(second)
  expect(ElectronStoreMock).toHaveBeenCalledTimes(1)
  expect(constructCalls[0]).toEqual({
    name: 'faAppStyling',
    defaults: { ...FA_APP_STYLING_STORE_DEFAULTS }
  })
})

/**
 * cleanupFaAppStyling
 * Does not rewrite when persisted data is already a clean schemaVersion 1 root with a string css.
 */
test('Test that getFaAppStyling does not rewrite a clean persisted store', async () => {
  persistedStoreExtras.css = '/* user theme */'
  persistedStoreExtras.schemaVersion = 1

  const { getFaAppStyling } = await import('../faAppStylingStore')
  getFaAppStyling()

  expect(storeReplacementCalls.length).toBe(0)
})

/**
 * cleanupFaAppStyling
 * Strips unexpected top-level keys and rewrites the store once.
 */
test('Test that getFaAppStyling strips unexpected top-level keys', async () => {
  persistedStoreExtras.css = 'body { color: red; }'
  persistedStoreExtras.schemaVersion = 1
  persistedStoreExtras.junkTopLevel = true

  const { getFaAppStyling } = await import('../faAppStylingStore')
  getFaAppStyling()

  expect(storeReplacementCalls.length).toBeGreaterThanOrEqual(1)
  const last = storeReplacementCalls.at(-1)
  expect(last).toEqual({
    css: 'body { color: red; }',
    frame: null,
    schemaVersion: 1
  })
})

/**
 * cleanupFaAppStyling
 * Coerces non-string css values to an empty string and rewrites with schemaVersion 1.
 */
test('Test that getFaAppStyling coerces non-string css to empty', async () => {
  persistedStoreExtras.css = 12345 as unknown as string
  persistedStoreExtras.schemaVersion = 1

  const { getFaAppStyling } = await import('../faAppStylingStore')
  getFaAppStyling()

  expect(storeReplacementCalls.length).toBeGreaterThanOrEqual(1)
  const last = storeReplacementCalls.at(-1)
  expect(last).toEqual({
    css: '',
    frame: null,
    schemaVersion: 1
  })
})

/**
 * cleanupFaAppStyling
 * Rewrites when schemaVersion does not match the current contract.
 */
test('Test that getFaAppStyling normalizes mismatched schemaVersion', async () => {
  persistedStoreExtras.css = 'a { color: blue; }'
  persistedStoreExtras.schemaVersion = 99

  const { getFaAppStyling } = await import('../faAppStylingStore')
  getFaAppStyling()

  expect(storeReplacementCalls.length).toBeGreaterThanOrEqual(1)
  const last = storeReplacementCalls.at(-1)
  expect(last).toEqual({
    css: 'a { color: blue; }',
    frame: null,
    schemaVersion: 1
  })
})

/**
 * cleanupFaAppStyling
 * Treats a null persisted store snapshot like an empty root and writes the normalized defaults.
 */
test('Test that cleanupFaAppStyling handles null store snapshot', async () => {
  const { cleanupFaAppStyling } = await import('../faAppStylingStore')
  const written: I_faAppStylingRoot[] = []
  const fake = {} as ElectronStore<I_faAppStylingRoot>
  Object.defineProperty(fake, 'store', {
    configurable: true,
    enumerable: true,
    get () {
      return null
    },
    set (value: I_faAppStylingRoot) {
      written.push(value)
    }
  })
  cleanupFaAppStyling(fake)
  expect(written.length).toBeGreaterThan(0)
  expect(written[0]).toEqual({
    css: '',
    frame: null,
    schemaVersion: 1
  })
})
