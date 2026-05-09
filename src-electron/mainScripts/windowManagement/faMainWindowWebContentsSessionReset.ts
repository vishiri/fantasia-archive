import type { WebContents } from 'electron'

import { closeFaProjectActiveDatabase } from 'app/src-electron/mainScripts/projectManagement/faProjectActiveDatabase'

/**
 * Full renderer reloads (DevTools refresh, Control+F5, locale spellcheck reload) reset Pinia but the main
 * process can still hold the active SQLite handle. After the first successful load, any new load clears
 * that handle so open flows match the fresh renderer baseline (no project session).
 */
export function registerFaMainWindowWebContentsSessionReset (wc: WebContents): void {
  let finishedInitialLoad = false

  wc.once('did-finish-load', () => {
    finishedInitialLoad = true
  })

  wc.on('did-start-loading', () => {
    if (!finishedInitialLoad) {
      return
    }
    closeFaProjectActiveDatabase()
  })
}
