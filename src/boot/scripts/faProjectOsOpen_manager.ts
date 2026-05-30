import { runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun_manager'

import { createRunFaProjectOsOpenBoot } from './functions/createRunFaProjectOsOpenBoot'
import { waitFaProjectOsOpenBridgeOrTimeout } from './functions/faProjectOsOpenBridgePoll'

export const runFaProjectOsOpenBoot = createRunFaProjectOsOpenBoot({
  getMode: () => process.env.MODE,
  hasProjectOsOpenBridge: () => {
    const peek = window.faContentBridgeAPIs?.faProjectOsOpen

    return (
      typeof peek?.installOsOpenListener === 'function' &&
      typeof peek?.sendRendererReady === 'function'
    )
  },
  installOsOpenListener: (onOsOpen) => {
    window.faContentBridgeAPIs?.faProjectOsOpen?.installOsOpenListener(onOsOpen)
  },
  nowMs: () => Date.now(),
  runFaActionAwait,
  sendRendererReady: () => {
    window.faContentBridgeAPIs?.faProjectOsOpen?.sendRendererReady()
  },
  sleepMs: (ms) => new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms)
  }),
  waitFaProjectOsOpenBridgeOrTimeout
})
