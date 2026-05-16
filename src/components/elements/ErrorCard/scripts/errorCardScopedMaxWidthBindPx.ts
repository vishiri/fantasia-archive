const ERROR_CARD_WIDTH_DEFAULT_PX = 600

/**
 * Resolved CSS length for ErrorCard scoped `max-width: min(100%, …)` injection.
 */
export function errorCardScopedMaxWidthBindPx (widthProp: number | undefined): string {
  const px = widthProp === undefined ? ERROR_CARD_WIDTH_DEFAULT_PX : widthProp
  const bind = `${px}px`
  return bind
}
