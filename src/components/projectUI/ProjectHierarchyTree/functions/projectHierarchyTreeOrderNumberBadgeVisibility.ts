import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

type T_hideTreeOrderNumbersDefaults = Pick<I_faUserSettings, 'hideTreeOrderNumbers'>

function resolveEffectiveHideTreeOrderNumbersSetting (
  settings: I_faUserSettings | null,
  preview: Partial<I_faUserSettings> | null,
  defaults: T_hideTreeOrderNumbersDefaults
): boolean {
  const previewValue = preview?.hideTreeOrderNumbers
  if (previewValue !== undefined) {
    return previewValue
  }
  if (settings !== null) {
    return settings.hideTreeOrderNumbers
  }
  return defaults.hideTreeOrderNumbers
}

export function resolveProjectHierarchyTreeShowsOrderNumberBadge (
  settings: I_faUserSettings | null,
  preview: Partial<I_faUserSettings> | null,
  defaults: T_hideTreeOrderNumbersDefaults
): boolean {
  return !resolveEffectiveHideTreeOrderNumbersSetting(settings, preview, defaults)
}
