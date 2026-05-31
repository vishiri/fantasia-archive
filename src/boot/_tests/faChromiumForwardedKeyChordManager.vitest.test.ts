import { afterEach, expect, test, vi } from 'vitest'

import { runFaChromiumForwardedKeyChordBoot } from '../scripts/faChromiumForwardedKeyChord_manager'

const installMock = vi.hoisted(() => vi.fn())

afterEach(() => {
  vi.unstubAllEnvs()
})

test('runFaChromiumForwardedKeyChordBoot installs listener and dispatches synthetic keydown', async () => {
  vi.stubEnv('MODE', 'electron')
  class TestKeyboardEvent extends Event {
    code: string
    ctrlKey: boolean
    shiftKey: boolean

    constructor (type: string, init?: KeyboardEventInit) {
      super(type, init)
      this.code = init?.code ?? ''
      this.ctrlKey = init?.ctrlKey ?? false
      this.shiftKey = init?.shiftKey ?? false
    }
  }
  vi.stubGlobal('KeyboardEvent', TestKeyboardEvent as unknown as typeof KeyboardEvent)
  const dispatchEvent = vi.fn<(event: Event) => boolean>(() => true)
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value: {
      dispatchEvent,
      faContentBridgeAPIs: {
        faChromiumCtrlShiftShortcut: {
          installForwardedKeyChordListener: installMock
        }
      }
    }
  })

  await runFaChromiumForwardedKeyChordBoot()

  expect(installMock).toHaveBeenCalledOnce()
  const handler = installMock.mock.calls[0][0] as (payload: { code: string }) => void
  handler({
    code: 'KeyO'
  })
  expect(dispatchEvent).toHaveBeenCalledOnce()
  const event = vi.mocked(dispatchEvent).mock.calls[0][0]
  expect(event).toBeInstanceOf(TestKeyboardEvent)
  const keyEvent = event as TestKeyboardEvent
  expect(keyEvent.type).toBe('keydown')
  expect(keyEvent.code).toBe('KeyO')
  expect(keyEvent.ctrlKey).toBe(true)
  expect(keyEvent.shiftKey).toBe(true)
})
