export const FA_EXTRA_ENV_BRIDGE_POLL_MS = 50
export const FA_EXTRA_ENV_BRIDGE_WAIT_CAP_MS = 3_000

import type { T_faRoutingEnvBridgePollDeps } from 'app/types/I_faBootBridgePoll'

export async function waitForPreloadExtraEnvBridgeWhenElectron (
  deps: T_faRoutingEnvBridgePollDeps
): Promise<void> {
  if (!deps.isElectronMode) {
    return
  }

  const deadlineMs = deps.nowMs() + FA_EXTRA_ENV_BRIDGE_WAIT_CAP_MS

  while (!deps.hasExtraEnvSnapshot() && deps.nowMs() < deadlineMs) {
    await deps.sleepMs(FA_EXTRA_ENV_BRIDGE_POLL_MS)
  }
}
