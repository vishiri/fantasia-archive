import { vi, expect, test, beforeEach } from 'vitest'

import type { I_faUserSettings } from 'app/types/I_faUserSettings'

type T_storeConstructorOptions = {
  name: string
  defaults: I_faUserSettings
}

const constructCalls: T_storeConstructorOptions[] = []

const ElectronStoreMock = vi.hoisted(() => vi.fn())

vi.mock('electron-store', () => {
  return {
    default: ElectronStoreMock.mockImplementation(function (
      this: { store: I_faUserSettings },
      opts: T_storeConstructorOptions
    ) {
      constructCalls.push(opts)
      this.store = { ...opts.defaults }
    })
  }
})

beforeEach(async () => {
  vi.resetModules()
  constructCalls.length = 0
  ElectronStoreMock.mockClear()
})

/**
 * getFaUserSettings
 * Lazily constructs one 'electron-store' instance with the Fantasia settings file name and theme default.
 */
test('Test that getFaUserSettings creates the store once with expected name and defaults', async () => {
  const { getFaUserSettings } = await import('../userSettingsStore')
  const first = getFaUserSettings()
  const second = getFaUserSettings()

  expect(first).toBe(second)
  expect(ElectronStoreMock).toHaveBeenCalledTimes(1)
  expect(constructCalls[0]).toEqual({
    name: 'faUserSettings',
    defaults: { theme: 'light' }
  })
})
