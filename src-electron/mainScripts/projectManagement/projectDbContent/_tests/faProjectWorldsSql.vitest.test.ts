import { expect, test, vi } from 'vitest'

import { countFaProjectWorlds } from '../faProjectWorldsSqlWiring'

/**
 * countFaProjectWorlds
 * Returns the SQLite COUNT aggregate for the worlds table.
 */
test('Test that countFaProjectWorlds returns the aggregate count', () => {
  const db = {
    prepare: vi.fn(() => ({
      get: () => ({ c: 3 })
    }))
  }
  expect(countFaProjectWorlds(db as never)).toBe(3)
})
