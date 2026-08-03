import type { WebContents } from 'electron'

import { createAssertMainWindowSender } from 'app/src-electron/mainScripts/windowManagement/functions/assertMainWindowSender'
import { appWindow } from 'app/src-electron/mainScripts/windowManagement/windowManagement_manager'

const assertMainWindowSenderApi = createAssertMainWindowSender({
  getMainWebContentsId: () => {
    if (appWindow === undefined || appWindow.isDestroyed()) {
      return null
    }
    const wc = appWindow.webContents
    if (wc.isDestroyed()) {
      return null
    }
    return wc.id
  }
})

/**
 * True when 'sender' is the main BrowserWindow webContents (privileged IPC gate).
 */
export function assertMainWindowSender (sender: WebContents): boolean {
  return assertMainWindowSenderApi.assertMainWindowSender(sender)
}
