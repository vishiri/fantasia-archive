/** @vitest-environment jsdom */

import { expect, test } from 'vitest'

import { readFaSortableDragItemDataAttribute } from '../functions/readFaSortableDragItemDataAttribute'

/**
 * readFaSortableDragItemDataAttribute
 * Returns trimmed attribute values from a Sortable drag item root.
 */
test('readFaSortableDragItemDataAttribute returns the attribute when present', () => {
  const item = document.createElement('div')
  item.setAttribute('data-test-world-id', 'world-a')

  expect(readFaSortableDragItemDataAttribute(item, 'data-test-world-id')).toBe('world-a')
})

/**
 * readFaSortableDragItemDataAttribute
 * Treats missing and blank attribute values as null.
 */
test('readFaSortableDragItemDataAttribute returns null when the attribute is missing or blank', () => {
  const item = document.createElement('div')

  expect(readFaSortableDragItemDataAttribute(item, 'data-test-world-id')).toBeNull()

  item.setAttribute('data-test-world-id', '   ')
  expect(readFaSortableDragItemDataAttribute(item, 'data-test-world-id')).toBeNull()
})
