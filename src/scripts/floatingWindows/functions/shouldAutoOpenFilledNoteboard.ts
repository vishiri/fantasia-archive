/**
 * Whether noteboard text counts as filled content (non-empty after trim).
 * Shared by auto-open and content-dot chrome.
 */
export function noteboardHasContent (text: string): boolean {
  return text.trim().length > 0
}

/**
 * Whether a filled noteboard should auto-open: non-empty trimmed text and prevent flag off.
 */
export function shouldAutoOpenFilledNoteboard (input: {
  preventFilledPopup: boolean
  text: string
}): boolean {
  if (input.preventFilledPopup) {
    return false
  }
  return noteboardHasContent(input.text)
}

/**
 * Opens a noteboard window when filled and not prevented, and when the open gate allows it.
 */
export function maybeAutoOpenFilledNoteboard (input: {
  canOpen: boolean
  preventFilledPopup: boolean
  setWindowOpen: (open: boolean) => void
  text: string
}): void {
  if (!input.canOpen) {
    return
  }
  if (!shouldAutoOpenFilledNoteboard({
    preventFilledPopup: input.preventFilledPopup,
    text: input.text
  })) {
    return
  }
  input.setWindowOpen(true)
}
