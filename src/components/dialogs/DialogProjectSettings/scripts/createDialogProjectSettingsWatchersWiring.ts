import type { I_dialogProjectSettingsProps } from 'app/types/I_dialogProjectSettings'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

interface I_dialogComponentStoreLike {
  dialogToOpen?: unknown
  dialogUUID?: unknown
}

type T_registerDialogProjectSettingsWatchers = (params: {
  openDialog: (input: T_dialogName) => void
  props: I_dialogProjectSettingsProps
}) => void

export function createDialogProjectSettingsWatchersWiring (deps: {
  isDialogProjectSettingsDirectInput: (input: T_dialogName | undefined) => boolean
  isDialogProjectSettingsStoreTarget: (dialogToOpen: unknown) => boolean
  onMounted: (hook: () => void) => void
  resolveDialogComponentStore: () => I_dialogComponentStoreLike | null
  watch: (source: () => unknown, effect: () => void) => void
}): T_registerDialogProjectSettingsWatchers {
  const registerDialogProjectSettingsWatchers: T_registerDialogProjectSettingsWatchers = (
    params
  ) => {
    const { openDialog, props } = params

    deps.watch(() => deps.resolveDialogComponentStore()?.dialogUUID, () => {
      const dialogComponentStore = deps.resolveDialogComponentStore()
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

  return registerDialogProjectSettingsWatchers
}
