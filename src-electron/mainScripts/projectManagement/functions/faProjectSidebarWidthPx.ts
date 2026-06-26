const FA_PROJECT_SIDEBAR_MIN_WIDTH_PX = 375
const FA_PROJECT_SIDEBAR_DEFAULT_WIDTH_PX = 375

/**
 * Resolves persisted sidebar width from KV text; falls back to default and enforces minimum.
 */
export function resolveFaProjectSidebarWidthPxFromKvText (
  raw: string | undefined,
  parseFinitePx: (value: string | undefined) => number | undefined
): number {
  const parsed = parseFinitePx(raw)
  if (parsed === undefined) {
    return FA_PROJECT_SIDEBAR_DEFAULT_WIDTH_PX
  }
  const ceiled = Math.ceil(parsed)
  return Math.max(FA_PROJECT_SIDEBAR_MIN_WIDTH_PX, ceiled)
}

/**
 * Formats sidebar width for SQLite KV storage (ceiled integer, minimum enforced).
 */
export function formatFaProjectSidebarWidthPxForKv (widthPx: number): string {
  return String(Math.max(FA_PROJECT_SIDEBAR_MIN_WIDTH_PX, Math.ceil(widthPx)))
}
