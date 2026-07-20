import type { CSSProperties } from 'vue'

import type { I_faDocumentAppearanceChromeStyle } from 'app/types/I_faDocumentAppearanceChromeStyle'
import type {
  I_assembleProjectAppControlBarApiInput,
  I_projectAppControlBarComposableApi
} from 'app/types/I_faProjectAppControlBarDomain'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import { buildProjectAppControlBarKeybindTooltipLabels } from '../functions/projectAppControlBarKeybindTooltipLabels'
import { buildProjectAppControlBarFixedStripLeftHandlers } from '../functions/projectAppControlBarFixedStripLeftHandlers'
import {
  buildProjectAppControlBarFixedStripLeftKeybindTooltipLabels
} from '../functions/projectAppControlBarFixedStripLeftKeybindTooltipLabels'
import { buildProjectAppControlBarActiveDocumentStateApi } from './projectAppControlBarActiveDocumentStateWiring'
import { buildProjectAppControlBarEditModeHandlers } from './projectAppControlBarEditModeHandlersWiring'
import { buildProjectAppControlBarTabContextMenuHandlers } from './projectAppControlBarTabContextMenuWiring'
import {
  resolveProjectAppControlBarTabAppearanceChrome,
  resolveProjectAppControlBarTabInlineStyle
} from './projectAppControlBarTabAppearanceChromeWiring'
import { resolveProjectAppControlBarTabDisplayIcon } from '../functions/projectAppControlBarTabDisplayIcon'
import { buildProjectAppControlBarWorldTabIndicatorApi } from './projectAppControlBarWorldTabIndicatorWiring'

function buildProjectAppControlBarTabAppearanceChromeApi (): Pick<
  I_projectAppControlBarComposableApi,
  | 'resolveDocumentTabAppearanceChrome'
  | 'resolveDocumentTabDisplayIcon'
  | 'resolveDocumentTabInlineStyle'
> {
  function resolveDocumentTabAppearanceChrome (
    tab: I_faOpenedDocumentTab
  ): I_faDocumentAppearanceChromeStyle | undefined {
    return resolveProjectAppControlBarTabAppearanceChrome(tab)
  }

  function resolveDocumentTabDisplayIcon (tab: I_faOpenedDocumentTab): string {
    return resolveProjectAppControlBarTabDisplayIcon(tab)
  }

  function resolveDocumentTabInlineStyle (
    tab: I_faOpenedDocumentTab
  ): CSSProperties | undefined {
    return resolveProjectAppControlBarTabInlineStyle(tab)
  }

  return {
    resolveDocumentTabAppearanceChrome,
    resolveDocumentTabDisplayIcon,
    resolveDocumentTabInlineStyle
  }
}

function buildProjectAppControlBarTabHandlers (input: {
  closeAllTabsWithoutChanges: () => void | Promise<void>
  closeTabsWithoutChangesExcept: (exceptDocumentId: string) => void | Promise<void>
  requestDeleteDocument: (documentId: string) => void
  forceCloseAllTabs: () => void | Promise<void>
  forceCloseAllTabsExcept: (exceptDocumentId: string) => void | Promise<void>
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

export function assembleProjectAppControlBarApi (
  input: I_assembleProjectAppControlBarApiInput
): I_projectAppControlBarComposableApi {
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

  return {
    openedDocumentTabs: input.tabs,
    showAppControlBar,
    showDocumentTabs,
    showGuideButtons,
    showFunctionButtons,
    showContentButtons,
    hideHierarchyTree: input.hideHierarchyTree,
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
