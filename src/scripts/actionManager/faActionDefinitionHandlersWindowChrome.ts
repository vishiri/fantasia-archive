export function buildFaActionDefinitionHandlersWindowChrome (deps: {
  toggleDevTools: () => void
}): {
    handleResizeApp: () => Promise<void>
    handleMinimizeApp: () => Promise<void>
    handleCloseApp: () => Promise<void>
    handleRefreshWebContents: () => Promise<void>
    handleToggleDeveloperTools: () => Promise<void>
  } {
  async function callBridge<T> (
    invoker: () => Promise<T> | T | undefined
  ): Promise<void> {
    const result = invoker()
    if (result instanceof Promise) {
      await result
    }
  }

  async function handleResizeApp (): Promise<void> {
    const ctrl = window.faContentBridgeAPIs?.faWindowControl
    if (ctrl === undefined) {
      return
    }
    await callBridge(() => ctrl.resizeWindow())
    await callBridge(() => ctrl.checkWindowMaximized())
  }

  async function handleMinimizeApp (): Promise<void> {
    const ctrl = window.faContentBridgeAPIs?.faWindowControl
    if (ctrl === undefined) {
      return
    }
    await callBridge(() => ctrl.minimizeWindow())
  }

  async function handleCloseApp (): Promise<void> {
    const ctrl = window.faContentBridgeAPIs?.faWindowControl
    if (ctrl === undefined) {
      return
    }
    await callBridge(() => ctrl.closeWindow())
  }

  async function handleRefreshWebContents (): Promise<void> {
    const ctrl = window.faContentBridgeAPIs?.faWindowControl
    if (ctrl === undefined) {
      return
    }
    await callBridge(() => ctrl.refreshWebContents())
  }

  async function handleToggleDeveloperTools (): Promise<void> {
    deps.toggleDevTools()
  }

  return {
    handleResizeApp,
    handleMinimizeApp,
    handleCloseApp,
    handleRefreshWebContents,
    handleToggleDeveloperTools
  }
}
