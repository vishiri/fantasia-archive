import { beforeEach, expect, test, vi } from 'vitest'

import type { WebContents } from 'electron'

const forwardFaChromiumForwardedKeyChordInPageMock = vi.hoisted(() => vi.fn())

vi.mock('../faChromiumForwardedKeyChordPageDispatchWiring', () => {
  return {
    forwardFaChromiumForwardedKeyChordInPage: forwardFaChromiumForwardedKeyChordInPageMock
  }
})

const registerFaChromiumCtrlShiftGlobalShortcutForwardMock = vi.hoisted(() => vi.fn(() => ({
  globallyForwardedDomCodes: new Set<string>(),
  unregister: vi.fn(),
  usesGlobalShortcutForward: false
})))

vi.mock('../faChromiumCtrlShiftGlobalShortcutWiring', () => {
  return {
    registerFaChromiumCtrlShiftGlobalShortcutForward: registerFaChromiumCtrlShiftGlobalShortcutForwardMock
  }
})

import { registerFaChromiumCtrlShiftShortcutSuppress } from '../faChromiumCtrlShiftShortcutSuppressWiring'

beforeEach(() => {
  forwardFaChromiumForwardedKeyChordInPageMock.mockClear()
  registerFaChromiumCtrlShiftGlobalShortcutForwardMock.mockReset()
  registerFaChromiumCtrlShiftGlobalShortcutForwardMock.mockReturnValue({
    globallyForwardedDomCodes: new Set<string>(),
    unregister: vi.fn(),
    usesGlobalShortcutForward: false
  })
})

test('registerFaChromiumCtrlShiftShortcutSuppress preventDefaults and forwards Ctrl+Shift+O', () => {
  const beforeInputHandlers: Array<
    (event: { preventDefault: () => void }, input: Record<string, unknown>) => void
  > = []
  const wc = {
    on: vi.fn((eventName: string, handler: typeof beforeInputHandlers[number]) => {
      if (eventName === 'before-input-event') {
        beforeInputHandlers.push(handler)
      }
    })
  }

  registerFaChromiumCtrlShiftShortcutSuppress(wc as unknown as WebContents)
  expect(beforeInputHandlers).toHaveLength(1)

  const preventDefault = vi.fn()
  beforeInputHandlers[0](
    {
      preventDefault
    },
    {
      alt: false,
      code: 'KeyO',
      control: true,
      key: 'o',
      meta: false,
      shift: true,
      type: 'keyDown'
    }
  )

  expect(preventDefault).toHaveBeenCalledOnce()
  expect(forwardFaChromiumForwardedKeyChordInPageMock).toHaveBeenCalledWith(wc, 'KeyO')
})

test('registerFaChromiumCtrlShiftShortcutSuppress forwards when code is empty but key is o', () => {
  const beforeInputHandlers: Array<
    (event: { preventDefault: () => void }, input: Record<string, unknown>) => void
  > = []
  const wc = {
    on: vi.fn((eventName: string, handler: typeof beforeInputHandlers[number]) => {
      if (eventName === 'before-input-event') {
        beforeInputHandlers.push(handler)
      }
    })
  }

  registerFaChromiumCtrlShiftShortcutSuppress(wc as unknown as WebContents)

  const preventDefault = vi.fn()
  beforeInputHandlers[0](
    {
      preventDefault
    },
    {
      alt: false,
      code: '',
      control: true,
      key: 'o',
      meta: false,
      shift: true,
      type: 'keyDown'
    }
  )

  expect(preventDefault).toHaveBeenCalledOnce()
  expect(forwardFaChromiumForwardedKeyChordInPageMock).toHaveBeenCalledWith(wc, 'KeyO')
})

test('registerFaChromiumCtrlShiftShortcutSuppress ignores non-denylisted chords', () => {
  const beforeInputHandlers: Array<
    (event: { preventDefault: () => void }, input: Record<string, unknown>) => void
  > = []
  const wc = {
    on: vi.fn((eventName: string, handler: typeof beforeInputHandlers[number]) => {
      if (eventName === 'before-input-event') {
        beforeInputHandlers.push(handler)
      }
    })
  }

  registerFaChromiumCtrlShiftShortcutSuppress(wc as unknown as WebContents)

  const preventDefault = vi.fn()
  beforeInputHandlers[0](
    {
      preventDefault
    },
    {
      alt: false,
      code: 'KeyA',
      control: true,
      key: 'a',
      meta: false,
      shift: true,
      type: 'keyDown'
    }
  )

  expect(preventDefault).not.toHaveBeenCalled()
  expect(forwardFaChromiumForwardedKeyChordInPageMock).not.toHaveBeenCalled()
})

test('registerFaChromiumCtrlShiftShortcutSuppress preventDefaults without IPC when globalShortcut forwards', () => {
  registerFaChromiumCtrlShiftGlobalShortcutForwardMock.mockReturnValueOnce({
    globallyForwardedDomCodes: new Set([
      'KeyO'
    ]),
    unregister: vi.fn(),
    usesGlobalShortcutForward: true
  })
  const beforeInputHandlers: Array<
    (event: { preventDefault: () => void }, input: Record<string, unknown>) => void
  > = []
  const wc = {
    on: vi.fn((eventName: string, handler: typeof beforeInputHandlers[number]) => {
      if (eventName === 'before-input-event') {
        beforeInputHandlers.push(handler)
      }
    })
  }

  registerFaChromiumCtrlShiftShortcutSuppress(wc as unknown as WebContents)

  const preventDefault = vi.fn()
  beforeInputHandlers[0](
    {
      preventDefault
    },
    {
      alt: false,
      code: 'KeyO',
      control: true,
      key: 'o',
      meta: false,
      shift: true,
      type: 'keyDown'
    }
  )

  expect(preventDefault).toHaveBeenCalledOnce()
  expect(forwardFaChromiumForwardedKeyChordInPageMock).not.toHaveBeenCalled()
})

test('registerFaChromiumCtrlShiftShortcutSuppress forwards via before-input when globalShortcut omitted KeyO', () => {
  registerFaChromiumCtrlShiftGlobalShortcutForwardMock.mockReturnValueOnce({
    globallyForwardedDomCodes: new Set([
      'KeyB',
      'KeyD'
    ]),
    unregister: vi.fn(),
    usesGlobalShortcutForward: true
  })
  const beforeInputHandlers: Array<
    (event: { preventDefault: () => void }, input: Record<string, unknown>) => void
  > = []
  const wc = {
    on: vi.fn((eventName: string, handler: typeof beforeInputHandlers[number]) => {
      if (eventName === 'before-input-event') {
        beforeInputHandlers.push(handler)
      }
    })
  }

  registerFaChromiumCtrlShiftShortcutSuppress(wc as unknown as WebContents)

  const preventDefault = vi.fn()
  beforeInputHandlers[0](
    {
      preventDefault
    },
    {
      alt: false,
      code: 'KeyO',
      control: true,
      key: 'o',
      meta: false,
      shift: true,
      type: 'keyDown'
    }
  )

  expect(preventDefault).toHaveBeenCalledOnce()
  expect(forwardFaChromiumForwardedKeyChordInPageMock).toHaveBeenCalledWith(wc, 'KeyO')
})
