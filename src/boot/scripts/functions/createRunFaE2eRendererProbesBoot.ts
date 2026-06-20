import type { I_extraEnvVariablesAPI } from 'app/types/I_faElectronRendererBridgeAPIs'

export function createRunFaE2eRendererProbesBoot (deps: {
  getMode: () => string | undefined
  resolveTestEnv: () => Promise<string | undefined>
  registerFaE2eActiveProjectSnapshotProbe: () => void
}): () => Promise<void> {
  return async function runFaE2eRendererProbesBoot (): Promise<void> {
    if (deps.getMode() !== 'electron') {
      return
    }

    const testEnv = await deps.resolveTestEnv()
    if (testEnv !== 'e2e') {
      return
    }

    deps.registerFaE2eActiveProjectSnapshotProbe()
  }
}

export async function resolveFaRendererProbeTestEnvFromBridge (bridge: {
  getCachedSnapshot?: () => I_extraEnvVariablesAPI | null
  getSnapshot?: () => Promise<I_extraEnvVariablesAPI>
} | undefined): Promise<string | undefined> {
  if (bridge?.getSnapshot === undefined) {
    return undefined
  }

  const cached = bridge.getCachedSnapshot?.()
  const snapshot = cached ?? await bridge.getSnapshot()
  const testEnv = snapshot?.TEST_ENV

  return typeof testEnv === 'string' ? testEnv : undefined
}
