import { expect, test } from 'vitest'
import { mdListArrayConvertor } from '../mdListArrayConvertor'

/**
 * mdListArrayConvertor
 * Test markdown bullet extraction and cleanup.
 */
test('Test that mdListArrayConvertor extracts only markdown list items', () => {
  const input = [
    'Intro text that should be removed',
    '- first entry',
    '- second `quoted` entry',
    'Another line to remove'
  ].join('\n')

  expect(mdListArrayConvertor(input)).toEqual([
    '- first entry',
    'second "quoted" entry'
  ])
})
