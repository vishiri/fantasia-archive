import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { I_ref } from 'app/types/I_vueCompositionShims'

interface I_dialogComponentStoreLike {
  dialogToOpen?: unknown
  dialogUUID?: unknown
}

export function createDialogAboutFantasiaArchive (deps: {
  isDialogAboutFantasiaArchiveDirectInput: (input: T_dialogName | undefined) => boolean
  isDialogAboutFantasiaArchiveStoreTarget: (dialogToOpen: unknown) => boolean
  onMounted: (hook: () => void) => void
  ref: <T>(value: T) => I_ref<T>
  registerComponentDialogStackGuard: (dialogModel: I_ref<boolean>) => void
  resolveDialogComponentStore: () => I_dialogComponentStoreLike | null
  watch: (source: () => unknown, effect: () => void) => void
}): {
    resolveDialogComponentStore: () => I_dialogComponentStoreLike | null
    useDialogAboutFantasiaArchive: (props: { directInput?: T_dialogName }) => {
      appVersion: I_ref<string>
      dialogModel: I_ref<boolean>
      documentName: I_ref<string>
    }
  } {
  const resolveDialogComponentStore = deps.resolveDialogComponentStore

  const useDialogAboutFantasiaArchive = (props: {
    directInput?: T_dialogName
  }) => {
    const dialogModel = deps.ref(false)
    deps.registerComponentDialogStackGuard(dialogModel)
    const documentName = deps.ref('')
    const appVersion = deps.ref('')

    async function openDialog (input: T_dialogName): Promise<void> {
      documentName.value = input
      dialogModel.value = true
      const version = await window.faContentBridgeAPIs?.appDetails?.getProjectVersion?.() ?? ''
      appVersion.value = version
    }

    deps.watch(() => resolveDialogComponentStore()?.dialogUUID, () => {
      const dialogComponentStore = resolveDialogComponentStore()
      if (
        dialogComponentStore !== null &&
        deps.isDialogAboutFantasiaArchiveStoreTarget(dialogComponentStore.dialogToOpen)
      ) {
        void openDialog(dialogComponentStore.dialogToOpen as T_dialogName)
      }
    })

    deps.watch(() => props.directInput, () => {
      if (deps.isDialogAboutFantasiaArchiveDirectInput(props.directInput)) {
        void openDialog(props.directInput as T_dialogName)
      }
    })

    deps.onMounted(() => {
      if (deps.isDialogAboutFantasiaArchiveDirectInput(props.directInput)) {
        void openDialog(props.directInput as T_dialogName)
      }
    })

    return {
      appVersion,
      dialogModel,
      documentName
    }
  }

  return {
    resolveDialogComponentStore,
    useDialogAboutFantasiaArchive
  }
}
