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
  return input.text.trim().length > 0
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
