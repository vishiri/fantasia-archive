const FANTASIA_STORYBOOK_CANVAS_KEY = '__fantasiaStorybookCanvas'

function hasStorybookCanvasRoot (): boolean {
  if (typeof document === 'undefined') {
    return false
  }
  return document.getElementById('storybook-root') !== null
}

/**
 * True when Storybook preview sets the global flag or the storybook-root element is present.
 */
export function isFantasiaStorybookCanvas (): boolean {
  if ((globalThis as Record<string, unknown>)[FANTASIA_STORYBOOK_CANVAS_KEY] === true) {
    return true
  }
  return hasStorybookCanvasRoot()
}

/**
 * Vitest and Storybook preview set this flag; production Electron leaves it unset.
 */
export function setFantasiaStorybookCanvasFlag (value: boolean): void {
  if (value) {
    (globalThis as Record<string, unknown>)[FANTASIA_STORYBOOK_CANVAS_KEY] = true
  } else {
    delete (globalThis as Record<string, unknown>)[FANTASIA_STORYBOOK_CANVAS_KEY]
  }
}
