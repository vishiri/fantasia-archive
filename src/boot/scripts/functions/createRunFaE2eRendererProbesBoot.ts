export function createRunFaE2eRendererProbesBoot (deps: {
  getMode: () => string | undefined
  getCachedTestEnv: () => string | undefined
  registerFaE2eActiveProjectSnapshotProbe: () => void
}): () => Promise<void> {
  return async function runFaE2eRendererProbesBoot (): Promise<void> {
    if (deps.getMode() !== 'electron') {
      return
    }

    if (deps.getCachedTestEnv() !== 'e2e') {
      return
    }

    deps.registerFaE2eActiveProjectSnapshotProbe()
  }
}
