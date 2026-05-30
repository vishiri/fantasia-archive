/**
 * True when the renderer may poll Electron window maximize state via the preload bridge.
 */
export function globalWindowButtonsShouldPollMaximized (
  mode: string | undefined,
  hasFaWindowControlBridge: boolean
): boolean {
  return mode === 'electron' && hasFaWindowControlBridge
}
