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

/**
 * mdListArrayConverter
 * Drops a trailing empty segment produced by a final newline before splitting.
 */
test('Test that mdListArrayConverter pops a trailing empty entry after split', () => {
  expect(mdListArrayConverter('- only line\n')).toEqual(['- only line'])
})

/**
 * mdListArrayConverter
 * Leaves the last segment in place when the final split token is not an empty string.
 */
test('Test that mdListArrayConverter keeps the sole line when there is no trailing newline', () => {
  expect(mdListArrayConverter('- solo')).toEqual(['- solo'])
})

/**
 * mdListArrayConverter
 * Prose lines that are not markdown '- ' list entries are removed, yielding an empty array when nothing qualifies.
 */
test('Test that mdListArrayConverter returns an empty array when no list lines exist', () => {
  expect(mdListArrayConverter('Intro only\nAnother line')).toEqual([])
})

/**
 * mdListArrayConverter
 * Asterisk-style markdown bullets are not treated as list items for this helper.
 */
test('Test that mdListArrayConverter drops asterisk bullet lines like other non-dash list lines', () => {
  expect(mdListArrayConverter('* not supported\n- kept')).toEqual(['- kept'])
})
