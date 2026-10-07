/**
 * Enter outside IME composition. isComposing or key code 229 means the candidate is still open.
 */
export function shouldAcceptFaEnterOutsideIme (event: {
  isComposing?: boolean
  keyCode?: number
}): boolean {
  if (event.isComposing === true) {
    return false
  }
  return event.keyCode !== 229
}
