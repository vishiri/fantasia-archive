import type {
  I_assembleProjectDocumentControlBarApiInput,
  I_projectDocumentControlBarComposableApi
} from 'app/types/I_faProjectDocumentControlBarDomain'

import { buildProjectDocumentControlBarKeybindTooltipLabels } from '../functions/projectDocumentControlBarKeybindTooltipLabels'
import { buildProjectDocumentControlBarTabContextMenuHandlers } from './projectDocumentControlBarTabContextMenuWiring'

function buildProjectDocumentControlBarTabHandlers (input: {
  closeAllTabsWithoutChanges: () => void | Promise<void>
  closeTabsWithoutChangesExcept: (exceptDocumentId: string) => void | Promise<void>
  requestDeleteDocument: (documentId: string) => void
  forceCloseAllTabs: () => void | Promise<void>
  forceCloseAllTabsExcept: (exceptDocumentId: string) => void | Promise<void>
  requestCloseTab: (documentId: string) => void
  resolveDocumentTabLabelFromOpenedTab: I_assembleProjectDocumentControlBarApiInput['resolveDocumentTabLabelFromOpenedTab']
}): Pick<
  I_projectDocumentControlBarComposableApi,
  | 'onTabAuxClick'
  | 'onTabCloseClick'
  | 'onTabCloseAllWithoutChangesClick'
  | 'onTabCloseAllWithoutChangesExceptClick'
  | 'onTabDeleteClick'
  | 'onTabForceCloseAllClick'
  | 'onTabForceCloseAllExceptClick'
  | 'resolveDocumentTabLabel'
  | 'resolveDocumentTabRoute'
> {
  function resolveDocumentTabRoute (documentId: string): string {
    return `/home/document/${documentId}`
  }

  function resolveDocumentTabLabel (tab: {
    displayNameDraft: string
    tabLabel: string
  }): string {
    return input.resolveDocumentTabLabelFromOpenedTab({
      displayNameDraft: tab.displayNameDraft,
      tabLabel: tab.tabLabel
    })
  }

  function onTabCloseClick (documentId: string): void {
    input.requestCloseTab(documentId)
  }

  function onTabCloseAllWithoutChangesExceptClick (documentId: string): void {
    void input.closeTabsWithoutChangesExcept(documentId)
  }

  function onTabCloseAllWithoutChangesClick (): void {
    void input.closeAllTabsWithoutChanges()
  }

  function onTabForceCloseAllExceptClick (documentId: string): void {
    void input.forceCloseAllTabsExcept(documentId)
  }

  function onTabForceCloseAllClick (): void {
    void input.forceCloseAllTabs()
  }

  function onTabDeleteClick (documentId: string): void {
    input.requestDeleteDocument(documentId)
  }

  function onTabAuxClick (documentId: string, event: MouseEvent): void {
    if (event.button !== 1) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    onTabCloseClick(documentId)
  }

  return {
    onTabAuxClick,
    onTabCloseAllWithoutChangesClick,
    onTabCloseAllWithoutChangesExceptClick,
    onTabCloseClick,
    onTabDeleteClick,
    onTabForceCloseAllClick,
    onTabForceCloseAllExceptClick,
    resolveDocumentTabLabel,
    resolveDocumentTabRoute
  }
}

function buildProjectDocumentControlBarEditModeHandlers (input: {
  activeDocumentId: I_assembleProjectDocumentControlBarApiInput['activeDocumentId']
  enterDocumentEditMode: I_assembleProjectDocumentControlBarApiInput['enterDocumentEditMode']
  requestDeleteDocument: I_assembleProjectDocumentControlBarApiInput['requestDeleteDocument']
  runFaAction: I_assembleProjectDocumentControlBarApiInput['runFaAction']
}): Pick<
  I_projectDocumentControlBarComposableApi,
  'onDeleteCurrentDocumentClick' | 'onEnterEditModeClick' | 'onSaveDocumentClick'
> {
  function onEnterEditModeClick (): void {
    const documentId = input.activeDocumentId.value
    if (documentId === null) {
      return
    }
    input.enterDocumentEditMode(documentId)
  }

  function onDeleteCurrentDocumentClick (): void {
    const documentId = input.activeDocumentId.value
    if (documentId === null) {
      return
    }
    input.requestDeleteDocument(documentId)
  }

  function onSaveDocumentClick (keepEditMode: boolean): void {
    const documentId = input.activeDocumentId.value
    if (documentId === null) {
      return
    }
    input.runFaAction('saveOpenedDocumentDisplayName', {
      documentId,
      keepEditMode
    })
  }

  return {
    onDeleteCurrentDocumentClick,
    onEnterEditModeClick,
    onSaveDocumentClick
  }
}

export function assembleProjectDocumentControlBarApi (
  input: I_assembleProjectDocumentControlBarApiInput
): I_projectDocumentControlBarComposableApi {
  const showDocumentControlBar = input.computed(() => {
    return input.resolveShowDocumentControlBarStrip({
      disableDocumentControlBar: input.isDocumentControlBarDisabled.value
    })
  })

  const showDocumentTabs = input.computed(() => {
    return input.resolveShowDocumentTabs(input.tabs.value.length)
  })

  const activeDocumentTabName = input.computed(() => {
    return input.resolveActiveDocumentTabName({
      activeDocumentId: input.activeDocumentId.value,
      openedTabs: input.tabs.value
    })
  })

  const activeDocumentTab = input.computed(() => {
    const documentId = input.activeDocumentId.value
    if (documentId === null) {
      return null
    }
    return input.tabs.value.find((tab) => tab.documentId === documentId) ?? null
  })

  const showEditDocumentButton = input.computed(() => {
    return input.resolveShowProjectDocumentControlBarEditButton({
      activeDocumentTab: activeDocumentTab.value,
      isOnDocumentWorkspaceRoute: input.isOnDocumentWorkspaceRoute.value
    })
  })

  const showSaveDocumentButtons = input.computed(() => {
    return input.resolveShowProjectDocumentControlBarSaveButtons({
      activeDocumentTab: activeDocumentTab.value,
      isOnDocumentWorkspaceRoute: input.isOnDocumentWorkspaceRoute.value
    })
  })

  const showDeleteDocumentButton = input.computed(() => {
    return input.resolveShowProjectDocumentControlBarDeleteButton({
      activeDocumentTab: activeDocumentTab.value,
      isOnDocumentWorkspaceRoute: input.isOnDocumentWorkspaceRoute.value
    })
  })

  const saveDocumentButtonColor = input.computed(() => {
    const tab = activeDocumentTab.value
    if (tab === null) {
      return input.resolveProjectDocumentControlBarSaveButtonColor({
        hasUnsavedChanges: false
      })
    }

    return input.resolveProjectDocumentControlBarSaveButtonColor({
      hasUnsavedChanges: tab.hasUnsavedChanges
    })
  })

  const tabHandlers = buildProjectDocumentControlBarTabHandlers({
    closeAllTabsWithoutChanges: input.closeAllTabsWithoutChanges,
    closeTabsWithoutChangesExcept: input.closeTabsWithoutChangesExcept,
    requestDeleteDocument: input.requestDeleteDocument,
    forceCloseAllTabs: input.forceCloseAllTabs,
    forceCloseAllTabsExcept: input.forceCloseAllTabsExcept,
    requestCloseTab: input.requestCloseTab,
    resolveDocumentTabLabelFromOpenedTab: input.resolveDocumentTabLabelFromOpenedTab
  })

  const editModeHandlers = buildProjectDocumentControlBarEditModeHandlers({
    activeDocumentId: input.activeDocumentId,
    enterDocumentEditMode: input.enterDocumentEditMode,
    requestDeleteDocument: input.requestDeleteDocument,
    runFaAction: input.runFaAction
  })

  const keybindTooltipLabels = buildProjectDocumentControlBarKeybindTooltipLabels({
    computed: input.computed,
    formatFaKeybindCommandLabelFromSnapshot: input.formatFaKeybindCommandLabelFromSnapshot,
    getKeybindsSnapshot: input.getKeybindsSnapshot
  })

  const contextMenuHandlers = buildProjectDocumentControlBarTabContextMenuHandlers({
    copyToClipboard: input.copyToClipboard,
    findTabByDocumentId: input.findTabByDocumentId,
    moveDocumentTab: input.moveDocumentTab,
    notifyCreate: input.notifyCreate,
    requestCloseTab: input.requestCloseTab,
    resolveDocumentTabLabelFromOpenedTab: input.resolveDocumentTabLabelFromOpenedTab,
    translateCopyNameFailed: input.translateCopyNameFailed,
    translateCopyNameSuccess: input.translateCopyNameSuccess
  })

  return {
    activeDocumentTab,
    activeDocumentTabName,
    openedDocumentTabs: input.tabs,
    showDocumentControlBar,
    showDocumentTabs,
    showDeleteDocumentButton,
    showEditDocumentButton,
    showSaveDocumentButtons,
    saveDocumentButtonColor,
    ...keybindTooltipLabels,
    ...tabHandlers,
    ...editModeHandlers,
    ...contextMenuHandlers
  }
}
