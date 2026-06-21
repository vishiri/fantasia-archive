export function clearQuasarHoverableFocusState (element: HTMLElement | null | undefined): void {
  if (element == null) {
    return
  }
  element.classList.remove('q-manual-focusable--focused')
  element.blur()
  const focusHelper = element.querySelector('.q-focus-helper')
  if (focusHelper instanceof HTMLElement) {
    focusHelper.blur()
  }
}
