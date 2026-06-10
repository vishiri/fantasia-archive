import { expect, test, vi } from 'vitest'

import { seedFaProjectDefaultWorldIfEmpty } from '../faProjectWorldBootstrapWiring'

const countFaProjectWorldsMock = vi.hoisted(() => vi.fn())
const insertFaProjectWorldMock = vi.hoisted(() => vi.fn())

vi.mock('../faProjectWorldsSqlWiring', () => {
  return {
    countFaProjectWorlds: countFaProjectWorldsMock,
    insertFaProjectWorld: insertFaProjectWorldMock
  }
})

/**
 * seedFaProjectDefaultWorldIfEmpty
 * Skips insert when worlds already exist.
 */
test('Test that seedFaProjectDefaultWorldIfEmpty skips when worlds already exist', () => {
  countFaProjectWorldsMock.mockReturnValueOnce(2)
  seedFaProjectDefaultWorldIfEmpty({} as never, 'Realm')
  expect(insertFaProjectWorldMock).not.toHaveBeenCalled()
})

/**
 * seedFaProjectDefaultWorldIfEmpty
 * Inserts a default world using the project display name.
 */
test('Test that seedFaProjectDefaultWorldIfEmpty inserts when the table is empty', () => {
  countFaProjectWorldsMock.mockReturnValueOnce(0)
  seedFaProjectDefaultWorldIfEmpty({} as never, 'My Realm')
  expect(insertFaProjectWorldMock).toHaveBeenCalledWith({}, 'My Realm')
})
