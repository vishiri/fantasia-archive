/**
 * Builds and dispatches Escape key events Quasar escape-key accepts (keyCode 27).
 */
export function dispatchFaQuasarEscapeKeyEvent (type: 'keydown' | 'keyup'): void {
  const event = new KeyboardEvent(type, {
    bubbles: true,
    cancelable: true,
    code: 'Escape',
    key: 'Escape'
  })
  Object.defineProperty(event, 'keyCode', {
    configurable: true,
    get: () => 27
  })
  Object.defineProperty(event, 'which', {
    configurable: true,
    get: () => 27
  })
  window.dispatchEvent(event)
}
