export function createRunFaProjectOsOpenBoot (deps: {
  getMode: () => string | undefined
  nowMs: () => number
  sleepMs: (ms: number) => Promise<void>
  hasProjectOsOpenBridge: () => boolean
  installOsOpenListener: (onOsOpen: (filePath: string) => void) => void
  sendRendererReady: () => void
  runFaActionAwait: (
    id: 'loadExistingProject',
    payload: { filePath: string }
  ) => Promise<boolean>
  waitFaProjectOsOpenBridgeOrTimeout: (args: {
    hasProjectOsOpenBridge: () => boolean
    nowMs: () => number
    sleepMs: (ms: number) => Promise<void>
  }) => Promise<void>
}): () => Promise<void> {
  return async function runFaProjectOsOpenBoot (): Promise<void> {
    if (deps.getMode() !== 'electron') {
      return
    }

    await deps.waitFaProjectOsOpenBridgeOrTimeout({
      hasProjectOsOpenBridge: deps.hasProjectOsOpenBridge,
      nowMs: deps.nowMs,
      sleepMs: deps.sleepMs
    })

    if (!deps.hasProjectOsOpenBridge()) {
      return
    }

    const onOsOpen = (filePath: string): void => {
      void deps.runFaActionAwait('loadExistingProject', { filePath })
    }

    deps.installOsOpenListener(onOsOpen)
    deps.sendRendererReady()
  }
}
