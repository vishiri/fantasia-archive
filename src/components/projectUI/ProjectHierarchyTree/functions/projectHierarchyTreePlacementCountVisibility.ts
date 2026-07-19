import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

type T_placementCountVisibilityDefaults = Pick<
  I_faUserSettings,
  'disableCategoryCount' | 'disableDocumentCounts' | 'invertCategoryPosition'
>

function resolveEffectiveBooleanSetting (
  settings: I_faUserSettings | null,
  preview: Partial<I_faUserSettings> | null,
  key: keyof T_placementCountVisibilityDefaults,
  defaults: T_placementCountVisibilityDefaults
): boolean {
  const previewValue = preview?.[key]
  if (previewValue !== undefined) {
    return previewValue
  }
  if (settings !== null) {
    return settings[key]
  }
  return defaults[key]
}

export function resolveProjectHierarchyTreePlacementCountVisibility (
  settings: I_faUserSettings | null,
  preview: Partial<I_faUserSettings> | null,
  defaults: T_placementCountVisibilityDefaults
): {
    disableCategoryCount: boolean
    disableDocumentCounts: boolean
    invertCategoryPosition: boolean
  } {
  const disableDocumentCounts = resolveEffectiveBooleanSetting(
    settings,
    preview,
    'disableDocumentCounts',
    defaults
  )
  const disableCategoryCount = resolveEffectiveBooleanSetting(
    settings,
    preview,
    'disableCategoryCount',
    defaults
  )
  const invertCategoryPosition = resolveEffectiveBooleanSetting(
    settings,
    preview,
    'invertCategoryPosition',
    defaults
  )

  return {
    disableCategoryCount,
    disableDocumentCounts,
    invertCategoryPosition
  }
}
