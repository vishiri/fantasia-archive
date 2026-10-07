import type { WebContents } from 'electron'

import { ResultAsync } from 'neverthrow'

const DWC_POLL_MS = 50
const DWC_ATTEMPTS = 16

function delayMs (ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

// DevTools frontend realm. This string cannot import 'neverthrow', so try stays inside the script.
const REVEAL_CONSOLE_SCRIPT = `Boolean((function () {
  try {
    if (typeof UI !== 'undefined' && UI.inspectorView && typeof UI.inspectorView.showPanel === 'function') {
      UI.inspectorView.showPanel('console')
      return true
    }
  } catch (e) {}
  try {
    if (typeof DevToolsAPI !== 'undefined' && typeof DevToolsAPI.showPanel === 'function') {
      DevToolsAPI.showPanel('console')
      return true
    }
  } catch (e) {}
  return false
})())`

/**
 * Chromium opens docked DevTools on Elements by default. This helper runs inside the DevTools
 * webContents and asks the embedded frontend to show the Console panel when those globals exist.
 * Returns false when DevTools is not ready yet or the internal API changed in a future Chromium.
 */
export async function revealElectronDevToolsConsoleBestEffort (wc: WebContents): Promise<boolean> {
  for (let attempt = 0; attempt < DWC_ATTEMPTS; attempt += 1) {
    const dwc = wc.devToolsWebContents
    if (dwc === null || dwc === undefined) {
      await delayMs(DWC_POLL_MS)
      continue
    }
    const revealed = await ResultAsync.fromPromise(
      dwc.executeJavaScript(REVEAL_CONSOLE_SCRIPT),
      () => false
    )
    if (revealed.isOk() && revealed.value === true) {
      return true
    }
    await delayMs(DWC_POLL_MS)
  }
  return false
}
