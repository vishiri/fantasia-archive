/* eslint-disable max-lines-per-function -- monolithic create factory; decompose when extracting concerns */
import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsProps } from 'app/types/I_dialogProjectSettings'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { ComputedRef, Ref } from 'app/types/I_vueCompositionRefs'

interface I_dialogComponentStoreLike {
  dialogToOpen?: unknown
  dialogUUID?: unknown
}

export function createDialogProjectSettings (deps: {
  FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB: string
  S_DialogComponent: () => I_dialogComponentStoreLike
  computed: <T>(getter: () => T) => ComputedRef<T>
  faProjectSettingsFetchFreshForDialog: () => Promise<I_faProjectSettingsRoot>
  isDialogProjectSettingsDirectInput: (input: T_dialogName | undefined) => boolean
  isDialogProjectSettingsSaveDisabled: (name: string) => boolean
  isDialogProjectSettingsStoreTarget: (dialogToOpen: unknown) => boolean
  onMounted: (hook: () => void) => void
  ref: <T>(value: T) => Ref<T>
  registerComponentDialogStackGuard: (dialogModel: Ref<boolean>) => void
  Result: {
    fromThrowable: <T, E>(fn: () => T, onError: (error: unknown) => E) => () => {
      unwrapOr: (defaultValue: T) => T
    }
  }
  runFaActionAwait: (
    id: 'saveProjectSettings',
    payload: { settings: { projectName: string } }
  ) => Promise<boolean>
  watch: (source: () => unknown, effect: () => void) => void
}): {
    createDialogProjectSettingsDialogActions: (params: {
      dialogModel: Ref<boolean>
      documentName: Ref<string>
      localSettings: Ref<I_faProjectSettingsRoot | null>
      props: I_dialogProjectSettingsProps
      selectedCategoryTab: Ref<string>
    }) => {
      openDialog: (input: T_dialogName) => void
      saveAndCloseDialog: () => Promise<void>
    }
    registerDialogProjectSettingsWatchers: (params: {
      openDialog: (input: T_dialogName) => void
      props: I_dialogProjectSettingsProps
    }) => void
    resolveDialogComponentStore: () => I_dialogComponentStoreLike | null
    useDialogProjectSettings: (props: I_dialogProjectSettingsProps) => {
      dialogModel: Ref<boolean>
      documentName: Ref<string>
      isSaveDisabled: ComputedRef<boolean>
      localSettings: Ref<I_faProjectSettingsRoot | null>
      saveAndCloseDialog: () => Promise<void>
      selectedCategoryTab: Ref<string>
    }
  } {
  function resolveDialogComponentStore (): I_dialogComponentStoreLike | null {
    try {
      return deps.S_DialogComponent()
    } catch {
      return null
    }
  }

  function createDialogProjectSettingsRefs () {
    const dialogModel = deps.ref(false)
    const documentName = deps.ref('')
    const localSettings = deps.ref<I_faProjectSettingsRoot | null>(null)
    const selectedCategoryTab = deps.ref<string>(deps.FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB)
    return {
      dialogModel,
      documentName,
      localSettings,
      selectedCategoryTab
    }
  }

  function createDialogProjectSettingsDialogActions (params: {
    dialogModel: Ref<boolean>
    documentName: Ref<string>
    localSettings: Ref<I_faProjectSettingsRoot | null>
    props: I_dialogProjectSettingsProps
    selectedCategoryTab: Ref<string>
  }) {
    const {
      dialogModel,
      documentName,
      localSettings,
      props,
      selectedCategoryTab
    } = params

    async function hydrateLocalSettingsFromDatabase (): Promise<void> {
      const snapshot = await deps.faProjectSettingsFetchFreshForDialog()
      localSettings.value = { ...snapshot }
    }

    function openDialog (input: T_dialogName): void {
      documentName.value = input
      dialogModel.value = true
      selectedCategoryTab.value = deps.FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB
      const directSnapshot = props.directSettingsSnapshot
      if (directSnapshot !== undefined) {
        localSettings.value = { ...directSnapshot }
        return
      }

      void hydrateLocalSettingsFromDatabase()
    }

    async function saveAndCloseDialog (): Promise<void> {
      if (localSettings.value === null) {
        return
      }
      const trimmedName = localSettings.value.projectName.trim()
      if (trimmedName.length === 0) {
        return
      }
      await deps.runFaActionAwait('saveProjectSettings', {
        settings: {
          projectName: trimmedName
        }
      })
      dialogModel.value = false
    }

    return {
      openDialog,
      saveAndCloseDialog
    }
  }

  function registerDialogProjectSettingsWatchers (params: {
    openDialog: (input: T_dialogName) => void
    props: I_dialogProjectSettingsProps
  }): void {
    const { openDialog, props } = params

    deps.watch(() => resolveDialogComponentStore()?.dialogUUID, () => {
      const dialogComponentStore = resolveDialogComponentStore()
      if (
        dialogComponentStore !== null &&
        deps.isDialogProjectSettingsStoreTarget(dialogComponentStore.dialogToOpen)
      ) {
        openDialog(dialogComponentStore.dialogToOpen as T_dialogName)
      }
    })

    deps.watch(() => props.directInput, () => {
      if (deps.isDialogProjectSettingsDirectInput(props.directInput)) {
        openDialog(props.directInput as T_dialogName)
      }
    })

    deps.onMounted(() => {
      if (deps.isDialogProjectSettingsDirectInput(props.directInput)) {
        openDialog(props.directInput as T_dialogName)
      }
    })
  }

  function useDialogProjectSettings (props: I_dialogProjectSettingsProps) {
    const refs = createDialogProjectSettingsRefs()
    deps.registerComponentDialogStackGuard(refs.dialogModel)
    const {
      dialogModel,
      documentName,
      localSettings,
      selectedCategoryTab
    } = refs
    const actions = createDialogProjectSettingsDialogActions({
      dialogModel,
      documentName,
      localSettings,
      props,
      selectedCategoryTab
    })
    registerDialogProjectSettingsWatchers({
      openDialog: actions.openDialog,
      props
    })

    const isSaveDisabled = deps.computed(() => {
      const name = localSettings.value?.projectName ?? ''
      return deps.isDialogProjectSettingsSaveDisabled(name)
    })

    return {
      dialogModel,
      documentName,
      isSaveDisabled,
      localSettings,
      saveAndCloseDialog: actions.saveAndCloseDialog,
      selectedCategoryTab
    }
  }

  return {
    resolveDialogComponentStore,
    createDialogProjectSettingsDialogActions,
    registerDialogProjectSettingsWatchers,
    useDialogProjectSettings
  }
}
