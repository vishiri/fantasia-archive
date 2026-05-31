import type { WebContents } from 'electron'

import {
  FA_CHROMIUM_CTRL_SHIFT_SUPPRESS_KEY_CODES
} from 'app/types/I_faChromiumCtrlShiftSuppress'
import type { T_faChromiumCtrlShiftSuppressKeyCode } from 'app/types/I_faChromiumCtrlShiftSuppress'

import { forwardFaChromiumForwardedKeyChordInPage } from './faChromiumForwardedKeyChordPageDispatchWiring'
import { registerFaChromiumCtrlShiftGlobalShortcutForward } from './faChromiumCtrlShiftGlobalShortcutWiring'
import { resolveFaChromiumCtrlShiftShortcutToForward } from './functions/resolveFaChromiumCtrlShiftShortcutToForward'

const FA_CHROMIUM_CTRL_SHIFT_SUPPRESS_CODE_SET = new Set<string>(
  FA_CHROMIUM_CTRL_SHIFT_SUPPRESS_KEY_CODES
)

/**
 * Blocks Chromium default handling for reserved Ctrl+Shift+key chords and forwards DOM 'code'
 * to the renderer so capture listeners and global faKeybind dispatch run.
 */
export function registerFaChromiumCtrlShiftShortcutSuppress (
  wc: WebContents,
  onUnregisterGlobalShortcuts?: (unregister: () => void) => void
): void {
  const globalShortcutForward = registerFaChromiumCtrlShiftGlobalShortcutForward(wc)
  onUnregisterGlobalShortcuts?.(globalShortcutForward.unregister)
  const globallyForwardedDomCodes = globalShortcutForward.globallyForwardedDomCodes

  wc.on('before-input-event', (event, input) => {
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
    forwardFaChromiumForwardedKeyChordInPage(
      wc,
      domCode as T_faChromiumCtrlShiftSuppressKeyCode
    )
  })
}
