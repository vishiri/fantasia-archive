import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

type T_showTabBarScrollButtonsDefaults = Pick<I_faUserSettings, 'showTabBarScrollButtons'>

export function resolveProjectAppControlBarShowTabBarScrollButtons (
  settings: I_faUserSettings | null,
  preview: Partial<I_faUserSettings> | null,
  defaults: T_showTabBarScrollButtonsDefaults
): boolean {
  const previewValue = preview?.showTabBarScrollButtons
  if (previewValue !== undefined) {
    return previewValue
  }
  if (settings !== null) {
    return settings.showTabBarScrollButtons
  }
  return defaults.showTabBarScrollButtons
}
