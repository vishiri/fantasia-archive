import { defineBoot } from '#q-app/wrappers'

import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'

/**
 * Lets main ask the renderer for the active .faproject path when the SQLite handle dropped but Pinia still holds the session.
 */
export default defineBoot(() => {
  if (process.env.MODE !== 'electron') {
    return
  }
  const failsafe = window.faContentBridgeAPIs?.faProjectFailsafe
  failsafe?.installActiveProjectPathReply(() => {
    return S_FaActiveProject().activeProject?.filePath ?? null
  })
})
