export const FA_PROJECT_OS_OPEN_BRIDGE_POLL_MS = 50
export const FA_PROJECT_OS_OPEN_BRIDGE_WAIT_CAP_MS = 3_000

import type { T_faProjectOsOpenBridgePollDeps } from 'app/types/I_faBootBridgePoll'

export async function waitFaProjectOsOpenBridgeOrTimeout (
  deps: T_faProjectOsOpenBridgePollDeps
): Promise<void> {
  const deadlineMs = deps.nowMs() + FA_PROJECT_OS_OPEN_BRIDGE_WAIT_CAP_MS

  while (deps.nowMs() < deadlineMs) {
    if (deps.hasProjectOsOpenBridge()) {
      return
    }
    await deps.sleepMs(FA_PROJECT_OS_OPEN_BRIDGE_POLL_MS)
  }
}
