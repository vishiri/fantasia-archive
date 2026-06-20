import { registerFaE2eActiveProjectSnapshotProbe } from 'app/src/scripts/e2e/e2e_manager'

import {
  createRunFaE2eRendererProbesBoot,
  resolveFaRendererProbeTestEnvFromBridge
} from './functions/createRunFaE2eRendererProbesBoot'

export const runFaE2eRendererProbesBoot = createRunFaE2eRendererProbesBoot({
  getMode: () => process.env.MODE,
  registerFaE2eActiveProjectSnapshotProbe,
  resolveTestEnv: async () => {
    return await resolveFaRendererProbeTestEnvFromBridge(
      window.faContentBridgeAPIs?.extraEnvVariables
    )
  }
})
