import { beforeEach, expect, test } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { resolveFaActionManagerStore } from '../faActionManagerStoreBridge'

beforeEach(() => {
  setActivePinia(undefined)
})

/**
 * resolveFaActionManagerStore
 * Returns null when no Pinia is active rather than throwing.
 */
test('Test that resolveFaActionManagerStore returns null when no Pinia is active', () => {
  expect(resolveFaActionManagerStore()).toBeNull()
})

/**
 * resolveFaActionManagerStore
 * Returns the resolved store when a Pinia is active.
 */
test('Test that resolveFaActionManagerStore returns the store when Pinia is active', () => {
  setActivePinia(createPinia())
  const store = resolveFaActionManagerStore()
  expect(store).not.toBeNull()
  expect(store?.actionHistory).toEqual([])
})
