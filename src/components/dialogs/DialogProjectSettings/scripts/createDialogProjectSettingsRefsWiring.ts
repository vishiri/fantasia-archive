import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { Ref } from 'app/types/I_vueCompositionRefs'

export function createDialogProjectSettingsRefsWiring (deps: {
  FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB: string
  ref: <T>(value: T) => Ref<T>
}): {
    dialogModel: Ref<boolean>
    documentName: Ref<string>
    localSettings: Ref<I_faProjectSettingsRoot | null>
    localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
    selectedCategoryTab: Ref<string>
  } {
  const dialogModel = deps.ref(false)
  const documentName = deps.ref('')
  const localSettings = deps.ref<I_faProjectSettingsRoot | null>(null)
  const localWorlds = deps.ref<I_dialogProjectSettingsWorldDraft[] | null>(null)
  const selectedCategoryTab = deps.ref<string>(deps.FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB)
  return {
    dialogModel,
    documentName,
    localSettings,
    localWorlds,
    selectedCategoryTab
  }
}
