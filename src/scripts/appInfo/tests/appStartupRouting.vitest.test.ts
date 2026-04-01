import { expect, test, vi } from 'vitest'

const { tipsTricksTriviaNotificationMock } = vi.hoisted(() => {
  return {
    tipsTricksTriviaNotificationMock: vi.fn()
  }
})

vi.mock('../tipsTricksTriviaNotification', () => {
  return {
    tipsTricksTriviaNotification: tipsTricksTriviaNotificationMock
  }
})

import { determineTestingComponentName, runAppStartupRouting } from '../appStartupRouting'

/**
 * determineTestingComponentName
 * Test when component testing env values are valid.
 */
test('Test that determineTestingComponentName returns component name for component test environment', () => {
  const result = determineTestingComponentName('components', 'DialogAboutFantasiaArchive')

  expect(result).toBe('DialogAboutFantasiaArchive')
})

/**
 * determineTestingComponentName
 * Test when component testing env values are not valid.
 */
test('Test that determineTestingComponentName returns false outside component test environment', () => {
  const result = determineTestingComponentName('e2e', 'DialogAboutFantasiaArchive')

  expect(result).toBe(false)
})

/**
 * runAppStartupRouting
 * Test routing toward component testing path.
 */
test('Test that runAppStartupRouting pushes component testing route when requested', () => {
  const routerPushMock = vi.fn()

  runAppStartupRouting(
    { push: routerPushMock },
    'components',
    'FantasiaMascotImage'
  )

  expect(routerPushMock).toHaveBeenCalledWith({ path: '/componentTesting/FantasiaMascotImage' })
  expect(tipsTricksTriviaNotificationMock).not.toHaveBeenCalled()
})

/**
 * runAppStartupRouting
 * Test default route and tip side effect.
 */
test('Test that runAppStartupRouting defaults to home route and triggers trivia tip', () => {
  const routerPushMock = vi.fn()

  runAppStartupRouting(
    { push: routerPushMock },
    undefined,
    undefined
  )

  expect(routerPushMock).toHaveBeenCalledWith({ path: '/' })
  expect(tipsTricksTriviaNotificationMock).toHaveBeenCalledWith(false)
})
