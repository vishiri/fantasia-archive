import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

type T_noProjectNameDefaults = Pick<I_faUserSettings, 'noProjectName'>

function resolveEffectiveNoProjectNameSetting (
  settings: I_faUserSettings | null,
  preview: Partial<I_faUserSettings> | null,
  defaults: T_noProjectNameDefaults
): boolean {
  const previewValue = preview?.noProjectName
  if (previewValue !== undefined) {
    return previewValue
  }
  if (settings !== null) {
    return settings.noProjectName
  }
  return defaults.noProjectName
}

/**
 * True when the hierarchy tree shows the project name header above the he-tree list.
 * Requires more than one world, a non-empty display name, and Hide project name in tree off.
 */
export function resolveProjectHierarchyTreeShowsProjectNameTitle (
  worldCount: number,
  projectDisplayName: string,
  settings: I_faUserSettings | null,
  preview: Partial<I_faUserSettings> | null,
  defaults: T_noProjectNameDefaults
): boolean {
  if (worldCount <= 1) {
    return false
  }
  if (projectDisplayName.trim().length === 0) {
    return false
  }
  return !resolveEffectiveNoProjectNameSetting(settings, preview, defaults)
}
