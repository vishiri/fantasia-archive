import { expect, test } from 'vitest'

import { isPlainRecord } from '../faPlainRecord'

/**
 * isPlainRecord
 * Accepts a direct object and rejects arrays, null, and class instances.
 */
test('Test that isPlainRecord accepts only direct object instances', () => {
  expect(isPlainRecord({ a: 1 })).toBe(true)
  expect(isPlainRecord([])).toBe(false)
  expect(isPlainRecord(null)).toBe(false)
  expect(isPlainRecord(new Date())).toBe(false)
  expect(isPlainRecord('x')).toBe(false)
})
