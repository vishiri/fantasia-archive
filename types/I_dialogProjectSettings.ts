import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsSaveValidationTooltipContent } from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { ComputedRef, Ref } from 'app/types/I_vueCompositionRefs'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

/**
 * Props for DialogProjectSettings (Storybook direct open and optional snapshot override).
 */
export interface I_dialogProjectSettingsProps {
  directInput?: T_dialogName
  directSettingsSnapshot?: I_faProjectSettingsRoot
  directWorldsSnapshot?: I_dialogProjectSettingsWorldDraft[]
}

/** Injected dependencies for createDialogProjectSettingsUseHook. */
export type T_dialogProjectSettingsUseHookDeps = {
  buildDialogProjectSettingsSaveValidationTooltipForDraft: (
    projectName: string,
    worlds: I_dialogProjectSettingsWorldDraft[] | null
  ) => I_dialogProjectSettingsSaveValidationTooltipContent
  computed: <T>(getter: () => T) => ComputedRef<T>
  createDialogProjectSettingsDialogActions: (
    params: {
      dialogModel: Ref<boolean>
      documentName: Ref<string>
      localSettings: Ref<I_faProjectSettingsRoot | null>
      localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
      props: I_dialogProjectSettingsProps
      selectedCategoryTab: Ref<string>
    }
  ) => {
    addWorld: () => void
    openDialog: (input: T_dialogName) => void
    removeWorld: (id: string) => void
    saveAndCloseDialog: () => Promise<void>
    updateWorldColor: (id: string, color: string) => void
    updateWorldColorPallete: (id: string, colorPallete: string) => void
    updateWorldDisplayName: (id: string, displayName: string) => void
  }
  createDialogProjectSettingsRefs: () => {
    dialogModel: Ref<boolean>
    documentName: Ref<string>
    localSettings: Ref<I_faProjectSettingsRoot | null>
    localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
    selectedCategoryTab: Ref<string>
  }
  hasDialogProjectSettingsWorldColorPalleteValidationError: (
    worlds: I_dialogProjectSettingsWorldDraft[] | null
  ) => boolean
  hasDialogProjectSettingsWorldNameValidationError: (
    worlds: I_dialogProjectSettingsWorldDraft[] | null
  ) => boolean
  isDialogProjectSettingsDialogSaveDisabled: (
    projectName: string,
    worlds: I_dialogProjectSettingsWorldDraft[] | null
  ) => boolean
  isDialogProjectSettingsProjectNameInvalid: (projectName: string) => boolean
  registerComponentDialogStackGuard: (dialogModel: Ref<boolean>) => void
  registerDialogProjectSettingsWatchers: (params: {
    openDialog: (input: T_dialogName) => void
    props: I_dialogProjectSettingsProps
  }) => void
}
