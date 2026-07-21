import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

type T_forceSublevelCollapseDefaults = Pick<I_faUserSettings, 'forceSublevelCollapseInTree'>

/**
 * Resolves effective force-sublevel-collapse from saved settings and App Settings dialog preview.
 */
export function resolveProjectHierarchyTreeForceSublevelCollapse (
  settings: I_faUserSettings | null,
  preview: Partial<I_faUserSettings> | null,
  defaults: T_forceSublevelCollapseDefaults
): boolean {
  const previewValue = preview?.forceSublevelCollapseInTree
  if (previewValue !== undefined) {
    return previewValue
  }
  if (settings !== null) {
    return settings.forceSublevelCollapseInTree
  }
  return defaults.forceSublevelCollapseInTree
}
