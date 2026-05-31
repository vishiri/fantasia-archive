export const FA_CHROMIUM_CTRL_SHIFT_SHORTCUT_BRIDGE_POLL_MS = 50
export const FA_CHROMIUM_CTRL_SHIFT_SHORTCUT_BRIDGE_WAIT_CAP_MS = 3_000

import type { T_faChromiumCtrlShiftShortcutBridgePollDeps } from 'app/types/I_faBootBridgePoll'

export async function waitFaChromiumCtrlShiftShortcutBridgeOrTimeout (
  deps: T_faChromiumCtrlShiftShortcutBridgePollDeps
): Promise<void> {
  const deadlineMs = deps.nowMs() + FA_CHROMIUM_CTRL_SHIFT_SHORTCUT_BRIDGE_WAIT_CAP_MS

  while (deps.nowMs() < deadlineMs) {
    if (deps.hasChromiumCtrlShiftShortcutBridge()) {
      return
    }
    await deps.sleepMs(FA_CHROMIUM_CTRL_SHIFT_SHORTCUT_BRIDGE_POLL_MS)
  }
}
