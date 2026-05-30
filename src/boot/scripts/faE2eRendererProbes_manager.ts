import { registerFaE2eActiveProjectSnapshotProbe } from 'app/src/scripts/e2e/e2e_manager'

import { createRunFaE2eRendererProbesBoot } from './functions/createRunFaE2eRendererProbesBoot'

export const runFaE2eRendererProbesBoot = createRunFaE2eRendererProbesBoot({
  getCachedTestEnv: () => {
    const testEnv = window.faContentBridgeAPIs?.extraEnvVariables?.getCachedSnapshot?.()?.TEST_ENV

    return typeof testEnv === 'string' ? testEnv : undefined
  },
  getMode: () => process.env.MODE,
  registerFaE2eActiveProjectSnapshotProbe
})
