import { defineBoot } from '#q-app/wrappers'

import { registerFaE2eActiveProjectSnapshotProbe } from 'app/src/scripts/e2e/registerFaE2eActiveProjectSnapshotProbe'

/**
 * When Electron E2E sets TEST_ENV to 'e2e', expose small read-only hooks so Playwright can assert
 * renderer Pinia state without scraping labels.
 */
export default defineBoot(async () => {
  if (process.env.MODE !== 'electron') {
    return
  }
  const snapshot = window.faContentBridgeAPIs?.extraEnvVariables?.getCachedSnapshot?.()
  if (snapshot?.TEST_ENV !== 'e2e') {
    return
  }
  registerFaE2eActiveProjectSnapshotProbe()
})
