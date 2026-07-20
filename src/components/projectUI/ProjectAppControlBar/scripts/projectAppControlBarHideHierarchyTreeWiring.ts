import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { resolveMainLayoutHideHierarchyTree } from 'app/src/layouts/MainLayout/scripts/functions/resolveMainLayoutHideHierarchyTree'

export function resolveProjectAppControlBarHideHierarchyTree (
  settings: Parameters<typeof resolveMainLayoutHideHierarchyTree>[0],
  preview: Parameters<typeof resolveMainLayoutHideHierarchyTree>[1]
): boolean {
  return resolveMainLayoutHideHierarchyTree(settings, preview, FA_USER_SETTINGS_DEFAULTS)
}
