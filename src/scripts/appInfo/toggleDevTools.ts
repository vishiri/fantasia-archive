/**
  * Toggles the dev tools of the current window.
  */
export const toggleDevTools = () => {
  window.faContentBridgeAPIs.faDevToolsControl.toggleDevTools()
}
