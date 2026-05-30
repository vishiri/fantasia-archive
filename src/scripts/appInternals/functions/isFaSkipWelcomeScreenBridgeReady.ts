export function isFaSkipWelcomeScreenBridgeReady (): boolean {
  const bridge = window.faContentBridgeAPIs
  return (
    bridge?.projectManagement?.resolveRecentProjectMruHeadForOpen !== undefined &&
    bridge?.faUserSettings?.getSettings !== undefined
  )
}
