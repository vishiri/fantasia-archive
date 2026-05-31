import { afterEach, expect, test, vi } from 'vitest'

import { createRunFaChromiumForwardedKeyChordBoot } from '../functions/createRunFaChromiumForwardedKeyChordBoot'

afterEach(() => {
  vi.unstubAllEnvs()
})

test('createRunFaChromiumForwardedKeyChordBoot ensures listener after bridge wait', async () => {
  const ensureFaChromiumForwardedKeyChordListener = vi.fn()
  const run = createRunFaChromiumForwardedKeyChordBoot({
    ensureFaChromiumForwardedKeyChordListener,
    getMode: () => 'electron',
    hasChromiumCtrlShiftShortcutBridge: () => true,
    nowMs: () => Date.now(),
    sleepMs: async () => undefined,
    waitFaChromiumCtrlShiftShortcutBridgeOrTimeout: async () => undefined
  })

  await run()

  expect(ensureFaChromiumForwardedKeyChordListener).toHaveBeenCalledOnce()
})

test('createRunFaChromiumForwardedKeyChordBoot no-ops outside electron mode', async () => {
  const ensureFaChromiumForwardedKeyChordListener = vi.fn()
  const run = createRunFaChromiumForwardedKeyChordBoot({
    ensureFaChromiumForwardedKeyChordListener,
    getMode: () => 'spa',
    hasChromiumCtrlShiftShortcutBridge: () => true,
    nowMs: () => Date.now(),
    sleepMs: async () => undefined,
    waitFaChromiumCtrlShiftShortcutBridgeOrTimeout: async () => undefined
  })

  await run()

  expect(ensureFaChromiumForwardedKeyChordListener).not.toHaveBeenCalled()
})

test('createRunFaChromiumForwardedKeyChordBoot still calls ensure when bridge never appears', async () => {
  const ensureFaChromiumForwardedKeyChordListener = vi.fn()
  const run = createRunFaChromiumForwardedKeyChordBoot({
    ensureFaChromiumForwardedKeyChordListener,
    getMode: () => 'electron',
    hasChromiumCtrlShiftShortcutBridge: () => false,
    nowMs: () => Date.now(),
    sleepMs: async () => undefined,
    waitFaChromiumCtrlShiftShortcutBridgeOrTimeout: async () => undefined
  })

  await run()

  expect(ensureFaChromiumForwardedKeyChordListener).toHaveBeenCalledOnce()
})
