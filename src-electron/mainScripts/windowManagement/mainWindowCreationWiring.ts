import { BrowserWindow, app, screen } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { registerFaProjectOsOpenMainWindow } from 'app/src-electron/mainScripts/projectManagement/projectManagement_manager'
import { applyFaSpellCheckerLanguagesToSession } from 'app/src-electron/mainScripts/windowManagement/faSpellCheckerSessionWiring'
import { registerFaChromiumCtrlShiftShortcutSuppress } from 'app/src-electron/mainScripts/chromiumFixes/faChromiumCtrlShiftShortcutSuppressWiring'
import { registerFaMainWindowWebContentsSessionReset } from 'app/src-electron/mainScripts/windowManagement/faMainWindowWebContentsSessionResetWiring'
import { setupSpellChecker } from 'app/src-electron/mainScripts/windowManagement/spellCheckerWiring'
import { getFaUserSettings } from 'app/src-electron/mainScripts/userSettings/userSettings_manager'

export let appWindow: BrowserWindow | undefined

/**
 * Assigns the module-level main window reference (Vitest only; production startup uses mainWindowCreationWiring).
 */
export function assignAppWindowRefForTesting (next: BrowserWindow | undefined): void {
  appWindow = next
}

/**
 * Directory of the compiled main-process bundle file (or this module's output folder).
 * After bundling, 'import.meta.url' points at the shared electron main chunk, not at
 * the original 'windowManagement/' source folder. Keep the fallback preload path aligned
 * with Quasar's production output so Playwright can launch the un-packaged app directly.
 */
const currentDir = fileURLToPath(new URL('.', import.meta.url))

/**
 * Prevents app from launching a secondary instance
 */
export const preventSecondaryAppInstance = (appWindow: BrowserWindow | undefined) => {
  // Do not limit the window amount if we are in auto-test mode
  if (process.env.TEST_ENV && (process.env.TEST_ENV === 'components' || process.env.TEST_ENV === 'e2e')) {
    return
  }

  // Determines if the app is the primary instance
  // - This exists as a variable due to the app bugging out if used directly from "app" (Electron bug?)
  const isPrimaryInstance = app.requestSingleInstanceLock()

  // Check this is NOT the primary app instance
  if (!isPrimaryInstance) {
    app.quit()
  } else {
    // Maximize the primary app window and refocus it
    app.on('second-instance', () => {
      if (appWindow) {
        if (appWindow.isMinimized()) {
          appWindow.restore()
        }
        appWindow.focus()
      }
    })
  }
}

function resolvePreloadPath (): string {
  const folder = process.env.QUASAR_ELECTRON_PRELOAD_FOLDER ?? 'preload'
  const ext = process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION ?? '.cjs'
  return path.resolve(
    currentDir,
    path.join(folder, `electron-preload${ext}`)
  )
}

async function loadAndWireMainWindow (win: BrowserWindow): Promise<void> {
  // Show the windows once electron is ready to show the actual HTML content
  win.once('ready-to-show', () => {
    if (appWindow) {
      appWindow.show()
      appWindow.focus()
      appWindow.maximize()

      // In case the windows somehow didn't maximize at first, make sure it does; this is a fix for slower machines
      setTimeout(() => {
        if (appWindow) {
          appWindow.maximize()
        }
      }, 1000)
    }
  })

  // Set the current window's menu as empty
  win.setMenu(null)

  registerFaMainWindowWebContentsSessionReset(win.webContents)
  // Ctrl+Shift chord suppression registers app-wide globalShortcut handlers only while this window
  // is focused; the returned teardown releases them so a backgrounded app never blocks other apps.
  const disposeFaChromiumCtrlShiftSuppress = registerFaChromiumCtrlShiftShortcutSuppress(win)

  // Load the basic app URL (dev server) or packaged index.html via the privileged 'app://' scheme.
  // Using 'app://' instead of 'file://' for packaged builds keeps web workers (Monaco editor.worker / css.worker, etc.) on a standard, secure origin.
  if (process.env.DEV) {
    const devUrl = process.env.APP_URL
    if (devUrl === undefined) {
      throw new Error('APP_URL must be set when DEV is set')
    }
    await win.loadURL(devUrl)
  } else {
    await win.loadURL('app://./index.html')
  }

  // Open DevTools by default if the app is running in Dev mode or Production with debug enabled
  if (process.env.DEBUGGING) {
    win.webContents.openDevTools()
  }

  // Make sure the app window properly closes when it is closed in any way, shape or form
  win.on('closed', () => {
    disposeFaChromiumCtrlShiftSuppress()
    appWindow = undefined
  })

  // Check if we are on the primary or secondary instance of the app
  preventSecondaryAppInstance(win)

  // Hook up spellchecker
  setupSpellChecker(win)
  applyFaSpellCheckerLanguagesToSession(
    win.webContents.session,
    getFaUserSettings().store.languageCode
  )
}

/**
  * Creates the main app window
  */
export const mainWindowCreation = async () => {
  // Retrieve actual display size to stop flicker/debounce that happens with "maximize" function at first
  const displaySizes = screen.getPrimaryDisplay().workAreaSize

  // Initial window options
  appWindow = new BrowserWindow({
    width: displaySizes.width,
    height: displaySizes.height,
    useContentSize: true,
    frame: false,
    show: false,
    center: true,
    icon: path.resolve(currentDir, '../icons/icon.png'),
    /*
     * Chromium OS sandbox is on; privileged work stays in main. Preload uses only 'ipcRenderer' and
     * 'contextBridge' (see 'contentBridgeAPIs/'); paths and 'shell.openExternal' use IPC from
     * 'registerFaExtraEnvIpc' and 'registerFaExternalLinksIpc'. Per Electron, 'nodeIntegration: true'
     * would disable the sandbox for this window, so keep it false.
     */
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: resolvePreloadPath(),
      sandbox: true,
      spellcheck: true
    }
  })

  registerFaProjectOsOpenMainWindow(appWindow)

  await loadAndWireMainWindow(appWindow)
}
