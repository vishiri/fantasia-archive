import { expect, test, vi } from 'vitest'

vi.mock('app/i18n/externalFileLoader', () => {
  return {
    i18n: {
      global: {
        t: (key: string) => key
      }
    }
  }
})

type T_pickRandomTipsTricksTriviaCaptionMock = (deps: {
  randomIndex: (length: number) => number
  tipsTricksTriviaMarkdown: string
}) => string

const pickRandomTipsTricksTriviaCaptionMock = vi.hoisted(() => {
  return vi.fn<T_pickRandomTipsTricksTriviaCaptionMock>(() => 'Picked tip caption.')
})

vi.mock('app/src/scripts/appGlobalManagementUI/functions/pickRandomTipsTricksTriviaCaption', () => {
  return {
    pickRandomTipsTricksTriviaCaption: pickRandomTipsTricksTriviaCaptionMock
  }
})

import { pickProjectOverviewRandomTipCaption } from '../projectOverviewPickRandomTipWiring'

/**
 * pickProjectOverviewRandomTipCaption
 * Delegates to the shared tips markdown picker with i18n document text.
 */
test('Test that pickProjectOverviewRandomTipCaption returns a caption from the shared picker', () => {
  const caption = pickProjectOverviewRandomTipCaption()

  expect(caption).toBe('Picked tip caption.')
  expect(pickRandomTipsTricksTriviaCaptionMock).toHaveBeenCalledOnce()
  expect(pickRandomTipsTricksTriviaCaptionMock).toHaveBeenCalledWith(
    expect.objectContaining({
      tipsTricksTriviaMarkdown: 'documents.tipsTricksTrivia'
    })
  )
})

/**
 * pickProjectOverviewRandomTipCaption
 * Exercises the wiring randomIndex callback passed into the shared picker.
 */
test('Test that pickProjectOverviewRandomTipCaption wires randomIndex into the shared picker', () => {
  pickRandomTipsTricksTriviaCaptionMock.mockImplementationOnce((deps: {
    randomIndex: (length: number) => number
  }) => {
    expect(deps.randomIndex(3)).toBe(1)

    return 'Indexed tip.'
  })

  vi.spyOn(Math, 'random').mockReturnValue(0.5)

  const caption = pickProjectOverviewRandomTipCaption()

  expect(caption).toBe('Indexed tip.')
})
