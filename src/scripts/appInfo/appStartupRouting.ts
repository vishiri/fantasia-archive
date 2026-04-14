import { tipsTricksTriviaNotification } from './tipsTricksTriviaNotification'
import type { I_appStartupRouter } from 'app/types/I_appStartupRouter'

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
export const runAppStartupRouting = async (
  router: I_appStartupRouter,
  testingType: string | false | undefined,
  testingComponentName: string | false | undefined
): Promise<void> => {
  const componentNameOrFalse = determineTestingComponentName(testingType, testingComponentName)

  if (componentNameOrFalse) {
    await router.push({ path: `/componentTesting/${componentNameOrFalse}` })
    return
  }

  await router.push({ path: '/' })
  tipsTricksTriviaNotification(false)
}
