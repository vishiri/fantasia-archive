import { createToggleDevTools } from './functions/createToggleDevTools'

export const toggleDevTools = createToggleDevTools({
  toggleDevToolsAsync: () => window.faContentBridgeAPIs?.faDevToolsControl?.toggleDevTools?.()
})
