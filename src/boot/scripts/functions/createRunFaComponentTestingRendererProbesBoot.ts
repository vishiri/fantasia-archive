export function createRunFaComponentTestingRendererProbesBoot (deps: {
  getMode: () => string | undefined
  getCachedTestEnv: () => string | undefined
  registerFaComponentTestingStoreSeedProbe: () => void
}): () => Promise<void> {
  return async function runFaComponentTestingRendererProbesBoot (): Promise<void> {
    if (deps.getMode() !== 'electron') {
      return
    }

    if (deps.getCachedTestEnv() !== 'components') {
      return
    }

    deps.registerFaComponentTestingStoreSeedProbe()
  }
}
