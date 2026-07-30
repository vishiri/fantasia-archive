import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { resolveProjectAppControlBarShowTabBarScrollButtons as resolveShowTabBarScrollButtons } from '../functions/resolveProjectAppControlBarShowTabBarScrollButtons'

export function resolveProjectAppControlBarShowTabBarScrollButtons (
  settings: Parameters<typeof resolveShowTabBarScrollButtons>[0],
  preview: Parameters<typeof resolveShowTabBarScrollButtons>[1]
): boolean {
  return resolveShowTabBarScrollButtons(settings, preview, FA_USER_SETTINGS_DEFAULTS)
}
