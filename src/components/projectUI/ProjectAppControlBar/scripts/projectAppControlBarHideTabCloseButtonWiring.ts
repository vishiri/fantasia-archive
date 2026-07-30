import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { resolveProjectAppControlBarHideTabCloseButton as resolveHideTabCloseButton } from '../functions/resolveProjectAppControlBarHideTabCloseButton'

export function resolveProjectAppControlBarHideTabCloseButton (
  settings: Parameters<typeof resolveHideTabCloseButton>[0],
  preview: Parameters<typeof resolveHideTabCloseButton>[1]
): boolean {
  return resolveHideTabCloseButton(settings, preview, FA_USER_SETTINGS_DEFAULTS)
}
