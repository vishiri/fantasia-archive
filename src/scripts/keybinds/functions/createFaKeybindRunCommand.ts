import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'

/**
 * Maps a global keybind command id to the action manager id that should fire when the chord matches.
 * Centralized here so the keydown dispatcher stays small and Vitest can mock 'runFaAction' for routing tests.
 */
const FA_KEYBIND_COMMAND_TO_ACTION_ID: Readonly<Partial<Record<T_faKeybindCommandId, T_faActionId>>> = {
  openActionMonitor: 'openActionMonitorDialog',
  openAdvancedSearchGuide: 'openAdvancedSearchGuideDialog',
  openKeybindSettings: 'openKeybindSettingsDialog',
  openAppSettings: 'openAppSettingsDialog',
  openAppStyling: 'openAppStylingWindow',
  openProjectStyling: 'openProjectStylingDialog',
  openProjectSettings: 'openProjectSettingsDialog',
  showProjectDashboard: 'showProjectDashboard',
  toggleDeveloperTools: 'toggleDeveloperTools',
  toggleAppNoteboard: 'toggleAppNoteboardWindow',
  toggleProjectNoteboard: 'toggleProjectNoteboardWindow',
  toggleHierarchicalTree: 'toggleHierarchicalTree',
  editDocument: 'editActiveDocument',
  focusPreviousDocumentTab: 'focusPreviousOpenedDocumentTab',
  focusNextDocumentTab: 'focusNextOpenedDocumentTab',
  moveDocumentTabLeft: 'moveActiveOpenedDocumentTabLeft',
  moveDocumentTabRight: 'moveActiveOpenedDocumentTabRight'
}

export function createFaKeybindRunCommand (deps: {
  runFaAction: <Id extends T_faActionId>(id: Id, payload: I_faActionPayloadMap[Id]) => void
  tryResolveKeybindActionDispatch?: (
    id: T_faKeybindCommandId
  ) => { actionId: T_faActionId, payload: I_faActionPayloadMap[T_faActionId] } | null
}): {
    faKeybindRunCommand: (id: T_faKeybindCommandId) => void
  } {
  const faKeybindRunCommand = (id: T_faKeybindCommandId): void => {
    const specialDispatch = deps.tryResolveKeybindActionDispatch?.(id)
    if (specialDispatch !== undefined && specialDispatch !== null) {
      deps.runFaAction(specialDispatch.actionId, specialDispatch.payload)
      return
    }

    const actionId = FA_KEYBIND_COMMAND_TO_ACTION_ID[id]
    if (actionId === undefined) {
      return
    }

    deps.runFaAction(actionId, undefined)
  }

  return {
    faKeybindRunCommand
  }
}
