export function createDialogKeybindSettingsTableLayoutSizing (): {
  DIALOG_KEYBIND_SETTINGS_TABLE_MIN_MAX_HEIGHT_PX: number
  computeDialogKeybindSettingsTableMaxHeightPx: (
    sectionElement: HTMLElement,
    minPx?: number
  ) => number
  parseCssLengthPx: (raw: string) => number
  readVerticalPaddingPx: (element: Element) => number
} {
  const DIALOG_KEYBIND_SETTINGS_TABLE_MIN_MAX_HEIGHT_PX = 120

  const parseCssLengthPx = (raw: string): number => {
    const n = Number.parseFloat(raw)
    return Number.isFinite(n) ? n : 0
  }

  const readVerticalPaddingPx = (element: Element): number => {
    const s = getComputedStyle(element)
    return parseCssLengthPx(s.paddingTop) + parseCssLengthPx(s.paddingBottom)
  }

  const computeDialogKeybindSettingsTableMaxHeightPx = (
    sectionElement: HTMLElement,
    minPx: number = DIALOG_KEYBIND_SETTINGS_TABLE_MIN_MAX_HEIGHT_PX
  ): number => {
    const pad = readVerticalPaddingPx(sectionElement)
    return Math.max(
      minPx,
      Math.floor(sectionElement.clientHeight - pad)
    )
  }

  return {
    DIALOG_KEYBIND_SETTINGS_TABLE_MIN_MAX_HEIGHT_PX,
    computeDialogKeybindSettingsTableMaxHeightPx,
    parseCssLengthPx,
    readVerticalPaddingPx
  }
}
