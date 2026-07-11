/**
 * Patches missing or divergent DOM APIs for component Vitest runs (happy-dom).
 */
export function applyVitestDomEnvironmentCompat (): void {
  if (typeof document.queryCommandSupported !== 'function') {
    document.queryCommandSupported = () => false
  }

  if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class ResizeObserver {
      constructor (callback: ResizeObserverCallback) {
        void callback
      }

      disconnect (): void {}

      observe (_target: Element, _options?: unknown): void {}

      unobserve (_target: Element): void {}
    } as unknown as typeof ResizeObserver
  }

  const keyboardEventGetModifierState = KeyboardEvent.prototype.getModifierState

  /**
   * happy-dom reports AltGraph active for ctrl+alt synthetic chords; jsdom does not.
   * Keybind chord parsing treats AltGraph as alt-only and drops ctrl — match jsdom for Vitest.
   */
  KeyboardEvent.prototype.getModifierState = function (key: string): boolean {
    if (key === 'AltGraph' && this.ctrlKey && this.altKey) {
      return false
    }
    return keyboardEventGetModifierState.call(this, key)
  }
}
