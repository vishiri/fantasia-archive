import { expect, test, vi } from 'vitest'

import { dispatchFaChromiumForwardedKeyChord } from '../functions/dispatchFaChromiumForwardedKeyChord'

test('dispatchFaChromiumForwardedKeyChord dispatches keydown with ctrl shift and DOM code', () => {
  const dispatchEvent = vi.fn<(event: Event) => boolean>(() => true)
  class FakeKeyboardEvent extends Event {
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

  dispatchFaChromiumForwardedKeyChord(
    {
      KeyboardEvent: FakeKeyboardEvent as unknown as typeof KeyboardEvent,
      dispatchEvent
    },
    {
      code: 'KeyO'
    }
  )

  expect(dispatchEvent).toHaveBeenCalledOnce()
  const dispatched = vi.mocked(dispatchEvent).mock.calls[0]![0]!
  expect(dispatched).toBeInstanceOf(FakeKeyboardEvent)
  const event = dispatched as FakeKeyboardEvent
  expect(event.type).toBe('keydown')
  expect(event.code).toBe('KeyO')
  expect(event.ctrlKey).toBe(true)
  expect(event.shiftKey).toBe(true)
})
