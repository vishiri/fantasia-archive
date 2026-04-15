/**
 * Tests the Pinia store factory module at stores/index (Quasar boot entry).
 */

import type { Pinia } from 'pinia'
import { expect, test } from 'vitest'

import piniaStoreFactory from '../index'

/**
 * Pinia store factory (Quasar store wrapper)
 * Returns a Pinia root instance ready for app.use(pinia).
 */
test('Test that stores index factory returns a Pinia instance with install', () => {
  const pinia = piniaStoreFactory({} as never) as Pinia

  expect(pinia).toBeDefined()
  expect(typeof pinia.install).toBe('function')
})

/**
 * Pinia store factory (Quasar store wrapper)
 * Each invocation returns a distinct root instance for isolation.
 */
test('Test that stores index factory returns a fresh Pinia instance on each call', () => {
  const first = piniaStoreFactory({} as never) as Pinia
  const second = piniaStoreFactory({} as never) as Pinia

  expect(first).not.toBe(second)
})
