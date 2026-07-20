/**
 * Maps pre-rename user settings keys onto current 'I_faUserSettings' keys.
 * Legacy keys: 'disableDocumentControlBar', 'disableDocumentControlBarGuides'.
 * When a legacy key is a boolean, it overwrites the new key so electron-store
 * defaults do not hide a previously saved preference on first launch after upgrade.
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

  delete next.disableDocumentControlBar
  delete next.disableDocumentControlBarGuides

  return next
}
