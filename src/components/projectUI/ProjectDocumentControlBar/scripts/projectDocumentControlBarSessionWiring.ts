import type {
  I_assembleProjectDocumentControlBarApiInput,
  I_projectDocumentControlBarComposableApi
} from 'app/types/I_faProjectDocumentControlBarDomain'

function buildProjectDocumentControlBarTabHandlers (input: {
  requestCloseTab: (documentId: string) => void
  resolveDocumentTabLabelFromOpenedTab: I_assembleProjectDocumentControlBarApiInput['resolveDocumentTabLabelFromOpenedTab']
}): Pick<
  I_projectDocumentControlBarComposableApi,
  'onTabAuxClick' | 'onTabCloseClick' | 'resolveDocumentTabLabel' | 'resolveDocumentTabRoute'
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
    onTabCloseClick,
    resolveDocumentTabLabel,
    resolveDocumentTabRoute
  }
}

function buildProjectDocumentControlBarEditModeHandlers (input: {
  activeDocumentId: I_assembleProjectDocumentControlBarApiInput['activeDocumentId']
  enterDocumentEditMode: I_assembleProjectDocumentControlBarApiInput['enterDocumentEditMode']
  saveDocumentDisplayName: I_assembleProjectDocumentControlBarApiInput['saveDocumentDisplayName']
}): Pick<
  I_projectDocumentControlBarComposableApi,
  'onEnterEditModeClick' | 'onSaveDocumentClick'
> {
  function onEnterEditModeClick (): void {
    const documentId = input.activeDocumentId.value
    if (documentId === null) {
      return
    }
    input.enterDocumentEditMode(documentId)
  }

  function onSaveDocumentClick (keepEditMode: boolean): void {
    const documentId = input.activeDocumentId.value
    if (documentId === null) {
      return
    }
    void input.saveDocumentDisplayName(documentId, { keepEditMode })
  }

  return {
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
    requestCloseTab: input.requestCloseTab,
    resolveDocumentTabLabelFromOpenedTab: input.resolveDocumentTabLabelFromOpenedTab
  })

  const editModeHandlers = buildProjectDocumentControlBarEditModeHandlers({
    activeDocumentId: input.activeDocumentId,
    enterDocumentEditMode: input.enterDocumentEditMode,
    saveDocumentDisplayName: input.saveDocumentDisplayName
  })

  return {
    activeDocumentTab,
    activeDocumentTabName,
    openedDocumentTabs: input.tabs,
    showDocumentControlBar,
    showDocumentTabs,
    showEditDocumentButton,
    showSaveDocumentButtons,
    saveDocumentButtonColor,
    ...tabHandlers,
    ...editModeHandlers
  }
}
