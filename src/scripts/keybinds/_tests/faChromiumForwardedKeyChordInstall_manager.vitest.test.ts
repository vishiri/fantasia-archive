import { afterEach, expect, test, vi } from 'vitest'

import { ensureFaChromiumForwardedKeyChordListener } from '../faChromiumForwardedKeyChordInstall_manager'

afterEach(() => {
  vi.restoreAllMocks()
})

test('ensureFaChromiumForwardedKeyChordListener dispatches a synthetic keydown from IPC payload', () => {
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
  const installMock = vi.fn()
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

  ensureFaChromiumForwardedKeyChordListener()
  const handler = installMock.mock.calls[0]![0]! as (payload: { code: string }) => void
  handler({
    code: 'KeyO'
  })

  expect(dispatchEvent).toHaveBeenCalledOnce()
})

test('ensureFaChromiumForwardedKeyChordListener is a no-op when the bridge is absent', () => {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value: {
      faContentBridgeAPIs: {}
    }
  })

  expect(() => ensureFaChromiumForwardedKeyChordListener()).not.toThrow()
})
