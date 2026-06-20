import type { BrowserWindow, Event as ElectronEvent, Input, WebContents } from 'electron'

import {
  FA_CHROMIUM_CTRL_SHIFT_SUPPRESS_KEY_CODES
} from 'app/types/I_faChromiumCtrlShiftSuppress'
import type { T_faChromiumCtrlShiftSuppressKeyCode } from 'app/types/I_faChromiumCtrlShiftSuppress'

import { forwardFaChromiumForwardedKeyChordInPage } from './faChromiumForwardedKeyChordPageDispatchWiring'
import { createFaChromiumCtrlShiftGlobalShortcutForwardController } from './faChromiumCtrlShiftGlobalShortcutWiring'
import { resolveFaChromiumCtrlShiftShortcutToForward } from './functions/resolveFaChromiumCtrlShiftShortcutToForward'

const FA_CHROMIUM_CTRL_SHIFT_SUPPRESS_CODE_SET = new Set<string>(
  FA_CHROMIUM_CTRL_SHIFT_SUPPRESS_KEY_CODES
)

/**
 * Blocks Chromium default handling for reserved Ctrl+Shift+key chords and forwards the DOM 'code'
 * to the renderer so capture listeners and global faKeybind dispatch run. The app-wide
 * globalShortcut handlers are registered only while the main window is focused and released on
 * blur or teardown, so a backgrounded Fantasia Archive never intercepts these chords from other
 * applications. The 'before-input-event' path already fires only for the focused window.
 * Returns a teardown that removes every listener and releases the global shortcuts.
 */
export function registerFaChromiumCtrlShiftShortcutSuppress (
  win: BrowserWindow
): () => void {
  const wc: WebContents = win.webContents
  const globalShortcutController = createFaChromiumCtrlShiftGlobalShortcutForwardController(wc)
  const globallyForwardedDomCodes = globalShortcutController.globallyForwardedDomCodes

  const handleBeforeInput = (event: ElectronEvent, input: Input): void => {
    const domCode = resolveFaChromiumCtrlShiftShortcutToForward(
      {
        alt: input.alt,
        code: input.code,
        control: input.control,
        key: input.key,
        meta: input.meta,
        shift: input.shift,
        type: input.type
      },
      FA_CHROMIUM_CTRL_SHIFT_SUPPRESS_CODE_SET
    )
    if (domCode === null) {
      return
    }
    event.preventDefault()
    if (globallyForwardedDomCodes.has(domCode as T_faChromiumCtrlShiftSuppressKeyCode)) {
      return
    }
    forwardFaChromiumForwardedKeyChordInPage(wc, domCode as T_faChromiumCtrlShiftSuppressKeyCode)
  }

  const handleWindowFocus = (): void => {
    globalShortcutController.activate()
  }
  const handleWindowBlur = (): void => {
    globalShortcutController.deactivate()
  }

  wc.on('before-input-event', handleBeforeInput)
  win.on('focus', handleWindowFocus)
  win.on('blur', handleWindowBlur)

  if (win.isFocused()) {
    globalShortcutController.activate()
  }

  const teardown = (): void => {
    win.removeListener('focus', handleWindowFocus)
    win.removeListener('blur', handleWindowBlur)
    wc.removeListener('before-input-event', handleBeforeInput)
    globalShortcutController.deactivate()
  }

  return teardown
}
