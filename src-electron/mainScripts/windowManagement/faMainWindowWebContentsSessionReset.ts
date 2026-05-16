import type { WebContents } from 'electron'

import type { Event as ElectronTypedEvent } from 'electron'
import type { WebContentsDidStartNavigationEventParams } from 'electron'

import { closeFaProjectActiveDatabase } from 'app/src-electron/mainScripts/projectManagement/faProjectActiveDatabase'

/**
 * Full renderer reloads (DevTools refresh, Control+F5, locale spellcheck reload) reset Pinia but the main
 * process can still hold the active SQLite handle. After the first successful load, a **main-frame**
 * navigation that loads a **new document** clears that handle so open flows match the fresh renderer baseline.
 *
 * Using **did-start-navigation** (not **did-start-loading**) avoids closing SQLite on same-document churn
 * (hash / Vue Router / pushState) or subframe noise after the window idles.
 */
export function registerFaMainWindowWebContentsSessionReset (wc: WebContents): void {
  let finishedInitialLoad = false

  wc.once('did-finish-load', () => {
    finishedInitialLoad = true
  })

  wc.on(
    'did-start-navigation',
    (
      details: ElectronTypedEvent<WebContentsDidStartNavigationEventParams>
    ) => {
      if (!finishedInitialLoad) {
        return
      }
      if (!details.isMainFrame || details.isSameDocument) {
        return
      }
      closeFaProjectActiveDatabase()
    }
  )
}
