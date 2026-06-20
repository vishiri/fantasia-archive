import { beforeEach, expect, test, vi } from 'vitest'

import type { BrowserWindow } from 'electron'

const forwardFaChromiumForwardedKeyChordInPageMock = vi.hoisted(() => vi.fn())

vi.mock('../faChromiumForwardedKeyChordPageDispatchWiring', () => {
  return {
    forwardFaChromiumForwardedKeyChordInPage: forwardFaChromiumForwardedKeyChordInPageMock
  }
})

const activateMock = vi.hoisted(() => vi.fn())
const deactivateMock = vi.hoisted(() => vi.fn())
const globallyForwardedDomCodesRef = vi.hoisted(() => ({ current: new Set<string>() }))
const createFaChromiumCtrlShiftGlobalShortcutForwardControllerMock = vi.hoisted(() =>
  vi.fn(() => ({
    activate: activateMock,
    deactivate: deactivateMock,
    globallyForwardedDomCodes: globallyForwardedDomCodesRef.current
  }))
)

vi.mock('../faChromiumCtrlShiftGlobalShortcutWiring', () => {
  return {
    createFaChromiumCtrlShiftGlobalShortcutForwardController:
      createFaChromiumCtrlShiftGlobalShortcutForwardControllerMock
  }
})

import { registerFaChromiumCtrlShiftShortcutSuppress } from '../faChromiumCtrlShiftShortcutSuppressWiring'

type BeforeInputHandler = (
  event: { preventDefault: () => void },
  input: Record<string, unknown>
) => void

type WindowEventHandler = () => void

interface FaSuppressWindowMock {
  win: BrowserWindow
  beforeInputHandlers: BeforeInputHandler[]
  windowHandlers: Record<string, WindowEventHandler>
  webContentsRemoveListener: ReturnType<typeof vi.fn>
  windowRemoveListener: ReturnType<typeof vi.fn>
}

/**
 * Builds a BrowserWindow stub that records its 'before-input-event', 'focus', and 'blur' handlers
 * so tests can invoke them directly. 'isFocused' controls the initial-activate branch.
 */
function buildFaSuppressWindowMock (isFocused: boolean): FaSuppressWindowMock {
  const beforeInputHandlers: BeforeInputHandler[] = []
  const windowHandlers: Record<string, WindowEventHandler> = {}
  const webContentsRemoveListener = vi.fn()
  const windowRemoveListener = vi.fn()

  const webContents = {
    on: vi.fn((eventName: string, handler: BeforeInputHandler) => {
      if (eventName === 'before-input-event') {
        beforeInputHandlers.push(handler)
      }
    }),
    removeListener: webContentsRemoveListener
  }
  const win = {
    webContents,
    on: vi.fn((eventName: string, handler: WindowEventHandler) => {
      windowHandlers[eventName] = handler
    }),
    removeListener: windowRemoveListener,
    isFocused: vi.fn(() => isFocused)
  }

  return {
    win: win as unknown as BrowserWindow,
    beforeInputHandlers,
    windowHandlers,
    webContentsRemoveListener,
    windowRemoveListener
  }
}

beforeEach(() => {
  forwardFaChromiumForwardedKeyChordInPageMock.mockClear()
  activateMock.mockClear()
  deactivateMock.mockClear()
  createFaChromiumCtrlShiftGlobalShortcutForwardControllerMock.mockClear()
  globallyForwardedDomCodesRef.current = new Set<string>()
})

/**
 * registerFaChromiumCtrlShiftShortcutSuppress
 * The before-input path preventDefaults and forwards Ctrl+Shift+O when globalShortcut did not claim it.
 */
test('Test that registerFaChromiumCtrlShiftShortcutSuppress preventDefaults and forwards Ctrl+Shift+O', () => {
  const { win, beforeInputHandlers } = buildFaSuppressWindowMock(false)

  registerFaChromiumCtrlShiftShortcutSuppress(win)
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
  expect(forwardFaChromiumForwardedKeyChordInPageMock).toHaveBeenCalledWith(win.webContents, 'KeyO')
})

/**
 * registerFaChromiumCtrlShiftShortcutSuppress
 * The before-input path falls back to the DOM key when Chromium reports an empty 'code'.
 */
test('Test that registerFaChromiumCtrlShiftShortcutSuppress forwards when code is empty but key is o', () => {
  const { win, beforeInputHandlers } = buildFaSuppressWindowMock(false)

  registerFaChromiumCtrlShiftShortcutSuppress(win)

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
  expect(forwardFaChromiumForwardedKeyChordInPageMock).toHaveBeenCalledWith(win.webContents, 'KeyO')
})

/**
 * registerFaChromiumCtrlShiftShortcutSuppress
 * Non-denylisted chords are left untouched for Chromium and the renderer.
 */
test('Test that registerFaChromiumCtrlShiftShortcutSuppress ignores non-denylisted chords', () => {
  const { win, beforeInputHandlers } = buildFaSuppressWindowMock(false)

  registerFaChromiumCtrlShiftShortcutSuppress(win)

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

/**
 * registerFaChromiumCtrlShiftShortcutSuppress
 * When globalShortcut already forwards a chord, before-input only preventDefaults (no double forward).
 */
test('Test that registerFaChromiumCtrlShiftShortcutSuppress preventDefaults without forwarding when globalShortcut claims the chord', () => {
  globallyForwardedDomCodesRef.current = new Set([
    'KeyO'
  ])
  const { win, beforeInputHandlers } = buildFaSuppressWindowMock(false)

  registerFaChromiumCtrlShiftShortcutSuppress(win)

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

/**
 * registerFaChromiumCtrlShiftShortcutSuppress
 * before-input forwards a chord that globalShortcut could not claim while others are claimed.
 */
test('Test that registerFaChromiumCtrlShiftShortcutSuppress forwards via before-input when globalShortcut omitted KeyO', () => {
  globallyForwardedDomCodesRef.current = new Set([
    'KeyB',
    'KeyD'
  ])
  const { win, beforeInputHandlers } = buildFaSuppressWindowMock(false)

  registerFaChromiumCtrlShiftShortcutSuppress(win)

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
  expect(forwardFaChromiumForwardedKeyChordInPageMock).toHaveBeenCalledWith(win.webContents, 'KeyO')
})

/**
 * registerFaChromiumCtrlShiftShortcutSuppress
 * Window focus activates the global shortcuts and blur releases them so other apps regain the chords.
 */
test('Test that registerFaChromiumCtrlShiftShortcutSuppress activates on focus and deactivates on blur', () => {
  const { win, windowHandlers } = buildFaSuppressWindowMock(false)

  registerFaChromiumCtrlShiftShortcutSuppress(win)

  expect(activateMock).not.toHaveBeenCalled()
  expect(windowHandlers.focus).toBeTypeOf('function')
  expect(windowHandlers.blur).toBeTypeOf('function')

  windowHandlers.focus()
  expect(activateMock).toHaveBeenCalledOnce()

  windowHandlers.blur()
  expect(deactivateMock).toHaveBeenCalledOnce()
})

/**
 * registerFaChromiumCtrlShiftShortcutSuppress
 * A window that is already focused at wiring time activates the global shortcuts immediately.
 */
test('Test that registerFaChromiumCtrlShiftShortcutSuppress activates immediately when the window is already focused', () => {
  const { win } = buildFaSuppressWindowMock(true)

  registerFaChromiumCtrlShiftShortcutSuppress(win)

  expect(activateMock).toHaveBeenCalledOnce()
})

/**
 * registerFaChromiumCtrlShiftShortcutSuppress
 * The returned teardown removes every listener and releases the global shortcuts.
 */
test('Test that registerFaChromiumCtrlShiftShortcutSuppress teardown removes listeners and deactivates', () => {
  const { win, windowRemoveListener, webContentsRemoveListener } = buildFaSuppressWindowMock(false)

  const teardown = registerFaChromiumCtrlShiftShortcutSuppress(win)
  deactivateMock.mockClear()

  teardown()

  expect(windowRemoveListener).toHaveBeenCalledWith('focus', expect.any(Function))
  expect(windowRemoveListener).toHaveBeenCalledWith('blur', expect.any(Function))
  expect(webContentsRemoveListener).toHaveBeenCalledWith('before-input-event', expect.any(Function))
  expect(deactivateMock).toHaveBeenCalledOnce()
})
