import { expect, test, vi } from 'vitest'

import {
  FA_CHROMIUM_CTRL_SHIFT_SHORTCUT_BRIDGE_POLL_MS,
  FA_CHROMIUM_CTRL_SHIFT_SHORTCUT_BRIDGE_WAIT_CAP_MS,
  waitFaChromiumCtrlShiftShortcutBridgeOrTimeout
} from '../faChromiumCtrlShiftShortcutBridgePoll'

/**
 * waitFaChromiumCtrlShiftShortcutBridgeOrTimeout
 * Returns without sleeping when the bridge is already available.
 */
test('Test that waitFaChromiumCtrlShiftShortcutBridgeOrTimeout returns when bridge is ready', async () => {
  const sleepMs = vi.fn(async () => undefined)

  await waitFaChromiumCtrlShiftShortcutBridgeOrTimeout({
    hasChromiumCtrlShiftShortcutBridge: () => true,
    nowMs: () => 0,
    sleepMs
  })

  expect(sleepMs).not.toHaveBeenCalled()
})

/**
 * waitFaChromiumCtrlShiftShortcutBridgeOrTimeout
 * Polls until the wait cap when the bridge never appears.
 */
test('Test that waitFaChromiumCtrlShiftShortcutBridgeOrTimeout sleeps until deadline', async () => {
  let nowMs = 0
  const sleepMs = vi.fn(async () => {
    nowMs += FA_CHROMIUM_CTRL_SHIFT_SHORTCUT_BRIDGE_POLL_MS
  })

  await waitFaChromiumCtrlShiftShortcutBridgeOrTimeout({
    hasChromiumCtrlShiftShortcutBridge: () => false,
    nowMs: () => nowMs,
    sleepMs
  })

  const expectedPolls = Math.ceil(
    FA_CHROMIUM_CTRL_SHIFT_SHORTCUT_BRIDGE_WAIT_CAP_MS / FA_CHROMIUM_CTRL_SHIFT_SHORTCUT_BRIDGE_POLL_MS
  )
  expect(sleepMs).toHaveBeenCalledTimes(expectedPolls)
  expect(nowMs).toBeGreaterThanOrEqual(FA_CHROMIUM_CTRL_SHIFT_SHORTCUT_BRIDGE_WAIT_CAP_MS)
})
