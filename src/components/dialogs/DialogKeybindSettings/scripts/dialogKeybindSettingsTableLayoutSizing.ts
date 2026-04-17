/** Minimum q-table max-height so the dialog never collapses the scroll region. */
export const DIALOG_KEYBIND_SETTINGS_TABLE_MIN_MAX_HEIGHT_PX = 120

/**
 * Parses a single CSS length in px (or other unit) to a float; non-finite becomes 0.
 */
export function parseCssLengthPx (raw: string): number {
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : 0
}

/**
 * Sum of padding-top and padding-bottom from computed style.
 */
export function readVerticalPaddingPx (element: Element): number {
  const s = getComputedStyle(element)
  return parseCssLengthPx(s.paddingTop) + parseCssLengthPx(s.paddingBottom)
}

/**
 * Derives q-table max-height from the flex-sized body section element.
 */
export function computeDialogKeybindSettingsTableMaxHeightPx (
  sectionElement: HTMLElement,
  minPx: number = DIALOG_KEYBIND_SETTINGS_TABLE_MIN_MAX_HEIGHT_PX
): number {
  const pad = readVerticalPaddingPx(sectionElement)
  return Math.max(
    minPx,
    Math.floor(sectionElement.clientHeight - pad)
  )
}
