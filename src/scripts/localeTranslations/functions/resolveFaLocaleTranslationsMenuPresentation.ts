const FA_LOCALE_TRANSLATIONS_MENU_DEFAULT_MAX_WIDTH_PX = 500

const FA_LOCALE_TRANSLATIONS_MENU_DEFAULT_MIN_WIDTH_PX = 350

const FA_LOCALE_TRANSLATIONS_MENU_DEFAULT_MAX_HEIGHT_PX = 450

const FA_LOCALE_TRANSLATIONS_MENU_DEFAULT_VIEWPORT_MARGIN_PX = 16

/**
 * Width and max-height for the teleported locale translations menu from anchor geometry and viewport.
 */
export function resolveFaLocaleTranslationsMenuPresentation (input: {
  anchorRect: DOMRectReadOnly
  maxHeightPx?: number | undefined
  maxWidthPx?: number | undefined
  minWidthPx?: number | undefined
  viewportHeightPx: number
  viewportMarginPx?: number | undefined
  viewportWidthPx: number
}): {
    maxHeightPx: number
    widthPx: number
  } {
  const maxWidthPx = input.maxWidthPx ?? FA_LOCALE_TRANSLATIONS_MENU_DEFAULT_MAX_WIDTH_PX
  const minWidthPx = input.minWidthPx ?? FA_LOCALE_TRANSLATIONS_MENU_DEFAULT_MIN_WIDTH_PX
  const maxHeightPx = input.maxHeightPx ?? FA_LOCALE_TRANSLATIONS_MENU_DEFAULT_MAX_HEIGHT_PX
  const viewportMarginPx =
    input.viewportMarginPx ?? FA_LOCALE_TRANSLATIONS_MENU_DEFAULT_VIEWPORT_MARGIN_PX
  const availableWidthPx = input.viewportWidthPx - input.anchorRect.left - viewportMarginPx
  const preferredWidthPx = Math.max(
    minWidthPx,
    Math.round(input.anchorRect.width)
  )
  const fittedWidthPx = Math.min(
    maxWidthPx,
    Math.max(0, Math.round(availableWidthPx)),
    preferredWidthPx
  )
  const widthPx = Math.max(minWidthPx, fittedWidthPx)
  const availableBelowPx = input.viewportHeightPx - input.anchorRect.bottom - viewportMarginPx
  const resolvedMaxHeightPx = Math.min(
    maxHeightPx,
    FA_LOCALE_TRANSLATIONS_MENU_DEFAULT_MAX_HEIGHT_PX,
    Math.max(0, Math.round(availableBelowPx))
  )
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
