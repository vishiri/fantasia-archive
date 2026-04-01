export interface I_faWindowControlAPI {

  /**
   * Check the current visual sizing of the current window
   */
  checkWindowMaximized: () => boolean

  /**
   * Minimizes the current window
   */
  minimizeWindow: () => void

  /**
   * Maximizes the current window
   */
  maximizeWindow: () => void

  /**
   * Resizes the current window.
   * - If the window is maximized, restores it
   * - If the window is restored, maximizes it
   */
  resizeWindow: () => void

  /**
   * Closes the current window
   */
  closeWindow: () => void

}
