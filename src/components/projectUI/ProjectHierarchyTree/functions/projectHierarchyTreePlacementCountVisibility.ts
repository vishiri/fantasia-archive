import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

type T_placementCountVisibilityDefaults = Pick<
  I_faUserSettings,
  'disableCategoryCount' | 'disableDocumentCounts' | 'doubleDashDocCount' | 'invertCategoryPosition'
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
    doubleDashDocCount: boolean
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
  const doubleDashDocCount = resolveEffectiveBooleanSetting(
    settings,
    preview,
    'doubleDashDocCount',
    defaults
  )

  return {
    disableCategoryCount,
    disableDocumentCounts,
    doubleDashDocCount,
    invertCategoryPosition
  }
}
