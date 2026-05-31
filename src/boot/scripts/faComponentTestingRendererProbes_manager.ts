import { registerFaComponentTestingStoreSeedProbe } from 'app/src/scripts/componentTesting/componentTesting_manager'

import { createRunFaComponentTestingRendererProbesBoot } from './functions/createRunFaComponentTestingRendererProbesBoot'

export const runFaComponentTestingRendererProbesBoot = createRunFaComponentTestingRendererProbesBoot({
  getCachedTestEnv: () => {
    const testEnv = window.faContentBridgeAPIs?.extraEnvVariables?.getCachedSnapshot?.()?.TEST_ENV

    return typeof testEnv === 'string' ? testEnv : undefined
  },
  getMode: () => process.env.MODE,
  registerFaComponentTestingStoreSeedProbe
})
