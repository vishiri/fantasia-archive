import { expect, test, vi } from 'vitest'

import { readFaProjectDataKv, upsertFaProjectDataKv } from '../faProjectDataKvWiring'

/**
 * upsertFaProjectDataKv
 * Executes a parameterized upsert prepared statement for the keyed row.
 */
test('Test that upsertFaProjectDataKv runs INSERT…ON CONFLICT against project_data', () => {
  const run = vi.fn()
  const db = {
    prepare: vi.fn(() => ({
      run
    }))
  }
  upsertFaProjectDataKv(db as never, 'k', 'v')
  expect(run).toHaveBeenCalledOnce()
  expect(run).toHaveBeenCalledWith({
    name: 'k',
    value: 'v'
  })
})

/**
 * readFaProjectDataKv
 * Returns primitive string payload from the SQLite row cell.
 */
test('Test that readFaProjectDataKv returns the stored raw option_value', () => {
  const get = vi.fn(() => ({ v: 'hello\nworld' }))
  const db = {
    prepare: vi.fn(() => ({ get }))
  }
  expect(readFaProjectDataKv(db as never, 'project_noteboard_content')).toBe('hello\nworld')
})

/**
 * readFaProjectDataKv
 * Yields undefined when no row matches the requested key name.
 */
test('Test that readFaProjectDataKv returns undefined when the row is missing', () => {
  const db = {
    prepare: vi.fn(() => ({ get: vi.fn(() => undefined) }))
  }
  expect(readFaProjectDataKv(db as never, 'missing')).toBe(undefined)
})
