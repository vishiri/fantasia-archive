import { afterEach, beforeEach, expect, test } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'

import { registerFaE2eActiveProjectSnapshotProbe } from '../registerFaE2eActiveProjectSnapshotProbe'

beforeEach(() => {
  setActivePinia(createPinia())
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {} as Window & typeof globalThis
  })
})

afterEach(() => {
  delete window.__faE2eGetActiveProjectSnapshot
})

/**
 * registerFaE2eActiveProjectSnapshotProbe
 * Installs a window getter that mirrors S_FaActiveProject for E2E assertions.
 */
test('Test that E2E active project probe returns null before any project is set', () => {
  registerFaE2eActiveProjectSnapshotProbe()
  expect(window.__faE2eGetActiveProjectSnapshot?.()).toBeNull()
})

/**
 * registerFaE2eActiveProjectSnapshotProbe
 */
test('Test that E2E active project probe returns null when Pinia has no active instance', () => {
  registerFaE2eActiveProjectSnapshotProbe()
  setActivePinia(undefined as never)
  expect(window.__faE2eGetActiveProjectSnapshot?.()).toBeNull()
})

/**
 * registerFaE2eActiveProjectSnapshotProbe
 */
test('Test that E2E active project probe returns the current store snapshot', () => {
  registerFaE2eActiveProjectSnapshotProbe()
  const row = {
    filePath: '/tmp/x.faproject',
    id: 'id-e2e',
    name: 'Probe Realm'
  }
  S_FaActiveProject().setActiveProject(row)
  expect(window.__faE2eGetActiveProjectSnapshot?.()).toEqual(row)
})
