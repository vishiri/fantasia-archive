import { afterEach, expect, test, vi } from 'vitest'

const ensureFaChromiumForwardedKeyChordListenerMock = vi.hoisted(() => vi.fn())

vi.mock('app/src/scripts/keybinds/faChromiumForwardedKeyChordInstall_manager', () => ({
  ensureFaChromiumForwardedKeyChordListener: ensureFaChromiumForwardedKeyChordListenerMock
}))

import { runFaChromiumForwardedKeyChordBoot } from '../faChromiumForwardedKeyChord_manager'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.useRealTimers()
  ensureFaChromiumForwardedKeyChordListenerMock.mockReset()
})

/**
 * runFaChromiumForwardedKeyChordBoot
 * Manager sleepMs polls until the preload bridge surfaces.
 */
test('Test that runFaChromiumForwardedKeyChordBoot polls with manager sleepMs', async () => {
  vi.stubEnv('MODE', 'electron')
  vi.useFakeTimers()
  let bridgeReady = false
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value: {
      faContentBridgeAPIs: {
        faChromiumCtrlShiftShortcut: {
          get installForwardedKeyChordListener () {
            return bridgeReady ? vi.fn() : undefined
          }
        }
      }
    }
  })

  const bootPromise = runFaChromiumForwardedKeyChordBoot()
  await vi.advanceTimersByTimeAsync(50)
  bridgeReady = true
  await vi.advanceTimersByTimeAsync(50)
  await bootPromise

  expect(ensureFaChromiumForwardedKeyChordListenerMock).toHaveBeenCalledOnce()
})
