import type {
  I_assembleProjectAppControlBarApiInput,
  I_projectAppControlBarComposableApi
} from 'app/types/I_faProjectAppControlBarDomain'

export function buildProjectAppControlBarActiveDocumentStateApi (input: {
  activeDocumentId: I_assembleProjectAppControlBarApiInput['activeDocumentId']
  computed: I_assembleProjectAppControlBarApiInput['computed']
  isOnDocumentWorkspaceRoute: I_assembleProjectAppControlBarApiInput['isOnDocumentWorkspaceRoute']
  resolveActiveDocumentTabName: I_assembleProjectAppControlBarApiInput['resolveActiveDocumentTabName']
  resolveProjectAppControlBarSaveButtonColor: I_assembleProjectAppControlBarApiInput['resolveProjectAppControlBarSaveButtonColor']
  resolveShowProjectAppControlBarDeleteButton: I_assembleProjectAppControlBarApiInput['resolveShowProjectAppControlBarDeleteButton']
  resolveShowProjectAppControlBarEditButton: I_assembleProjectAppControlBarApiInput['resolveShowProjectAppControlBarEditButton']
  resolveShowProjectAppControlBarSaveButtons: I_assembleProjectAppControlBarApiInput['resolveShowProjectAppControlBarSaveButtons']
  tabs: I_assembleProjectAppControlBarApiInput['tabs']
}): Pick<
  I_projectAppControlBarComposableApi,
  | 'activeDocumentTab'
  | 'activeDocumentTabName'
  | 'saveDocumentButtonColor'
  | 'showDeleteDocumentButton'
  | 'showDocumentStructureButtons'
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
    return input.resolveShowProjectAppControlBarEditButton({
      activeDocumentTab: activeDocumentTab.value,
      isOnDocumentWorkspaceRoute: input.isOnDocumentWorkspaceRoute.value
    })
  })

  const showSaveDocumentButtons = input.computed(() => {
    return input.resolveShowProjectAppControlBarSaveButtons({
      activeDocumentTab: activeDocumentTab.value,
      isOnDocumentWorkspaceRoute: input.isOnDocumentWorkspaceRoute.value
    })
  })

  const showDocumentStructureButtons = input.computed(() => {
    return showEditDocumentButton.value || showSaveDocumentButtons.value
  })

  const showDeleteDocumentButton = input.computed(() => {
    return input.resolveShowProjectAppControlBarDeleteButton({
      activeDocumentTab: activeDocumentTab.value,
      isOnDocumentWorkspaceRoute: input.isOnDocumentWorkspaceRoute.value
    })
  })

  const saveDocumentButtonColor = input.computed(() => {
    const tab = activeDocumentTab.value
    if (tab === null) {
      return input.resolveProjectAppControlBarSaveButtonColor({
        hasUnsavedChanges: false
      })
    }

    return input.resolveProjectAppControlBarSaveButtonColor({
      hasUnsavedChanges: tab.hasUnsavedChanges
    })
  })

  return {
    activeDocumentTab,
    activeDocumentTabName,
    saveDocumentButtonColor,
    showDeleteDocumentButton,
    showDocumentStructureButtons,
    showEditDocumentButton,
    showSaveDocumentButtons
  }
}
