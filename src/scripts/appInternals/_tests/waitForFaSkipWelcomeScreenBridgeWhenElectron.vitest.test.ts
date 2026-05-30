import { beforeEach, expect, test, vi } from 'vitest'

import { createWaitForFaSkipWelcomeScreenBridgeWhenElectron } from '../functions/waitForFaSkipWelcomeScreenBridgeWhenElectron'

const nowMsMock = vi.hoisted(() => {
  let now = 0
  return {
    advance (ms: number): void {
      now += ms
    },
    reset (): void {
      now = 0
    },
    value (): number {
      return now
    }
  }
})

const sleepMsMock = vi.hoisted(() => vi.fn(async () => undefined))

beforeEach(() => {
  nowMsMock.reset()
  sleepMsMock.mockReset()
  sleepMsMock.mockImplementation(async () => undefined)
})

/**
 * createWaitForFaSkipWelcomeScreenBridgeWhenElectron
 * Non-Electron mode does not poll.
 */
test('Test that waitForFaSkipWelcomeScreenBridgeWhenElectron returns immediately outside Electron', async () => {
  const isReadyMock = vi.fn(() => false)
  const wait = createWaitForFaSkipWelcomeScreenBridgeWhenElectron({
    getMode: () => 'spa',
    isSkipWelcomeScreenBridgeReady: isReadyMock,
    nowMs: nowMsMock.value,
    sleepMs: sleepMsMock
  })

  await expect(wait()).resolves.toBeUndefined()
  expect(isReadyMock).not.toHaveBeenCalled()
})

/**
 * createWaitForFaSkipWelcomeScreenBridgeWhenElectron
 * Electron mode resolves once the bridge is ready.
 */
test('Test that waitForFaSkipWelcomeScreenBridgeWhenElectron polls until the bridge is ready', async () => {
  let ready = false
  const wait = createWaitForFaSkipWelcomeScreenBridgeWhenElectron({
    getMode: () => 'electron',
    isSkipWelcomeScreenBridgeReady: () => ready,
    nowMs: nowMsMock.value,
    sleepMs: sleepMsMock
  })

  const pending = wait()
  ready = true
  nowMsMock.advance(100)
  await pending

  expect(sleepMsMock).toHaveBeenCalled()
})

/**
 * createWaitForFaSkipWelcomeScreenBridgeWhenElectron
 * Throws when Electron bridges never become ready.
 */
test('Test that waitForFaSkipWelcomeScreenBridgeWhenElectron throws after timeout', async () => {
  const wait = createWaitForFaSkipWelcomeScreenBridgeWhenElectron({
    getMode: () => 'electron',
    isSkipWelcomeScreenBridgeReady: () => false,
    nowMs: nowMsMock.value,
    sleepMs: sleepMsMock
  })

  const pending = wait()
  nowMsMock.advance(30_001)

  await expect(pending).rejects.toThrow('Timed out waiting for skip-welcome screen preload bridges.')
})
