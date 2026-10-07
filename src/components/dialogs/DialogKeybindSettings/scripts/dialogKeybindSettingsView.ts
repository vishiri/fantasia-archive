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
  const {
    captureActionName,
    captureError,
    captureErrorMessage,
    captureInfoMessage,
    captureLabel,
    captureOpen,
    filter,
    isDirty,
    onCaptureClear,
    onCaptureSet,
    onCloseMain,
    onOpenCapture,
    pendingChord,
    tableColumns,
    tableRows
  } = state
  const {
    bodySectionRef,
    dialogKeybindSettingsTableHeightStyle
  } = tableChrome
  const { saveMain } = routing
  return {
    bodySectionRef,
    captureActionName,
    captureError,
    captureErrorMessage,
    captureInfoMessage,
    captureLabel,
    captureOpen,
    dialogKeybindSettingsTableHeightStyle,
    dialogModel,
    documentName,
    filter,
    isDirty,
    noDataShowsFilterMiss,
    onCaptureClear,
    onCaptureSet,
    onCloseMain,
    onOpenCapture,
    pendingChord,
    saveMain,
    tableColumns,
    tableRows,
    userKeybindButtonLabel
  }
}
