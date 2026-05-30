import { ResultAsync } from 'neverthrow'

import {
  registerFaAppRouterSession,
  runAppStartupRouting
} from 'app/src/scripts/appInternals/appInternals_manager'

import { createRunFaRoutingEnvBoot } from './functions/createRunFaRoutingEnvBoot'
import { waitForPreloadExtraEnvBridgeWhenElectron } from './functions/faRoutingEnvBridgePoll'

export const runFaRoutingEnvBoot = createRunFaRoutingEnvBoot({
  getExtraEnvSnapshot: async () => {
    const bridge = window.faContentBridgeAPIs?.extraEnvVariables

    if (bridge?.getSnapshot === undefined) {
      return undefined
    }

    return await ResultAsync.fromPromise(
      bridge.getSnapshot(),
      (): undefined => undefined
    ).unwrapOr(undefined)
  },
  getMode: () => process.env.MODE,
  hasExtraEnvSnapshot: () => {
    return window.faContentBridgeAPIs?.extraEnvVariables?.getSnapshot !== undefined
  },
  nowMs: () => Date.now(),
  registerFaAppRouterSession,
  runAppStartupRouting,
  sleepMs: (ms) => new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms)
  }),
  waitForPreloadExtraEnvBridgeWhenElectron
})
