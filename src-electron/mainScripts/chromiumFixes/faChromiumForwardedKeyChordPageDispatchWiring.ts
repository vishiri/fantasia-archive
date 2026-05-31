import type { WebContents } from 'electron'

import type { T_faChromiumCtrlShiftSuppressKeyCode } from 'app/types/I_faChromiumCtrlShiftSuppress'

import { buildFaChromiumForwardedKeydownPageDispatchScript } from './functions/buildFaChromiumForwardedKeydownPageDispatchScript'

/**
 * Dispatches a synthetic keydown in the loaded page (used when globalShortcut cannot register).
 */
export function forwardFaChromiumForwardedKeyChordInPage (
  wc: WebContents,
  domCode: T_faChromiumCtrlShiftSuppressKeyCode
): void {
  if (wc.isDestroyed()) {
    return
  }

  const script = buildFaChromiumForwardedKeydownPageDispatchScript(domCode)
  void wc.executeJavaScript(script, true)
}
