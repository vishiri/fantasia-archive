import { expect, test } from 'vitest'

import { mdListArrayConverter } from 'app/src/scripts/_utilities/functions/mdListArrayConverter'

import { pickRandomTipsTricksTriviaCaption } from '../functions/pickRandomTipsTricksTriviaCaption'

/**
 * pickRandomTipsTricksTriviaCaption
 * Returns an empty string when the markdown list has no bullet items.
 */
test('Test that pickRandomTipsTricksTriviaCaption returns empty for an empty tip list', () => {
  const caption = pickRandomTipsTricksTriviaCaption({
    mdListArrayConverter,
    randomIndex: () => 0,
    tipsTricksTriviaMarkdown: '# Title only\n\nNo bullets here.'
  })

  expect(caption).toBe('')
})

/**
 * pickRandomTipsTricksTriviaCaption
 * Returns one of the parsed bullet strings.
 */
test('Test that pickRandomTipsTricksTriviaCaption returns a bullet from the markdown list', () => {
  const markdown = [
    '# Tips',
    '- First tip.',
    '- Second tip.'
  ].join('\n')

  const caption = pickRandomTipsTricksTriviaCaption({
    mdListArrayConverter,
    randomIndex: () => 1,
    tipsTricksTriviaMarkdown: markdown
  })

  expect(caption).toBe('Second tip.')
})

/**
 * pickRandomTipsTricksTriviaCaption
 * Returns an empty string when the random index does not resolve to a bullet.
 */
test('Test that pickRandomTipsTricksTriviaCaption returns empty for an out-of-range index', () => {
  const caption = pickRandomTipsTricksTriviaCaption({
    mdListArrayConverter: () => ['First tip.'],
    randomIndex: () => 2,
    tipsTricksTriviaMarkdown: '- First tip.'
  })

  expect(caption).toBe('')
})
