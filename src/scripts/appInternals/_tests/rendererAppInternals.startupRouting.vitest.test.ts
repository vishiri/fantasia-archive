import { expect, test, vi } from 'vitest'

const { tipsTricksTriviaNotificationMock } = vi.hoisted(() => {
  return {
    tipsTricksTriviaNotificationMock: vi.fn()
  }
})

vi.mock('app/src/scripts/appGlobalManagementUI/tipsTricksTriviaNotification', () => {
  return {
    tipsTricksTriviaNotification: tipsTricksTriviaNotificationMock
  }
})

import { determineTestingComponentName, runAppStartupRouting } from '../rendererAppInternals'

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
 * determineTestingComponentName
 * Component test mode still requires a non-empty component name string.
 */
test('Test that determineTestingComponentName returns false when component name is empty in component mode', () => {
  expect(determineTestingComponentName('components', '')).toBe(false)
})

/**
 * determineTestingComponentName
 * A component name without the component test environment does not enable the testing route.
 */
test('Test that determineTestingComponentName returns false when testing type is undefined', () => {
  expect(determineTestingComponentName(undefined, 'DialogAboutFantasiaArchive')).toBe(false)
})

/**
 * runAppStartupRouting
 * Test routing toward component testing path.
 */
test('Test that runAppStartupRouting pushes component testing route when requested', async () => {
  const routerPushMock = vi.fn()

  await runAppStartupRouting(
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
test('Test that runAppStartupRouting defaults to home route and triggers trivia tip', async () => {
  const routerPushMock = vi.fn()

  await runAppStartupRouting(
    { push: routerPushMock },
    undefined,
    undefined
  )

  expect(routerPushMock).toHaveBeenCalledWith({ path: '/' })
  expect(tipsTricksTriviaNotificationMock).toHaveBeenCalledWith(false)
})

/**
 * runAppStartupRouting
 * Component mode with a missing component name falls through to the home route and trivia notification.
 */
test('Test that runAppStartupRouting uses home route when component mode has no component name', async () => {
  const routerPushMock = vi.fn()

  await runAppStartupRouting(
    { push: routerPushMock },
    'components',
    ''
  )

  expect(routerPushMock).toHaveBeenCalledWith({ path: '/' })
  expect(tipsTricksTriviaNotificationMock).toHaveBeenCalledWith(false)
})
