import { defineBoot } from '#q-app/wrappers'

import { runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun'

const FA_PROJECT_OS_OPEN_BRIDGE_POLL_MS = 50
const FA_PROJECT_OS_OPEN_BRIDGE_WAIT_CAP_MS = 3_000

/**
 * Mirrors 'faRoutingEnv.ts' preload timing notes: exposeInMainWorld may trail the earliest boot ticks.
 */
async function waitFaProjectOsOpenBridgeOrTimeout (): Promise<void> {
  const deadlineMs = Date.now() + FA_PROJECT_OS_OPEN_BRIDGE_WAIT_CAP_MS

  while (Date.now() < deadlineMs) {
    const peek = window.faContentBridgeAPIs?.faProjectOsOpen
    if (
      typeof peek?.installOsOpenListener === 'function' &&
      typeof peek?.sendRendererReady === 'function'
    ) {
      return
    }
    await new Promise((resolve) => {
      globalThis.setTimeout(resolve, FA_PROJECT_OS_OPEN_BRIDGE_POLL_MS)
    })
  }
}

export default defineBoot(async () => {
  if (process.env.MODE !== 'electron') {
    return
  }
  await waitFaProjectOsOpenBridgeOrTimeout()

  const api = window.faContentBridgeAPIs?.faProjectOsOpen
  if (
    typeof api?.installOsOpenListener !== 'function' ||
    typeof api?.sendRendererReady !== 'function'
  ) {
    return
  }

  const onOsOpen = (filePath: string): void => {
    void runFaActionAwait('loadExistingProject', { filePath })
  }
  api.installOsOpenListener(onOsOpen)
  api.sendRendererReady()
})
