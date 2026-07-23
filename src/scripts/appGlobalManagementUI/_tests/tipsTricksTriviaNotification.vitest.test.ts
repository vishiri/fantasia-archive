import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const {
  notifyCreateMock,
  tMock,
  mdListArrayConverterMock,
  determineCurrentImageMock
} = vi.hoisted(() => {
  return {
    notifyCreateMock: vi.fn(),
    tMock: vi.fn((value: string) => value),
    mdListArrayConverterMock: vi.fn(() => ['Tip one', 'Tip two']),
    determineCurrentImageMock: vi.fn(() => 'image://mascot')
  }
})

vi.mock('quasar', () => {
  return {
    Notify: {
      create: notifyCreateMock
    }
  }
})

vi.mock('app/i18n/externalFileLoader', () => {
  return {
    i18n: {
      global: {
        t: tMock
      }
    }
  }
})

vi.mock('../../_utilities/functions/mdListArrayConverter', () => {
  return {
    mdListArrayConverter: mdListArrayConverterMock
  }
})

vi.mock('../functions/fantasiaMascotImageManagement', () => {
  return {
    fantasiaImageList: { didYouKnow: 'image://did-you-know' },
    determineCurrentImage: determineCurrentImageMock
  }
})

import { tipsTricksTriviaNotification } from '../tipsTricksTriviaNotification_manager'

beforeEach(() => {
  notifyCreateMock.mockClear()
  mdListArrayConverterMock.mockImplementation(() => ['Tip one', 'Tip two'])
})

afterEach(() => {
  vi.restoreAllMocks()
})

/**
 * tipsTricksTriviaNotification
 * Test payload when mascot is shown.
 */
test('Test that tipsTricksTriviaNotification uses mascot avatar payload by default', () => {
  vi.spyOn(Math, 'random').mockReturnValueOnce(0)
  tipsTricksTriviaNotification(false)

  expect(notifyCreateMock).toHaveBeenCalledOnce()
  expect(notifyCreateMock.mock.calls[0]![0]!).toMatchObject({
    avatar: 'image://mascot',
    caption: 'Tip one'
  })
  expect(notifyCreateMock.mock.calls[0]![0]!).not.toHaveProperty('icon')
})

/**
 * tipsTricksTriviaNotification
 * Test payload when mascot is hidden: no avatar and no replacement icon.
 */
test('Test that tipsTricksTriviaNotification omits avatar when mascot is hidden', () => {
  vi.spyOn(Math, 'random').mockReturnValueOnce(0.75)
  tipsTricksTriviaNotification(true)

  expect(notifyCreateMock).toHaveBeenCalledOnce()
  expect(notifyCreateMock.mock.calls[0]![0]!).toMatchObject({
    caption: 'Tip two'
  })
  expect(notifyCreateMock.mock.calls[0]![0]!).not.toHaveProperty('avatar')
  expect(notifyCreateMock.mock.calls[0]![0]!).not.toHaveProperty('icon')
})

/**
 * tipsTricksTriviaNotification
 * When the markdown list is empty the notify still runs with an empty caption.
 */
test('Test that tipsTricksTriviaNotification invokes Notify when the tip list is empty', () => {
  mdListArrayConverterMock.mockReturnValueOnce([])
  vi.spyOn(Math, 'random').mockReturnValueOnce(0)
  tipsTricksTriviaNotification(false)

  expect(notifyCreateMock).toHaveBeenCalledOnce()
  expect(notifyCreateMock.mock.calls[0]![0]!).toMatchObject({
    caption: ''
  })
})
