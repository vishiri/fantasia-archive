import { globalShortcut } from 'electron'
import type { WebContents } from 'electron'

import { FA_CHROMIUM_CTRL_SHIFT_SUPPRESS_KEY_CODES } from 'app/types/I_faChromiumCtrlShiftSuppress'
import type {
  I_faChromiumCtrlShiftGlobalShortcutForwardController,
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

const globalShortcutApi = {
  isRegistered: (accelerator: string): boolean => globalShortcut.isRegistered(accelerator),
  register: (accelerator: string, onPressed: () => void): boolean =>
    globalShortcut.register(accelerator, onPressed),
  unregister: (accelerator: string): void => {
    globalShortcut.unregister(accelerator)
  }
}

/**
 * Builds a focus-gated controller for the app-wide shortcuts that keep Chromium from consuming
 * denylisted Ctrl+Shift chords first. Nothing is registered until 'activate' runs (called when the
 * main window gains focus); 'deactivate' releases every claimed accelerator so a backgrounded
 * window never blocks these chords in other applications. The Playwright harness skips registration.
 */
export function createFaChromiumCtrlShiftGlobalShortcutForwardController (
  wc: WebContents
): I_faChromiumCtrlShiftGlobalShortcutForwardController {
  const globallyForwardedDomCodes = new Set<T_faChromiumCtrlShiftSuppressKeyCode>()
  const registeredAccelerators: string[] = []
  const canRegister = shouldRegisterFaChromiumCtrlShiftGlobalShortcuts()

  const deactivate = (): void => {
    for (const accelerator of registeredAccelerators) {
      if (globalShortcut.isRegistered(accelerator)) {
        globalShortcut.unregister(accelerator)
      }
    }
    registeredAccelerators.length = 0
    globallyForwardedDomCodes.clear()
  }

  const activate = (): void => {
    if (!canRegister) {
      return
    }
    deactivate()
    for (const domCode of FA_CHROMIUM_CTRL_SHIFT_SUPPRESS_KEY_CODES) {
      const accelerator = faChromiumDomCodeToGlobalShortcutAccelerator(domCode)
      if (accelerator === null) {
        continue
      }
      const registeredAccelerator = registerFaChromiumGlobalShortcutAccelerator(
        globalShortcutApi,
        accelerator,
        () => {
          sendFaChromiumForwardedKeyChord(wc, domCode)
        }
      )
      if (registeredAccelerator !== null) {
        registeredAccelerators.push(registeredAccelerator)
        globallyForwardedDomCodes.add(domCode)
      }
    }
  }

  return {
    activate,
    deactivate,
    globallyForwardedDomCodes
  }
}
