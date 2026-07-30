import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

type T_hideTabCloseButtonDefaults = Pick<I_faUserSettings, 'hideTabCloseButton'>

export function resolveProjectAppControlBarHideTabCloseButton (
  settings: I_faUserSettings | null,
  preview: Partial<I_faUserSettings> | null,
  defaults: T_hideTabCloseButtonDefaults
): boolean {
  const previewValue = preview?.hideTabCloseButton
  if (previewValue !== undefined) {
    return previewValue
  }
  if (settings !== null) {
    return settings.hideTabCloseButton
  }
  return defaults.hideTabCloseButton
}
