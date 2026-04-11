const FANTASIA_STORYBOOK_CANVAS_KEY = '__fantasiaStorybookCanvas'

function hasStorybookCanvasRoot (): boolean {
  if (typeof document === 'undefined') {
    return false
  }
  return document.getElementById('storybook-root') !== null
}

/**
 * True in the Storybook preview iframe (has '#storybook-root') or when tests set the explicit flag.
 * Layout and menu code use this to skip surfaces that need a full Electron renderer.
 */
export function isFantasiaStorybookCanvas (): boolean {
  if ((globalThis as Record<string, unknown>)[FANTASIA_STORYBOOK_CANVAS_KEY] === true) {
    return true
  }
  return hasStorybookCanvasRoot()
}

/**
 * Vitest and similar harnesses call this to force a non-Storybook view when '#storybook-root' is absent.
 */
export function setFantasiaStorybookCanvasFlag (value: boolean): void {
  if (value) {
    (globalThis as Record<string, unknown>)[FANTASIA_STORYBOOK_CANVAS_KEY] = true
  } else {
    delete (globalThis as Record<string, unknown>)[FANTASIA_STORYBOOK_CANVAS_KEY]
  }
}
