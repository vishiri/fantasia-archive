export const toggleDevTools = () => {
  void window.faContentBridgeAPIs?.faDevToolsControl?.toggleDevTools?.()
}
