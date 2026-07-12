import type {
  I_assembleProjectDocumentControlBarApiInput,
  I_projectDocumentControlBarComposableApi
} from 'app/types/I_faProjectDocumentControlBarDomain'

export function buildProjectDocumentControlBarActiveDocumentStateApi (input: {
  activeDocumentId: I_assembleProjectDocumentControlBarApiInput['activeDocumentId']
  computed: I_assembleProjectDocumentControlBarApiInput['computed']
  isOnDocumentWorkspaceRoute: I_assembleProjectDocumentControlBarApiInput['isOnDocumentWorkspaceRoute']
  resolveActiveDocumentTabName: I_assembleProjectDocumentControlBarApiInput['resolveActiveDocumentTabName']
  resolveProjectDocumentControlBarSaveButtonColor: I_assembleProjectDocumentControlBarApiInput['resolveProjectDocumentControlBarSaveButtonColor']
  resolveShowProjectDocumentControlBarDeleteButton: I_assembleProjectDocumentControlBarApiInput['resolveShowProjectDocumentControlBarDeleteButton']
  resolveShowProjectDocumentControlBarEditButton: I_assembleProjectDocumentControlBarApiInput['resolveShowProjectDocumentControlBarEditButton']
  resolveShowProjectDocumentControlBarSaveButtons: I_assembleProjectDocumentControlBarApiInput['resolveShowProjectDocumentControlBarSaveButtons']
  tabs: I_assembleProjectDocumentControlBarApiInput['tabs']
}): Pick<
  I_projectDocumentControlBarComposableApi,
  | 'activeDocumentTab'
  | 'activeDocumentTabName'
  | 'saveDocumentButtonColor'
  | 'showDeleteDocumentButton'
  | 'showEditDocumentButton'
  | 'showSaveDocumentButtons'
> {
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

  return {
    activeDocumentTab,
    activeDocumentTabName,
    saveDocumentButtonColor,
    showDeleteDocumentButton,
    showEditDocumentButton,
    showSaveDocumentButtons
  }
}
