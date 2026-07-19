import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

type T_hideTreeLinesDefaults = Pick<I_faUserSettings, 'hideTreeLines'>

function resolveEffectiveHideTreeLinesSetting (
  settings: I_faUserSettings | null,
  preview: Partial<I_faUserSettings> | null,
  defaults: T_hideTreeLinesDefaults
): boolean {
  const previewValue = preview?.hideTreeLines
  if (previewValue !== undefined) {
    return previewValue
  }
  if (settings !== null) {
    return settings.hideTreeLines
  }
  return defaults.hideTreeLines
}

export function resolveProjectHierarchyTreeShowsTreeLines (
  settings: I_faUserSettings | null,
  preview: Partial<I_faUserSettings> | null,
  defaults: T_hideTreeLinesDefaults
): boolean {
  return !resolveEffectiveHideTreeLinesSetting(settings, preview, defaults)
}
