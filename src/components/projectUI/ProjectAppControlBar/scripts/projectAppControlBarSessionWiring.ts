import type {
  I_assembleProjectAppControlBarApiInput,
  I_projectAppControlBarComposableApi
} from 'app/types/I_faProjectAppControlBarDomain'

import { buildProjectAppControlBarKeybindTooltipLabels } from '../functions/projectAppControlBarKeybindTooltipLabels'
import { buildProjectAppControlBarFixedStripLeftHandlers } from '../functions/projectAppControlBarFixedStripLeftHandlers'
import {
  buildProjectAppControlBarFixedStripLeftKeybindTooltipLabels
} from '../functions/projectAppControlBarFixedStripLeftKeybindTooltipLabels'
import { buildProjectAppControlBarActiveDocumentStateApi } from './projectAppControlBarActiveDocumentStateWiring'
import { buildProjectAppControlBarEditModeHandlers } from './projectAppControlBarEditModeHandlersWiring'
import { buildProjectAppControlBarTabContextMenuHandlers } from './projectAppControlBarTabContextMenuWiring'
import { buildProjectAppControlBarTabAppearanceChromeApi } from './projectAppControlBarTabAppearanceChromeWiring'
import { buildProjectAppControlBarWorldTabIndicatorApi } from './projectAppControlBarWorldTabIndicatorWiring'

function buildProjectAppControlBarTabHandlers (input: {
  closeAllTabsWithoutChanges: () => void | Promise<void>
  closeTabsWithoutChangesExcept: (exceptDocumentId: string) => void | Promise<void>
  requestDeleteDocument: (documentId: string) => void
  forceCloseAllTabs: () => void | Promise<void>
  forceCloseAllTabsExcept: (exceptDocumentId: string) => void | Promise<void>
  reorderDocumentTabs: (fromIndex: number, toIndex: number) => void
  requestCloseTab: (documentId: string) => void
  resolveDocumentTabLabelFromOpenedTab: I_assembleProjectAppControlBarApiInput['resolveDocumentTabLabelFromOpenedTab']
}): Pick<
  I_projectAppControlBarComposableApi,
  | 'onTabAuxClick'
  | 'onTabCloseClick'
  | 'onTabCloseAllWithoutChangesClick'
  | 'onTabCloseAllWithoutChangesExceptClick'
  | 'onTabDeleteClick'
  | 'onTabForceCloseAllClick'
  | 'onTabForceCloseAllExceptClick'
  | 'onTabReorder'
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

  function onTabReorder (fromIndex: number, toIndex: number): void {
    input.reorderDocumentTabs(fromIndex, toIndex)
  }

  return {
    onTabAuxClick,
    onTabCloseClick,
    onTabCloseAllWithoutChangesClick,
    onTabCloseAllWithoutChangesExceptClick,
    onTabDeleteClick,
    onTabForceCloseAllClick,
    onTabForceCloseAllExceptClick,
    onTabReorder,
    resolveDocumentTabLabel,
    resolveDocumentTabRoute
  }
}

function buildProjectAppControlBarStripVisibilityApi (input: {
  computed: I_assembleProjectAppControlBarApiInput['computed']
  isAppControlBarContentButtonsDisabled: I_assembleProjectAppControlBarApiInput['isAppControlBarContentButtonsDisabled']
  isAppControlBarDisabled: I_assembleProjectAppControlBarApiInput['isAppControlBarDisabled']
  isAppControlBarFunctionButtonsDisabled: I_assembleProjectAppControlBarApiInput['isAppControlBarFunctionButtonsDisabled']
  isAppControlBarGuidesDisabled: I_assembleProjectAppControlBarApiInput['isAppControlBarGuidesDisabled']
  resolveShowAppControlBarStrip: I_assembleProjectAppControlBarApiInput['resolveShowAppControlBarStrip']
}): Pick<
  I_projectAppControlBarComposableApi,
  | 'showAppControlBar'
  | 'showContentButtons'
  | 'showFunctionButtons'
  | 'showGuideButtons'
> {
  const showAppControlBar = input.computed(() => {
    return input.resolveShowAppControlBarStrip({
      disableAppControlBar: input.isAppControlBarDisabled.value
    })
  })

  const showGuideButtons = input.computed(() => {
    return !input.isAppControlBarGuidesDisabled.value
  })

  const showFunctionButtons = input.computed(() => {
    return !input.isAppControlBarFunctionButtonsDisabled.value
  })

  const showContentButtons = input.computed(() => {
    return !input.isAppControlBarContentButtonsDisabled.value
  })

  return {
    showAppControlBar,
    showContentButtons,
    showFunctionButtons,
    showGuideButtons
  }
}

export function assembleProjectAppControlBarApi (
  input: I_assembleProjectAppControlBarApiInput
): I_projectAppControlBarComposableApi {
  const stripVisibilityApi = buildProjectAppControlBarStripVisibilityApi({
    computed: input.computed,
    isAppControlBarContentButtonsDisabled: input.isAppControlBarContentButtonsDisabled,
    isAppControlBarDisabled: input.isAppControlBarDisabled,
    isAppControlBarFunctionButtonsDisabled: input.isAppControlBarFunctionButtonsDisabled,
    isAppControlBarGuidesDisabled: input.isAppControlBarGuidesDisabled,
    resolveShowAppControlBarStrip: input.resolveShowAppControlBarStrip
  })

  const showAppNoteboardContentDot = input.computed(() => {
    return input.noteboardHasContent(input.appNoteboardText.value)
  })

  const showProjectNoteboardContentDot = input.computed(() => {
    return input.hasActiveProject.value &&
      input.noteboardHasContent(input.projectNoteboardText.value)
  })

  const showDocumentTabs = input.computed(() => {
    return input.resolveShowDocumentTabs(input.tabs.value.length)
  })

  const worldTabIndicatorApi = buildProjectAppControlBarWorldTabIndicatorApi({
    computed: input.computed,
    projectWorlds: input.projectWorlds
  })

  const activeDocumentStateApi = buildProjectAppControlBarActiveDocumentStateApi({
    activeDocumentId: input.activeDocumentId,
    computed: input.computed,
    isOnDocumentWorkspaceRoute: input.isOnDocumentWorkspaceRoute,
    resolveActiveDocumentTabName: input.resolveActiveDocumentTabName,
    resolveProjectAppControlBarSaveButtonColor: input.resolveProjectAppControlBarSaveButtonColor,
    resolveShowProjectAppControlBarDeleteButton: input.resolveShowProjectAppControlBarDeleteButton,
    resolveShowProjectAppControlBarEditButton: input.resolveShowProjectAppControlBarEditButton,
    resolveShowProjectAppControlBarSaveButtons: input.resolveShowProjectAppControlBarSaveButtons,
    tabs: input.tabs
  })

  const tabHandlers = buildProjectAppControlBarTabHandlers({
    closeAllTabsWithoutChanges: input.closeAllTabsWithoutChanges,
    closeTabsWithoutChangesExcept: input.closeTabsWithoutChangesExcept,
    requestDeleteDocument: input.requestDeleteDocument,
    forceCloseAllTabs: input.forceCloseAllTabs,
    forceCloseAllTabsExcept: input.forceCloseAllTabsExcept,
    reorderDocumentTabs: input.reorderDocumentTabs,
    requestCloseTab: input.requestCloseTab,
    resolveDocumentTabLabelFromOpenedTab: input.resolveDocumentTabLabelFromOpenedTab
  })

  const editModeHandlers = buildProjectAppControlBarEditModeHandlers({
    activeDocumentId: input.activeDocumentId,
    enterDocumentEditMode: input.enterDocumentEditMode,
    requestDeleteDocument: input.requestDeleteDocument,
    runFaAction: input.runFaAction
  })

  const keybindTooltipLabels = buildProjectAppControlBarKeybindTooltipLabels({
    computed: input.computed,
    formatFaKeybindCommandLabelFromSnapshot: input.formatFaKeybindCommandLabelFromSnapshot,
    getKeybindsSnapshot: input.getKeybindsSnapshot
  })

  const fixedStripLeftKeybindTooltipLabels = buildProjectAppControlBarFixedStripLeftKeybindTooltipLabels({
    computed: input.computed,
    formatFaKeybindCommandLabelFromSnapshot: input.formatFaKeybindCommandLabelFromSnapshot,
    getKeybindsSnapshot: input.getKeybindsSnapshot
  })

  const fixedStripLeftHandlers = buildProjectAppControlBarFixedStripLeftHandlers({
    runFaAction: input.runFaAction
  })

  const tabAppearanceChromeApi = buildProjectAppControlBarTabAppearanceChromeApi()

  const contextMenuHandlers = buildProjectAppControlBarTabContextMenuHandlers({
    findTabByDocumentId: input.findTabByDocumentId,
    moveDocumentTab: input.moveDocumentTab,
    resolveDocumentTabLabelFromOpenedTab: input.resolveDocumentTabLabelFromOpenedTab,
    runFaAction: input.runFaAction
  })

  const openedDocumentTabs = input.tabs
  const hideHierarchyTree = input.hideHierarchyTree
  const hideTabCloseButton = input.hideTabCloseButton
  const showTabBarScrollButtons = input.showTabBarScrollButtons

  return {
    openedDocumentTabs,
    ...stripVisibilityApi,
    showDocumentTabs,
    showAppNoteboardContentDot,
    showProjectNoteboardContentDot,
    hideHierarchyTree,
    hideTabCloseButton,
    showTabBarScrollButtons,
    ...activeDocumentStateApi,
    ...worldTabIndicatorApi,
    ...tabAppearanceChromeApi,
    ...keybindTooltipLabels,
    ...fixedStripLeftKeybindTooltipLabels,
    ...fixedStripLeftHandlers,
    ...tabHandlers,
    ...editModeHandlers,
    ...contextMenuHandlers
  }
}
