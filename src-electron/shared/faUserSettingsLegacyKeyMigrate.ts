/**
 * Maps pre-rename user settings keys onto current 'I_faUserSettings' keys.
 * Legacy keys: 'disableDocumentControlBar', 'disableDocumentControlBarGuides',
 * 'doNotCollapseTreeOptions', 'preventFilledNoteBoardPopup'.
 * When a legacy key is a boolean, it overwrites the new key so electron-store
 * defaults do not hide a previously saved preference on first launch after upgrade.
 * 'doNotCollapseTreeOptions' (prevent collapse / remember children) maps to
 * 'forceSublevelCollapseInTree: false' — force-off is the new default (children
 * remember pre-close state). Prefer an already-present force key when set.
 * 'preventFilledNoteBoardPopup' maps onto 'preventFilledAppNoteBoardPopup'.
 */
export function migrateLegacyFaUserSettingsKeys (
  raw: unknown
): Record<string, unknown> {
  if (
    typeof raw !== 'object' ||
    raw === null ||
    Array.isArray(raw) ||
    Object.getPrototypeOf(raw) !== Object.prototype
  ) {
    return {}
  }

  const source = raw as Record<string, unknown>
  const next: Record<string, unknown> = { ...source }

  if (typeof source.disableDocumentControlBar === 'boolean') {
    next.disableAppControlBar = source.disableDocumentControlBar
  }
  if (typeof source.disableDocumentControlBarGuides === 'boolean') {
    next.disableAppControlBarGuides = source.disableDocumentControlBarGuides
  }
  if (typeof source.doNotCollapseTreeOptions === 'boolean') {
    if (typeof source.forceSublevelCollapseInTree !== 'boolean') {
      next.forceSublevelCollapseInTree = false
    }
  }
  if (typeof source.preventFilledNoteBoardPopup === 'boolean') {
    next.preventFilledAppNoteBoardPopup = source.preventFilledNoteBoardPopup
  }

  delete next.disableDocumentControlBar
  delete next.disableDocumentControlBarGuides
  delete next.doNotCollapseTreeOptions
  delete next.preventFilledNoteBoardPopup

  return next
}
