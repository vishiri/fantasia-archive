import { expect, test } from 'vitest'

import { createAssertMainWindowSender } from '../assertMainWindowSender'

/**
 * createAssertMainWindowSender
 * Rejects when main webContents id is unavailable.
 */
test('Test that assertMainWindowSender returns false when main id is null', () => {
  const { assertMainWindowSender } = createAssertMainWindowSender({
    getMainWebContentsId: () => null
  })
  expect(assertMainWindowSender({ id: 1 })).toBe(false)
})

/**
 * createAssertMainWindowSender
 * Accepts matching sender id.
 */
test('Test that assertMainWindowSender returns true for matching sender id', () => {
  const { assertMainWindowSender } = createAssertMainWindowSender({
    getMainWebContentsId: () => 42
  })
  expect(assertMainWindowSender({ id: 42 })).toBe(true)
})

/**
 * createAssertMainWindowSender
 * Rejects mismatched sender id.
 */
test('Test that assertMainWindowSender returns false for foreign sender id', () => {
  const { assertMainWindowSender } = createAssertMainWindowSender({
    getMainWebContentsId: () => 42
  })
  expect(assertMainWindowSender({ id: 99 })).toBe(false)
})
