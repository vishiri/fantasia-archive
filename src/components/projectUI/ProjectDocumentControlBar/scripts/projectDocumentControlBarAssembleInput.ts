import type { I_assembleProjectDocumentControlBarApiInput } from 'app/types/I_faProjectDocumentControlBarDomain'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'

export function buildProjectDocumentControlBarAssembleInput (input: {
  activeDocumentId: I_computedRef<string | null>
  copyToClipboard: (text: string) => Promise<void>
  enterDocumentEditMode: (documentId: string) => void
  findTabByDocumentId: (documentId: string) => I_faOpenedDocumentTab | null
  formatFaKeybindCommandLabelFromSnapshot: I_assembleProjectDocumentControlBarApiInput['formatFaKeybindCommandLabelFromSnapshot']
  getKeybindsSnapshot: I_assembleProjectDocumentControlBarApiInput['getKeybindsSnapshot']
  isDocumentControlBarDisabled: I_computedRef<boolean>
  isOnDocumentWorkspaceRoute: I_computedRef<boolean>
  moveDocumentTab: (documentId: string, direction: 'left' | 'right') => void
  notifyCreate: I_assembleProjectDocumentControlBarApiInput['notifyCreate']
  closeAllTabsWithoutChanges: () => void | Promise<void>
  closeTabsWithoutChangesExcept: (exceptDocumentId: string) => void | Promise<void>
  requestDeleteDocument: (documentId: string) => void
  forceCloseAllTabs: () => void | Promise<void>
  forceCloseAllTabsExcept: (exceptDocumentId: string) => void | Promise<void>
  requestCloseTab: (documentId: string) => void
  resolveActiveDocumentTabName: I_assembleProjectDocumentControlBarApiInput['resolveActiveDocumentTabName']
  resolveDocumentTabLabelFromOpenedTab: I_assembleProjectDocumentControlBarApiInput['resolveDocumentTabLabelFromOpenedTab']
  resolveShowDocumentControlBarStrip: I_assembleProjectDocumentControlBarApiInput['resolveShowDocumentControlBarStrip']
  resolveShowDocumentTabs: I_assembleProjectDocumentControlBarApiInput['resolveShowDocumentTabs']
  resolveShowProjectDocumentControlBarEditButton: I_assembleProjectDocumentControlBarApiInput['resolveShowProjectDocumentControlBarEditButton']
  resolveShowProjectDocumentControlBarDeleteButton: I_assembleProjectDocumentControlBarApiInput['resolveShowProjectDocumentControlBarDeleteButton']
  resolveShowProjectDocumentControlBarSaveButtons: I_assembleProjectDocumentControlBarApiInput['resolveShowProjectDocumentControlBarSaveButtons']
  resolveProjectDocumentControlBarSaveButtonColor: I_assembleProjectDocumentControlBarApiInput['resolveProjectDocumentControlBarSaveButtonColor']
  runFaAction: I_assembleProjectDocumentControlBarApiInput['runFaAction']
  tabs: I_computedRef<readonly I_faOpenedDocumentTab[]>
  translateCopyNameFailed: () => string
  translateCopyNameSuccess: () => string
  computed: I_assembleProjectDocumentControlBarApiInput['computed']
}): I_assembleProjectDocumentControlBarApiInput {
  const activeDocumentId = input.activeDocumentId
  const computed = input.computed
  const copyToClipboard = input.copyToClipboard
  const enterDocumentEditMode = input.enterDocumentEditMode
  const findTabByDocumentId = input.findTabByDocumentId
  const formatFaKeybindCommandLabelFromSnapshot = input.formatFaKeybindCommandLabelFromSnapshot
  const getKeybindsSnapshot = input.getKeybindsSnapshot
  const isDocumentControlBarDisabled = input.isDocumentControlBarDisabled
  const isOnDocumentWorkspaceRoute = input.isOnDocumentWorkspaceRoute
  const moveDocumentTab = input.moveDocumentTab
  const notifyCreate = input.notifyCreate
  const closeAllTabsWithoutChanges = input.closeAllTabsWithoutChanges
  const closeTabsWithoutChangesExcept = input.closeTabsWithoutChangesExcept
  const requestDeleteDocument = input.requestDeleteDocument
  const forceCloseAllTabs = input.forceCloseAllTabs
  const forceCloseAllTabsExcept = input.forceCloseAllTabsExcept
  const requestCloseTab = input.requestCloseTab
  const resolveActiveDocumentTabName = input.resolveActiveDocumentTabName
  const resolveDocumentTabLabelFromOpenedTab = input.resolveDocumentTabLabelFromOpenedTab
  const resolveShowDocumentControlBarStrip = input.resolveShowDocumentControlBarStrip
  const resolveShowDocumentTabs = input.resolveShowDocumentTabs
  const resolveShowProjectDocumentControlBarEditButton = input.resolveShowProjectDocumentControlBarEditButton
  const resolveShowProjectDocumentControlBarDeleteButton = input.resolveShowProjectDocumentControlBarDeleteButton
  const resolveShowProjectDocumentControlBarSaveButtons = input.resolveShowProjectDocumentControlBarSaveButtons
  const resolveProjectDocumentControlBarSaveButtonColor = input.resolveProjectDocumentControlBarSaveButtonColor
  const runFaAction = input.runFaAction
  const tabs = input.tabs
  const translateCopyNameFailed = input.translateCopyNameFailed
  const translateCopyNameSuccess = input.translateCopyNameSuccess

  return {
    activeDocumentId,
    closeAllTabsWithoutChanges,
    closeTabsWithoutChangesExcept,
    computed,
    copyToClipboard,
    requestDeleteDocument,
    enterDocumentEditMode,
    findTabByDocumentId,
    formatFaKeybindCommandLabelFromSnapshot,
    forceCloseAllTabs,
    forceCloseAllTabsExcept,
    getKeybindsSnapshot,
    isDocumentControlBarDisabled,
    isOnDocumentWorkspaceRoute,
    moveDocumentTab,
    notifyCreate,
    requestCloseTab,
    resolveActiveDocumentTabName,
    resolveDocumentTabLabelFromOpenedTab,
    resolveShowDocumentControlBarStrip,
    resolveShowDocumentTabs,
    resolveShowProjectDocumentControlBarEditButton,
    resolveShowProjectDocumentControlBarDeleteButton,
    resolveShowProjectDocumentControlBarSaveButtons,
    resolveProjectDocumentControlBarSaveButtonColor,
    runFaAction,
    tabs,
    translateCopyNameFailed,
    translateCopyNameSuccess
  }
}
