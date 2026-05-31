import type { I_faChromiumBeforeInputSnapshot } from 'app/types/I_faChromiumCtrlShiftSuppress'

function normalizeFaChromiumBeforeInputDomCode (code: string): string {
  if (/^Key[A-Z]$/.test(code) || code === 'Delete') {
    return code
  }
  if (/^[A-Z]$/.test(code)) {
    return `Key${code}`
  }
  if (/^[a-z]$/.test(code)) {
    return `Key${code.toUpperCase()}`
  }
  return code
}

function resolveDenylistedDomCodeFromKey (
  key: string,
  denylistedDomCodes: ReadonlySet<string>
): string | null {
  if (key.length === 1 && /[a-zA-Z]/.test(key)) {
    const domCode = `Key${key.toUpperCase()}`
    if (denylistedDomCodes.has(domCode)) {
      return domCode
    }
  }
  if (key === 'Delete' && denylistedDomCodes.has('Delete')) {
    return 'Delete'
  }
  return null
}

/**
 * Returns the DOM 'code' to forward to the renderer when Chromium would consume this chord, else null.
 */
export function resolveFaChromiumCtrlShiftShortcutToForward (
  input: I_faChromiumBeforeInputSnapshot,
  denylistedDomCodes: ReadonlySet<string>
): string | null {
  if (input.type !== 'keyDown') {
    return null
  }
  if (!input.control || !input.shift) {
    return null
  }
  if (input.alt || input.meta) {
    return null
  }

  const normalizedCode = normalizeFaChromiumBeforeInputDomCode(input.code)
  if (denylistedDomCodes.has(normalizedCode)) {
    return normalizedCode
  }

  return resolveDenylistedDomCodeFromKey(input.key, denylistedDomCodes)
}
