import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

type T_extraTreePaddingDefaults = Pick<I_faUserSettings, 'extraTreePadding'>

/**
 * Resolves whether hierarchy tree root should use extra left padding.
 * App Settings dialog preview overrides persisted settings when present.
 */
export function resolveProjectHierarchyTreeUsesExtraTreePadding (
  settings: I_faUserSettings | null,
  preview: Partial<I_faUserSettings> | null,
  defaults: T_extraTreePaddingDefaults
): boolean {
  const previewValue = preview?.extraTreePadding
  if (previewValue !== undefined) {
    return previewValue
  }
  if (settings !== null) {
    return settings.extraTreePadding
  }
  return defaults.extraTreePadding
}
