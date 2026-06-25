import type { I_dialogKeybindSettingsRow } from 'app/types/I_dialogKeybindSettings'
import type { T_dialogKeybindSettingsViewModuleDeps } from 'app/types/I_dialogKeybindSettings'
import type { T_useDialogKeybindSettingsViewResult } from 'app/types/I_dialogKeybindSettingsFactories'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

export function useDialogKeybindSettingsViewFromDeps (
  deps: T_dialogKeybindSettingsViewModuleDeps,
  props: {
    directInput?: T_dialogName | undefined
  }
): T_useDialogKeybindSettingsViewResult {
  const state = deps.useDialogKeybindSettings()
  const dialogModel = deps.ref(false)
  const documentName = deps.ref<T_dialogName>('KeybindSettings')
  deps.registerComponentDialogStackGuard(dialogModel)
  const keybindsStore = deps.getKeybindsStore()
  const tableChrome = deps.useDialogKeybindSettingsTableChrome(dialogModel)
  const routing = deps.setupDialogKeybindSettingsDialogRouting({
    dialogModel,
    documentName,
    initializeForOpen: state.initializeForOpen,
    keybindsStore,
    onSaveMain: state.onSaveMain,
    props
  })
  deps.registerDialogKeybindSettingsGlobalSuspend({
    captureOpen: state.captureOpen,
    dialogModel
  })
  const noDataShowsFilterMiss = deps.computed(() => {
    return deps.dialogKeybindSettingsNoDataSlotShowsFilterError(state.filter.value)
  })
  function userKeybindButtonLabel (row: I_dialogKeybindSettingsRow): string {
    return deps.formatDialogKeybindSettingsUserKeybindButtonLabel(
      row,
      {
        formatChord: routing.formatChord,
        t: (key: string) => deps.translate(key)
      }
    )
  }
  return {
    bodySectionRef: tableChrome.bodySectionRef,
    captureActionName: state.captureActionName,
    captureError: state.captureError,
    captureErrorMessage: state.captureErrorMessage,
    captureInfoMessage: state.captureInfoMessage,
    captureLabel: state.captureLabel,
    captureOpen: state.captureOpen,
    dialogKeybindSettingsTableHeightStyle: tableChrome.dialogKeybindSettingsTableHeightStyle,
    dialogModel,
    documentName,
    filter: state.filter,
    noDataShowsFilterMiss,
    onCaptureClear: state.onCaptureClear,
    onCaptureSet: state.onCaptureSet,
    onCloseMain: state.onCloseMain,
    onOpenCapture: state.onOpenCapture,
    pendingChord: state.pendingChord,
    saveMain: routing.saveMain,
    tableColumns: state.tableColumns,
    tableRows: state.tableRows,
    userKeybindButtonLabel
  }
}
