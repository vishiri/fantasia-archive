import type { I_assembleProjectDocumentControlBarApiInput } from 'app/types/I_faProjectDocumentControlBarDomain'

export function buildProjectDocumentControlBarAssembleInput (
  input: I_assembleProjectDocumentControlBarApiInput
): I_assembleProjectDocumentControlBarApiInput {
  const {
    activeDocumentId,
    closeAllTabsWithoutChanges,
    closeTabsWithoutChangesExcept,
    computed,
    enterDocumentEditMode,
    findTabByDocumentId,
    forceCloseAllTabs,
    forceCloseAllTabsExcept,
    formatFaKeybindCommandLabelFromSnapshot,
    getKeybindsSnapshot,
    isDocumentControlBarDisabled,
    isOnDocumentWorkspaceRoute,
    moveDocumentTab,
    projectWorlds,
    requestCloseTab,
    requestDeleteDocument,
    resolveActiveDocumentTabName,
    resolveDocumentTabLabelFromOpenedTab,
    resolveProjectDocumentControlBarSaveButtonColor,
    resolveShowDocumentControlBarStrip,
    resolveShowDocumentTabs,
    resolveShowProjectDocumentControlBarDeleteButton,
    resolveShowProjectDocumentControlBarEditButton,
    resolveShowProjectDocumentControlBarSaveButtons,
    runFaAction,
    tabs
  } = input

  return {
    activeDocumentId,
    closeAllTabsWithoutChanges,
    closeTabsWithoutChangesExcept,
    computed,
    enterDocumentEditMode,
    findTabByDocumentId,
    forceCloseAllTabs,
    forceCloseAllTabsExcept,
    formatFaKeybindCommandLabelFromSnapshot,
    getKeybindsSnapshot,
    isDocumentControlBarDisabled,
    isOnDocumentWorkspaceRoute,
    moveDocumentTab,
    projectWorlds,
    requestCloseTab,
    requestDeleteDocument,
    resolveActiveDocumentTabName,
    resolveDocumentTabLabelFromOpenedTab,
    resolveProjectDocumentControlBarSaveButtonColor,
    resolveShowDocumentControlBarStrip,
    resolveShowDocumentTabs,
    resolveShowProjectDocumentControlBarDeleteButton,
    resolveShowProjectDocumentControlBarEditButton,
    resolveShowProjectDocumentControlBarSaveButtons,
    runFaAction,
    tabs
  }
}
