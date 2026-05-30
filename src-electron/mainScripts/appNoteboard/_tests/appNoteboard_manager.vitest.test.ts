import { beforeEach, expect, test, vi } from 'vitest'

import type ElectronStore from 'electron-store'
import type { I_faAppNoteboardRoot } from 'app/types/I_faAppNoteboardDomain'

import { FA_APP_NOTEBOARD_STORE_DEFAULTS } from '../appNoteboard_managerDefaults'

type T_storeConstructorOptions = {
  defaults: I_faAppNoteboardRoot
  name: string
}

const constructCalls: T_storeConstructorOptions[] = []
const { ElectronStoreMock, persistedStoreExtras, storeReplacementCalls } = vi.hoisted(() => {
  return {
    ElectronStoreMock: vi.fn(),
    persistedStoreExtras: {} as Record<string, unknown>,
    storeReplacementCalls: [] as I_faAppNoteboardRoot[]
  }
})

vi.mock('electron-store', () => {
  return {
    default: ElectronStoreMock.mockImplementation(function (
      this: { store: I_faAppNoteboardRoot },
      opts: T_storeConstructorOptions
    ) {
      constructCalls.push(opts)
      let storeSnapshot = {
        ...opts.defaults,
        ...persistedStoreExtras
      } as I_faAppNoteboardRoot & Record<string, unknown>

      Object.defineProperty(this, 'store', {
        configurable: true,
        enumerable: true,
        get () {
          return storeSnapshot
        },
        set (value: I_faAppNoteboardRoot) {
          storeReplacementCalls.push(value)
          storeSnapshot = value as I_faAppNoteboardRoot & Record<string, unknown>
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
 * getFaAppNoteboard
 * Lazily constructs one electron-store with the expected file name and defaults.
 */
test('Test that getFaAppNoteboard creates the store once with expected name and defaults', async () => {
  const { getFaAppNoteboard } = await import('../appNoteboard_manager')
  const first = getFaAppNoteboard()
  const second = getFaAppNoteboard()

  expect(first).toBe(second)
  expect(ElectronStoreMock).toHaveBeenCalledTimes(1)
  expect(constructCalls[0]).toEqual({
    name: 'faAppNoteboard',
    defaults: { ...FA_APP_NOTEBOARD_STORE_DEFAULTS }
  })
})

/**
 * cleanupFaAppNoteboard
 * Does not rewrite when persisted data is already a clean schemaVersion 1 root.
 */
test('Test that getFaAppNoteboard does not rewrite a clean persisted store', async () => {
  persistedStoreExtras.frame = null
  persistedStoreExtras.schemaVersion = 1
  persistedStoreExtras.text = 'notes'

  const { getFaAppNoteboard } = await import('../appNoteboard_manager')
  getFaAppNoteboard()

  expect(storeReplacementCalls.length).toBe(0)
})

/**
 * cleanupFaAppNoteboard
 * Strips unexpected top-level keys and rewrites the store once.
 */
test('Test that getFaAppNoteboard strips unexpected top-level keys', async () => {
  persistedStoreExtras.frame = null
  persistedStoreExtras.schemaVersion = 1
  persistedStoreExtras.text = 'a'
  persistedStoreExtras.junkTopLevel = true

  const { getFaAppNoteboard } = await import('../appNoteboard_manager')
  getFaAppNoteboard()

  expect(storeReplacementCalls.length).toBeGreaterThanOrEqual(1)
  const last = storeReplacementCalls.at(-1)
  expect(last).toEqual({
    frame: null,
    schemaVersion: 1,
    text: 'a'
  })
})

/**
 * cleanupFaAppNoteboard
 * Coerces non-string text to empty and rewrites.
 */
test('Test that getFaAppNoteboard coerces non-string text to empty', async () => {
  persistedStoreExtras.frame = null
  persistedStoreExtras.schemaVersion = 1
  persistedStoreExtras.text = 99 as unknown as string

  const { getFaAppNoteboard } = await import('../appNoteboard_manager')
  getFaAppNoteboard()

  expect(storeReplacementCalls.length).toBeGreaterThanOrEqual(1)
  const last = storeReplacementCalls.at(-1)
  expect(last).toEqual({
    frame: null,
    schemaVersion: 1,
    text: ''
  })
})

/**
 * cleanupFaAppNoteboard
 * Drops unusable frame objects to null.
 */
test('Test that getFaAppNoteboard normalizes invalid frame to null', async () => {
  persistedStoreExtras.frame = {
    height: 10,
    width: 10,
    x: 0,
    y: 0
  }
  persistedStoreExtras.schemaVersion = 1
  persistedStoreExtras.text = ''

  const { getFaAppNoteboard } = await import('../appNoteboard_manager')
  getFaAppNoteboard()

  expect(storeReplacementCalls.length).toBeGreaterThanOrEqual(1)
  const last = storeReplacementCalls.at(-1)
  expect(last).toEqual({
    frame: null,
    schemaVersion: 1,
    text: ''
  })
})

/**
 * cleanupFaAppNoteboard
 * Treats a null persisted store snapshot like an empty root.
 */
test('Test that cleanupFaAppNoteboard handles null store snapshot', async () => {
  const { cleanupFaAppNoteboard } = await import('../appNoteboard_manager')
  const written: I_faAppNoteboardRoot[] = []
  const fake = {} as ElectronStore<I_faAppNoteboardRoot>
  Object.defineProperty(fake, 'store', {
    configurable: true,
    enumerable: true,
    get () {
      return null
    },
    set (value: I_faAppNoteboardRoot) {
      written.push(value)
    }
  })
  cleanupFaAppNoteboard(fake)
  expect(written.length).toBeGreaterThan(0)
  expect(written[0]).toEqual({
    frame: null,
    schemaVersion: 1,
    text: ''
  })
})
