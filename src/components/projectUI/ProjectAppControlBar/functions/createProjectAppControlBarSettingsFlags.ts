import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'

type T_settingsFlagComputed = <T>(getter: () => T) => I_computedRef<T>

type T_projectAppControlBarSettingsFlags = {
  hideHierarchyTree: I_computedRef<boolean>
  hideTabCloseButton: I_computedRef<boolean>
  isAppControlBarContentButtonsDisabled: I_computedRef<boolean>
  isAppControlBarDisabled: I_computedRef<boolean>
  isAppControlBarFunctionButtonsDisabled: I_computedRef<boolean>
  isAppControlBarGuidesDisabled: I_computedRef<boolean>
  showTabBarScrollButtons: I_computedRef<boolean>
}

/** Build settings-derived computed flags for the project app control bar. */
export function createProjectAppControlBarSettingsFlags (input: {
  appSettingsDialogPreview: I_computedRef<Partial<I_faUserSettings> | null>
  computed: T_settingsFlagComputed
  resolveHideHierarchyTree: (
    settings: I_faUserSettings | null,
    preview: Partial<I_faUserSettings> | null
  ) => boolean
  resolveHideTabCloseButton: (
    settings: I_faUserSettings | null,
    preview: Partial<I_faUserSettings> | null
  ) => boolean
  resolveShowTabBarScrollButtons: (
    settings: I_faUserSettings | null,
    preview: Partial<I_faUserSettings> | null
  ) => boolean
  settings: I_computedRef<I_faUserSettings | null>
}): T_projectAppControlBarSettingsFlags {
  const {
    appSettingsDialogPreview,
    computed,
    resolveHideHierarchyTree,
    resolveHideTabCloseButton,
    resolveShowTabBarScrollButtons,
    settings
  } = input

  const isAppControlBarDisabled = computed(() => {
    return settings.value?.disableAppControlBar === true
  })

  const isAppControlBarGuidesDisabled = computed(() => {
    return settings.value?.disableAppControlBarGuides === true
  })

  const isAppControlBarFunctionButtonsDisabled = computed(() => {
    return settings.value?.disableAppControlBarFunctionButtons === true
  })

  const isAppControlBarContentButtonsDisabled = computed(() => {
    return settings.value?.disableAppControlBarContentButtons === true
  })

  const hideHierarchyTree = computed(() => {
    return resolveHideHierarchyTree(settings.value, appSettingsDialogPreview.value)
  })

  const hideTabCloseButton = computed(() => {
    return resolveHideTabCloseButton(settings.value, appSettingsDialogPreview.value)
  })

  const showTabBarScrollButtons = computed(() => {
    return resolveShowTabBarScrollButtons(settings.value, appSettingsDialogPreview.value)
  })

  return {
    hideHierarchyTree,
    hideTabCloseButton,
    isAppControlBarContentButtonsDisabled,
    isAppControlBarDisabled,
    isAppControlBarFunctionButtonsDisabled,
    isAppControlBarGuidesDisabled,
    showTabBarScrollButtons
  }
}
