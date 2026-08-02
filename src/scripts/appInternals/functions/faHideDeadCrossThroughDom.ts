/**
 * Resolves whether dead-document strike-through should be suppressed from settings/preview.
 */
export function resolveFaHideDeadCrossThroughEnabled (
  settingsValue: boolean | undefined,
  previewValue: boolean | undefined,
  defaultValue: boolean
): boolean {
  if (previewValue !== undefined) {
    return previewValue
  }
  if (settingsValue !== undefined) {
    return settingsValue
  }
  return defaultValue
}
