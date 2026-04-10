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
