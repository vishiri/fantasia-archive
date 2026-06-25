import { afterEach, expect, test, vi } from 'vitest'

import { FA_CHROMIUM_CTRL_SHIFT_SHORTCUT_IPC } from 'app/src-electron/electron-ipc-bridge'

const ipcRendererOnMock = vi.hoisted(() => vi.fn())

vi.mock('electron', () => {
  return {
    ipcRenderer: {
      on: ipcRendererOnMock
    }
  }
})

import { faChromiumCtrlShiftShortcutAPI } from '../faChromiumCtrlShiftShortcutAPI'

afterEach(() => {
  ipcRendererOnMock.mockReset()
})

test('faChromiumCtrlShiftShortcutAPI installForwardedKeyChordListener registers once and forwards payload', () => {
  const handler = vi.fn()
  faChromiumCtrlShiftShortcutAPI.installForwardedKeyChordListener(handler)
  faChromiumCtrlShiftShortcutAPI.installForwardedKeyChordListener(handler)
  expect(ipcRendererOnMock).toHaveBeenCalledTimes(1)
  expect(ipcRendererOnMock).toHaveBeenCalledWith(
    FA_CHROMIUM_CTRL_SHIFT_SHORTCUT_IPC.forwardKeyChordToRenderer,
    expect.any(Function)
  )
  const listener = ipcRendererOnMock.mock.calls[0]![1]! as (
    event: unknown,
    payload: unknown
  ) => void
  listener({} as never, {
    code: 'KeyO'
  })
  expect(handler).toHaveBeenCalledWith({
    code: 'KeyO'
  })
  handler.mockClear()
  listener({} as never, {
    code: 1
  })
  expect(handler).not.toHaveBeenCalled()
  listener({} as never, null)
  expect(handler).not.toHaveBeenCalled()

  const updatedHandler = vi.fn()
  faChromiumCtrlShiftShortcutAPI.installForwardedKeyChordListener(updatedHandler)
  listener({} as never, {
    code: 'KeyB'
  })
  expect(handler).not.toHaveBeenCalled()
  expect(updatedHandler).toHaveBeenCalledWith({
    code: 'KeyB'
  })
})
