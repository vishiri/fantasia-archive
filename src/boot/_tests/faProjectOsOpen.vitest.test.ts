import { afterEach, expect, test, vi } from 'vitest'

const runFaActionAwaitMock = vi.hoisted(() => vi.fn(() => Promise.resolve(true)))

vi.mock('app/src/scripts/actionManager/faActionManagerRun', () => {
  return {
    runFaActionAwait: runFaActionAwaitMock
  }
})

vi.mock('#q-app/wrappers', () => {
  return {
    defineBoot: (fn: unknown) => {
      return fn
    }
  }
})

import faProjectOsOpen from '../faProjectOsOpen'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.useRealTimers()
  runFaActionAwaitMock.mockReset()
})

/**
 * faProjectOsOpen boot
 *
 * Wires OS-open callback and renderer-ready handshake in Electron mode.
 */
test('Test that faProjectOsOpen registers listener and sends ready in electron mode', async () => {
  vi.stubEnv('MODE', 'electron')
  const installOsOpenListener = vi.fn()
  const sendRendererReady = vi.fn()

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value: {
      faContentBridgeAPIs: {
        faProjectOsOpen: {
          installOsOpenListener,
          sendRendererReady
        }
      }
    } as unknown as Window & typeof globalThis
  })
  await (faProjectOsOpen as () => Promise<void>)()
  expect(installOsOpenListener).toHaveBeenCalledOnce()
  expect(sendRendererReady).toHaveBeenCalledOnce()
  const cb = installOsOpenListener.mock.calls[0][0] as (filePath: string) => void
  const fp = 'D:\\x\\p.faproject'
  cb(fp)
  expect(runFaActionAwaitMock).toHaveBeenCalledWith(
    'loadExistingProject',
    { filePath: fp }
  )
})

/**
 * faProjectOsOpen boot
 *
 * Waits briefly when the preload bridge exposes 'faProjectOsOpen' shortly after startup.
 */
test('Test that faProjectOsOpen polls until preload exposes faProjectOsOpen', async () => {
  vi.stubEnv('MODE', 'electron')
  vi.useFakeTimers({ shouldAdvanceTime: true })

  const installOsOpenListener = vi.fn()
  const sendRendererReady = vi.fn()

  const apis: Record<string, unknown> = {}

  globalThis.setTimeout(() => {
    apis.faProjectOsOpen = {
      installOsOpenListener,
      sendRendererReady
    }
  }, 160)

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value: {
      faContentBridgeAPIs: apis
    } as unknown as Window & typeof globalThis
  })

  const pendingBoot = (faProjectOsOpen as () => Promise<void>)()
  await vi.advanceTimersByTimeAsync(400)
  await pendingBoot

  expect(installOsOpenListener).toHaveBeenCalledOnce()
  expect(sendRendererReady).toHaveBeenCalledOnce()
})

/**
 * faProjectOsOpen boot
 *
 * No-ops when the bridge stays missing across the waiter (OS-open degraded; no throw).
 */
test('Test that faProjectOsOpen no-ops when bridge never attaches', async () => {
  vi.stubEnv('MODE', 'electron')
  vi.useFakeTimers({ shouldAdvanceTime: true })

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value: {
      faContentBridgeAPIs: {}
    } as unknown as Window & typeof globalThis
  })

  const pendingBoot = (faProjectOsOpen as () => Promise<void>)()
  await vi.advanceTimersByTimeAsync(4_500)
  await pendingBoot

  expect(runFaActionAwaitMock).not.toHaveBeenCalled()
})

/**
 * faProjectOsOpen boot
 *
 * Skips when not in Electron mode.
 */
test('Test that faProjectOsOpen skips when MODE is not electron', async () => {
  vi.stubEnv('MODE', 'spa')
  const installOsOpenListener = vi.fn()
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value: {
      faContentBridgeAPIs: {
        faProjectOsOpen: {
          installOsOpenListener,
          sendRendererReady: vi.fn()
        }
      }
    } as unknown as Window & typeof globalThis
  })
  await (faProjectOsOpen as () => Promise<void>)()
  expect(installOsOpenListener).not.toHaveBeenCalled()
})
