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
