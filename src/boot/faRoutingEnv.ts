import { defineBoot } from '#q-app/wrappers'
import { ResultAsync } from 'neverthrow'

import { runAppStartupRouting } from 'app/src/scripts/appInternals/rendererAppInternals'
import type { I_extraEnvVariablesAPI } from 'app/types/I_faElectronRendererBridgeAPIs'

/**
 * Preload can expose 'contextBridge.exposeInMainWorld' slightly after the Vue app boots.
 * Missing the first read sends component Playwright runs to '/' instead of '/componentTesting/...'.
 */
const FA_EXTRA_ENV_BRIDGE_POLL_MS = 50
const FA_EXTRA_ENV_BRIDGE_WAIT_CAP_MS = 3_000

async function waitForPreloadExtraEnvBridgeWhenElectron (): Promise<void> {
  if (process.env.MODE !== 'electron') {
    return
  }

  const deadlineMs = Date.now() + FA_EXTRA_ENV_BRIDGE_WAIT_CAP_MS

  while (
    window.faContentBridgeAPIs?.extraEnvVariables?.getSnapshot === undefined &&
    Date.now() < deadlineMs
  ) {
    await new Promise((resolve) => {
      globalThis.setTimeout(resolve, FA_EXTRA_ENV_BRIDGE_POLL_MS)
    })
  }
}

/**
 * Loads harness env from the Electron preload bridge before initial navigation, then runs startup routing.
 */
export default defineBoot(async ({ router }) => {
  await waitForPreloadExtraEnvBridgeWhenElectron()

  const bridge = window.faContentBridgeAPIs?.extraEnvVariables
  let extra: I_extraEnvVariablesAPI | undefined

  if (bridge?.getSnapshot !== undefined) {
    extra = await ResultAsync.fromPromise(
      bridge.getSnapshot(),
      (): undefined => undefined
    ).unwrapOr(undefined)
  } else {
    extra = undefined
  }

  const testingType = extra?.TEST_ENV ?? ''
  const testingComponentName = extra?.COMPONENT_NAME ?? ''

  const normalizedTestingType = testingType || undefined
  const normalizedTestingComponentName = testingComponentName || undefined

  await runAppStartupRouting(
    router,
    normalizedTestingType,
    normalizedTestingComponentName
  )
})
