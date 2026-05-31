import { globalShortcut } from 'electron'
import type { WebContents } from 'electron'

import { FA_CHROMIUM_CTRL_SHIFT_SUPPRESS_KEY_CODES } from 'app/types/I_faChromiumCtrlShiftSuppress'
import type {
  I_faChromiumCtrlShiftGlobalShortcutForwardRegistration,
  T_faChromiumCtrlShiftSuppressKeyCode
} from 'app/types/I_faChromiumCtrlShiftSuppress'

import { forwardFaChromiumForwardedKeyChordInPage } from './faChromiumForwardedKeyChordPageDispatchWiring'
import { faChromiumDomCodeToGlobalShortcutAccelerator } from './functions/faChromiumDomCodeToGlobalShortcutAccelerator'
import { registerFaChromiumGlobalShortcutAccelerator } from './functions/registerFaChromiumGlobalShortcutAccelerator'

function shouldRegisterFaChromiumCtrlShiftGlobalShortcuts (): boolean {
  const testEnv = process.env.TEST_ENV
  return testEnv !== 'components' && testEnv !== 'e2e'
}

function sendFaChromiumForwardedKeyChord (
  wc: WebContents,
  domCode: T_faChromiumCtrlShiftSuppressKeyCode
): void {
  forwardFaChromiumForwardedKeyChordInPage(wc, domCode)
}

/**
 * Registers app-wide shortcuts so Chromium cannot consume denylisted Ctrl+Shift chords first.
 * Returns unregister cleanup (no-op when Playwright harness skips registration).
 */
export function registerFaChromiumCtrlShiftGlobalShortcutForward (
  wc: WebContents
): I_faChromiumCtrlShiftGlobalShortcutForwardRegistration {
  if (!shouldRegisterFaChromiumCtrlShiftGlobalShortcuts()) {
    return {
      globallyForwardedDomCodes: new Set(),
      unregister: () => undefined,
      usesGlobalShortcutForward: false
    }
  }

  const registeredAccelerators: string[] = []
  const globallyForwardedDomCodes = new Set<T_faChromiumCtrlShiftSuppressKeyCode>()
  const globalShortcutApi = {
    isRegistered: (accelerator: string): boolean => globalShortcut.isRegistered(accelerator),
    register: (accelerator: string, onPressed: () => void): boolean =>
      globalShortcut.register(accelerator, onPressed),
    unregister: (accelerator: string): void => {
      globalShortcut.unregister(accelerator)
    }
  }

  for (const domCode of FA_CHROMIUM_CTRL_SHIFT_SUPPRESS_KEY_CODES) {
    const accelerator = faChromiumDomCodeToGlobalShortcutAccelerator(domCode)
    if (accelerator === null) {
      continue
    }
    const didRegister = registerFaChromiumGlobalShortcutAccelerator(
      globalShortcutApi,
      accelerator,
      () => {
        sendFaChromiumForwardedKeyChord(wc, domCode)
      }
    )
    if (didRegister) {
      registeredAccelerators.push(accelerator)
      globallyForwardedDomCodes.add(domCode)
    }
  }

  const unregisterAccelerators = (): void => {
    for (const accelerator of registeredAccelerators) {
      if (globalShortcut.isRegistered(accelerator)) {
        globalShortcut.unregister(accelerator)
      }
    }
  }

  return {
    globallyForwardedDomCodes,
    unregister: unregisterAccelerators,
    usesGlobalShortcutForward: globallyForwardedDomCodes.size > 0
  }
}
