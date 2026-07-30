import { computed, ref } from 'vue'
import { expect, test } from 'vitest'

import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'

import { createProjectAppControlBarSettingsFlags } from '../../functions/createProjectAppControlBarSettingsFlags'

test('Test that createProjectAppControlBarSettingsFlags maps disable and hide flags', () => {
  const settings = ref({
    disableAppControlBar: true,
    disableAppControlBarContentButtons: true,
    disableAppControlBarFunctionButtons: false,
    disableAppControlBarGuides: true,
    hideHierarchyTree: false,
    hideTabCloseButton: true,
    showTabBarScrollButtons: false
  } as I_faUserSettings)
  const appSettingsDialogPreview = ref<Partial<I_faUserSettings> | null>({
    hideHierarchyTree: true,
    showTabBarScrollButtons: true
  })

  const flags = createProjectAppControlBarSettingsFlags({
    appSettingsDialogPreview: appSettingsDialogPreview as I_computedRef<Partial<I_faUserSettings> | null>,
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    resolveHideHierarchyTree: (nextSettings, preview) => {
      return preview?.hideHierarchyTree ?? nextSettings?.hideHierarchyTree ?? false
    },
    resolveHideTabCloseButton: (nextSettings, preview) => {
      return preview?.hideTabCloseButton ?? nextSettings?.hideTabCloseButton ?? false
    },
    resolveShowTabBarScrollButtons: (nextSettings, preview) => {
      return preview?.showTabBarScrollButtons ?? nextSettings?.showTabBarScrollButtons ?? false
    },
    settings: settings as I_computedRef<I_faUserSettings | null>
  })

  expect(flags.isAppControlBarDisabled.value).toBe(true)
  expect(flags.isAppControlBarGuidesDisabled.value).toBe(true)
  expect(flags.isAppControlBarFunctionButtonsDisabled.value).toBe(false)
  expect(flags.isAppControlBarContentButtonsDisabled.value).toBe(true)
  expect(flags.hideHierarchyTree.value).toBe(true)
  expect(flags.hideTabCloseButton.value).toBe(true)
  expect(flags.showTabBarScrollButtons.value).toBe(true)
})
