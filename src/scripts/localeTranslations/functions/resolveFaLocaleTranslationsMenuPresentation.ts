const FA_LOCALE_TRANSLATIONS_MENU_DEFAULT_MAX_WIDTH_PX = 500

const FA_LOCALE_TRANSLATIONS_MENU_DEFAULT_MAX_HEIGHT_PX = 600

const FA_LOCALE_TRANSLATIONS_MENU_DEFAULT_VIEWPORT_MARGIN_PX = 16

/**
 * Width and max-height for the teleported locale translations menu from anchor geometry and viewport.
 */
export function resolveFaLocaleTranslationsMenuPresentation (input: {
  anchorRect: DOMRectReadOnly
  maxHeightPx?: number
  maxWidthPx?: number
  viewportHeightPx: number
  viewportMarginPx?: number
  viewportWidthPx: number
}): {
    maxHeightPx: number
    widthPx: number
  } {
  const maxWidthPx = input.maxWidthPx ?? FA_LOCALE_TRANSLATIONS_MENU_DEFAULT_MAX_WIDTH_PX
  const maxHeightPx = input.maxHeightPx ?? FA_LOCALE_TRANSLATIONS_MENU_DEFAULT_MAX_HEIGHT_PX
  const viewportMarginPx =
    input.viewportMarginPx ?? FA_LOCALE_TRANSLATIONS_MENU_DEFAULT_VIEWPORT_MARGIN_PX
  const availableWidthPx = input.viewportWidthPx - input.anchorRect.left - viewportMarginPx
  const widthPx = Math.min(maxWidthPx, Math.max(0, Math.round(availableWidthPx)))
  const availableBelowPx = input.viewportHeightPx - input.anchorRect.bottom - viewportMarginPx
  const resolvedMaxHeightPx = Math.min(maxHeightPx, Math.max(0, Math.round(availableBelowPx)))
  return {
    maxHeightPx: resolvedMaxHeightPx,
    widthPx
  }
}

export function buildFaLocaleTranslationsMenuContentStyle (input: {
  maxHeightPx: number
  widthPx: number
}): Record<string, string> {
  const width = `${input.widthPx}px`
  const maxHeight = `${input.maxHeightPx}px`
  return {
    '--fa-locale-translations-menu-max-height': maxHeight,
    '--fa-locale-translations-menu-width': width,
    maxHeight,
    maxWidth: width,
    minWidth: width,
    width
  }
}
