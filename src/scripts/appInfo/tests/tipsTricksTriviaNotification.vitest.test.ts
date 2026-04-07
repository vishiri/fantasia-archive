import { expect, test, vi } from 'vitest'

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

vi.mock('../../_utilities/mdListArrayConverter', () => {
  return {
    mdListArrayConverter: mdListArrayConverterMock
  }
})

vi.mock('../fantasiaMascotImageManager', () => {
  return {
    fantasiaImageList: { didYouKnow: 'image://did-you-know' },
    determineCurrentImage: determineCurrentImageMock
  }
})

import { tipsTricksTriviaNotification } from '../tipsTricksTriviaNotification'

/**
 * tipsTricksTriviaNotification
 * Test payload when mascot is shown.
 */
test('Test that tipsTricksTriviaNotification uses mascot avatar payload by default', () => {
  vi.spyOn(Math, 'random').mockReturnValueOnce(0)
  tipsTricksTriviaNotification(false)

  expect(notifyCreateMock).toHaveBeenCalledOnce()
  expect(notifyCreateMock.mock.calls[0][0]).toMatchObject({
    icon: undefined,
    avatar: 'image://mascot',
    caption: 'Tip one'
  })
})

/**
 * tipsTricksTriviaNotification
 * Test payload when mascot is hidden.
 */
test('Test that tipsTricksTriviaNotification uses icon payload when mascot is hidden', () => {
  vi.spyOn(Math, 'random').mockReturnValueOnce(0.75)
  tipsTricksTriviaNotification(true)

  expect(notifyCreateMock.mock.calls[1][0]).toMatchObject({
    icon: 'mdi-help',
    avatar: undefined,
    caption: 'Tip two'
  })
})
