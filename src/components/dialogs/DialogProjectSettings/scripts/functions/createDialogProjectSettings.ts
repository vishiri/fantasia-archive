import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_dialogProjectSettingsSaveValidationTooltipContent } from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_dialogProjectSettingsProps } from 'app/types/I_dialogProjectSettings'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { ComputedRef, Ref } from 'app/types/I_vueCompositionRefs'

interface I_dialogComponentStoreLike {
  dialogToOpen?: unknown
  dialogUUID?: unknown
}

type T_dialogProjectSettingsDialogActionsFactory = (
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

type T_dialogProjectSettingsUseHook = (props: I_dialogProjectSettingsProps) => {
  addWorld: () => void
  dialogModel: Ref<boolean>
  documentName: Ref<string>
  hasGeneralSettingsValidationError: ComputedRef<boolean>
  hasWorldsSettingsValidationError: ComputedRef<boolean>
  isSaveDisabled: ComputedRef<boolean>
  localSettings: Ref<I_faProjectSettingsRoot | null>
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
  removeWorld: (id: string) => void
  saveAndCloseDialog: () => Promise<void>
  saveValidationErrorsTooltip: ComputedRef<I_dialogProjectSettingsSaveValidationTooltipContent>
  selectedCategoryTab: Ref<string>
  updateWorldColor: (id: string, color: string) => void
  updateWorldColorPallete: (id: string, colorPallete: string) => void
  updateWorldDisplayName: (id: string, displayName: string) => void
}

export function createDialogProjectSettings (deps: {
  S_DialogComponent: () => I_dialogComponentStoreLike
  buildDialogProjectSettingsSaveValidationTooltipForDraft: (
    projectName: string,
    worlds: I_dialogProjectSettingsWorldDraft[] | null
  ) => I_dialogProjectSettingsSaveValidationTooltipContent
  computed: <T>(getter: () => T) => ComputedRef<T>
  createDialogProjectSettingsDialogActions: T_dialogProjectSettingsDialogActionsFactory
  createDialogProjectSettingsRefs: () => {
    dialogModel: Ref<boolean>
    documentName: Ref<string>
    localSettings: Ref<I_faProjectSettingsRoot | null>
    localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
    selectedCategoryTab: Ref<string>
  }
  createDialogProjectSettingsUseHook: (hookDeps: {
    buildDialogProjectSettingsSaveValidationTooltipForDraft: (
      projectName: string,
      worlds: I_dialogProjectSettingsWorldDraft[] | null
    ) => I_dialogProjectSettingsSaveValidationTooltipContent
    computed: <T>(getter: () => T) => ComputedRef<T>
    createDialogProjectSettingsDialogActions: T_dialogProjectSettingsDialogActionsFactory
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
  }) => T_dialogProjectSettingsUseHook
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
}): {
    createDialogProjectSettingsDialogActions: T_dialogProjectSettingsDialogActionsFactory
    registerDialogProjectSettingsWatchers: (params: {
      openDialog: (input: T_dialogName) => void
      props: I_dialogProjectSettingsProps
    }) => void
    resolveDialogComponentStore: () => I_dialogComponentStoreLike | null
    useDialogProjectSettings: T_dialogProjectSettingsUseHook
  } {
  function resolveDialogComponentStore (): I_dialogComponentStoreLike | null {
    try {
      return deps.S_DialogComponent()
    } catch {
      return null
    }
  }

  const useDialogProjectSettings = deps.createDialogProjectSettingsUseHook({
    buildDialogProjectSettingsSaveValidationTooltipForDraft:
      deps.buildDialogProjectSettingsSaveValidationTooltipForDraft,
    computed: deps.computed,
    createDialogProjectSettingsDialogActions: deps.createDialogProjectSettingsDialogActions,
    createDialogProjectSettingsRefs: deps.createDialogProjectSettingsRefs,
    hasDialogProjectSettingsWorldColorPalleteValidationError:
      deps.hasDialogProjectSettingsWorldColorPalleteValidationError,
    hasDialogProjectSettingsWorldNameValidationError: deps.hasDialogProjectSettingsWorldNameValidationError,
    isDialogProjectSettingsDialogSaveDisabled: deps.isDialogProjectSettingsDialogSaveDisabled,
    isDialogProjectSettingsProjectNameInvalid: deps.isDialogProjectSettingsProjectNameInvalid,
    registerComponentDialogStackGuard: deps.registerComponentDialogStackGuard,
    registerDialogProjectSettingsWatchers: deps.registerDialogProjectSettingsWatchers
  })

  return {
    resolveDialogComponentStore,
    createDialogProjectSettingsDialogActions: deps.createDialogProjectSettingsDialogActions,
    registerDialogProjectSettingsWatchers: deps.registerDialogProjectSettingsWatchers,
    useDialogProjectSettings
  }
}
