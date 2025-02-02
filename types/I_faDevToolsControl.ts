export interface I_faDevToolsControl {

  /**
   * Check the current state of the DevTools in the opened FA instance
   */
  checkDevToolsStatus: () => boolean

  /**
   * Toggles the dev tools
   * - If they are opened, close them
   * - If they are closed, open them
   */
  toggleDevTools: () => void

  /**
   * Opens the dev tools
   */
  openDevTools: () => void

  /**
   * Closes the dev tools
   */
  closeDevTools: () => void

}
