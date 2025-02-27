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
   * Mazimizes the current window
   */
  maximizeWindow: () => void

  /**
   * Resizes the current window.
   * - If the window is maximized, smallifies it
   * - If the window is smallified, maximizes it
   */
  resizeWindow: () => void

  /**
   * Closes the current window
   */
  closeWindow: () => void

}
