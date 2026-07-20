import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

type T_hideHierarchyTreeDefaults = Pick<I_faUserSettings, 'hideHierarchyTree'>

function resolveEffectiveHideHierarchyTreeSetting (
  settings: I_faUserSettings | null,
  preview: Partial<I_faUserSettings> | null,
  defaults: T_hideHierarchyTreeDefaults
): boolean {
  const previewValue = preview?.hideHierarchyTree
  if (previewValue !== undefined) {
    return previewValue
  }
  if (settings !== null) {
    return settings.hideHierarchyTree
  }
  return defaults.hideHierarchyTree
}

export function resolveMainLayoutHideHierarchyTree (
  settings: I_faUserSettings | null,
  preview: Partial<I_faUserSettings> | null,
  defaults: T_hideHierarchyTreeDefaults
): boolean {
  return resolveEffectiveHideHierarchyTreeSetting(settings, preview, defaults)
}
