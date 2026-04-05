import { tipsTricksTriviaNotification } from './tipsTricksTriviaNotification'
import type { I_appStartupRouter } from './appStartupRouting.types'

/**
 * Determines if component testing route should be used.
 */
export const determineTestingComponentName = (
  testingType: string | false | undefined,
  testingComponentName: string | false | undefined
): string | false => {
  return (testingType === 'components' && Boolean(testingComponentName))
    ? testingComponentName as string
    : false
}

/**
 * Handles startup routing and tip notification side effects.
 */
export const runAppStartupRouting = (
  router: I_appStartupRouter,
  testingType: string | false | undefined,
  testingComponentName: string | false | undefined
): void => {
  const componentNameOrFalse = determineTestingComponentName(testingType, testingComponentName)

  if (componentNameOrFalse) {
    router.push({ path: `/componentTesting/${componentNameOrFalse}` })
    return
  }

  router.push({ path: '/' })
  tipsTricksTriviaNotification(false)
}
