import { expect, test } from 'vitest'
import { mdListArrayConverter } from '../mdListArrayConverter'

/**
 * mdListArrayConverter
 * Test markdown bullet extraction and cleanup.
 */
test('Test that mdListArrayConverter extracts only markdown list items', () => {
  const input = [
    'Intro text that should be removed',
    '- first entry',
    '- second `quoted` entry',
    'Another line to remove'
  ].join('\n')

  expect(mdListArrayConverter(input)).toEqual([
    '- first entry',
    'second "quoted" entry'
  ])
})
