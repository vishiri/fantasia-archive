import { defineBoot } from '#q-app/wrappers'

import { runAppStartupRouting } from 'app/src/scripts/appInfo/appStartupRouting'
import type { I_extraEnvVariablesAPI } from 'app/types/I_extraEnvVariablesAPI'

/**
 * Loads harness env from the Electron preload bridge before initial navigation, then runs startup routing.
 */
export default defineBoot(async ({ router }) => {
  const bridge = window.faContentBridgeAPIs?.extraEnvVariables
  let extra: I_extraEnvVariablesAPI | undefined

  try {
    if (typeof bridge?.getSnapshot === 'function') {
      extra = await bridge.getSnapshot()
    }
  } catch {
    extra = undefined
  }

  const testingType = extra?.TEST_ENV ?? ''
  const testingComponentName = extra?.COMPONENT_NAME ?? ''

  const normalizedTestingType = testingType || undefined
  const normalizedTestingComponentName = testingComponentName || undefined

  await runAppStartupRouting(router, normalizedTestingType, normalizedTestingComponentName)
})
