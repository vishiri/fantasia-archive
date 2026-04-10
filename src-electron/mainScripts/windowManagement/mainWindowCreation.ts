import { BrowserWindow, app, screen } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { setupSpellChecker } from 'app/src-electron/mainScripts/windowManagement/spellChecker'

export let appWindow: BrowserWindow | undefined

/**
 * Assigns the module-level main window reference (Vitest only; production startup uses mainWindowCreation).
 */
export function assignAppWindowRefForTesting (next: BrowserWindow | undefined): void {
  appWindow = next
}

/**
 * Directory of the compiled main-process bundle file (or this module's output folder).
 * Do not walk up an extra level for preload/icon paths: after bundling, 'import.meta.url'
 * points at the shared electron main chunk (e.g. dist/electron/electron-main.js), not at
 * the original 'windowManagement/' source folder — an extra '..' would miss 'electron-preload'
 * and break 'contextBridge' ('window.faContentBridgeAPIs'), so component tests stay on '/'.
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
  const folder = process.env.QUASAR_ELECTRON_PRELOAD_FOLDER ?? '..'
  const ext = process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION ?? '.js'
  return path.resolve(
    currentDir,
    path.join(folder, `electron-preload${ext}`)
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
      sandbox: true
    }
  })

  // Show the windows once electron is ready to show the actual HTML content
  appWindow.once('ready-to-show', () => {
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
  appWindow.setMenu(null)

  // Load the basic app URL (dev server) or packaged index.html
  if (process.env.DEV) {
    const devUrl = process.env.APP_URL
    if (devUrl === undefined) {
      throw new Error('APP_URL must be set when DEV is set')
    }
    await appWindow.loadURL(devUrl)
  } else {
    await appWindow.loadFile('index.html')
  }

  // Open DevTools by default if the app is running in Dev mode or Production with debug enabled
  if (process.env.DEBUGGING) {
    appWindow.webContents.openDevTools()
  }

  // Make sure the app window properly closes when it is closed in any way, shape or form
  appWindow.on('closed', () => {
    appWindow = undefined
  })

  // Check if we are on the primary or secondary instance of the app
  preventSecondaryAppInstance(appWindow)

  // Hook up spellchecker
  setupSpellChecker(appWindow)
}
