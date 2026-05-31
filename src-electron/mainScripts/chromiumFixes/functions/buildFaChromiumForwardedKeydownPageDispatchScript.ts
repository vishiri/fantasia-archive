import type { T_faChromiumCtrlShiftSuppressKeyCode } from 'app/types/I_faChromiumCtrlShiftSuppress'

/**
 * Builds a self-invoking script that dispatches Ctrl+Shift keydown on window in the renderer page.
 */
export function buildFaChromiumForwardedKeydownPageDispatchScript (
  domCode: T_faChromiumCtrlShiftSuppressKeyCode
): string {
  const codeLiteral = JSON.stringify(domCode)

  return `(function () {
    window.dispatchEvent(new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      code: ${codeLiteral},
      ctrlKey: true,
      shiftKey: true
    }));
  })();`
}
