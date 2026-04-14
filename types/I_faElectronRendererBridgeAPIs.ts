/**
 * Read-only app metadata exposed from the main process through preload.
 */
export interface I_appDetailsAPI {

  /**
   * Version of the project as stated in package.json (from main process).
   */
  getProjectVersion: () => Promise<string>

}

/**
 * Validates and opens external URLs in the system browser.
 */
export interface I_faExternalLinksManagerAPI {

  /**
   * Check the type of link input
   * true - Is external
   * false - is not external
   */
  checkIfExternal: (url: string) => boolean

  /**
   * Open external link in the default browser of the user
   */
  openExternal: (url: string) => void

}

/**
 * Controls Chromium DevTools for the current BrowserWindow.
 */
export interface I_faDevToolsControl {

  /**
   * Check the current state of the DevTools in the opened FA instance
   */
  checkDevToolsStatus: () => Promise<boolean>

  /**
   * Toggles the dev tools
   * - If they are opened, close them
   * - If they are closed, open them
   */
  toggleDevTools: () => Promise<void>

  /**
   * Opens the dev tools
   */
  openDevTools: () => Promise<void>

  /**
   * Closes the dev tools
   */
  closeDevTools: () => Promise<void>

}

/**
 * Window chrome actions for the main BrowserWindow.
 */
export interface I_faWindowControlAPI {

  /**
   * Check the current visual sizing of the current window
   */
  checkWindowMaximized: () => Promise<boolean>

  /**
   * Minimizes the current window
   */
  minimizeWindow: () => Promise<void>

  /**
   * Maximizes the current window
   */
  maximizeWindow: () => Promise<void>

  /**
   * Resizes the current window.
   * - If the window is maximized, restores it
   * - If the window is restored, maximizes it
   */
  resizeWindow: () => Promise<void>

  /**
   * Closes the current window
   */
  closeWindow: () => Promise<void>

  /**
   * Reloads this window's renderer (same as 'webContents.reload' in main).
   */
  refreshWebContents: () => Promise<void>

}

/**
 * Snapshot of harness and packaging paths injected for tests and diagnostics.
 */
export interface I_extraEnvVariablesAPI {

  /**
   * Full path to "electron-main.js" file in the dist, unpackaged form
   */
  ELECTRON_MAIN_FILEPATH: string

  /**
   * Extra render timer buffer for tests to start after loading the app.
   * - Increase if your machine isn't keeping up with the render times and tests are randomly failing.
   * - Lower if your machine is quick and the tests are waiting for no reason at all.
   * - Can be set manually for each component/e2e test inside the test file.
   */
  FA_FRONTEND_RENDER_TIMER: number

  /**
   * Type of test environment to load.
   * - 'components'
   * - 'e2e'
   */
  TEST_ENV?: string | false

  /**
   * Name of the component being tested.
   * - MUST match the file name of the vue file being tested (including the capital letter at the start).
   */
  COMPONENT_NAME?: string | false

  /**
   * Component props, assuming they have any (parsed JSON from COMPONENT_PROPS env in main).
   */
  COMPONENT_PROPS?: Record<string, unknown> | false

}

/**
 * Preload bridge: async snapshot of harness env (memoized in preload implementation).
 */
export interface I_extraEnvVariablesBridge {
  /**
   * Last resolved snapshot from getSnapshot, or null before the first successful resolve.
   * Lets renderer read harness env synchronously after boot awaited getSnapshot once.
   */
  getCachedSnapshot: () => I_extraEnvVariablesAPI | null
  getSnapshot: () => Promise<I_extraEnvVariablesAPI>
}
