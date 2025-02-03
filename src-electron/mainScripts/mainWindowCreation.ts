import { BrowserWindow, app, screen } from 'electron'
import { enable } from '@electron/remote/main'
import path from 'path'

// Prevents app from launching a secondary instance
const preventSecondaryAppInstance = (appWindow: BrowserWindow | undefined) => {
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

/**
  * Creates the main app window
  */
export const mainWindowCreation = () => {
  // Retrieve actual display size to stop flicker/debounce that happens with "maximize" function at first
  const displaySizes = screen.getPrimaryDisplay().workAreaSize

  // Initial window options
  let appWindow: BrowserWindow | undefined = new BrowserWindow({
    width: displaySizes.width,
    height: displaySizes.height,
    useContentSize: true,
    frame: false,
    show: false,
    center: true,
    icon: path.resolve(__dirname, '../icons/icon.png'),
    webPreferences: {
      sandbox: false,
      contextIsolation: true,
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD)
    }
  })

  // Enable actual webContents inside the created window
  enable(appWindow.webContents)

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

  // Load the basic app URL
  appWindow.loadURL(process.env.APP_URL)

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
}
