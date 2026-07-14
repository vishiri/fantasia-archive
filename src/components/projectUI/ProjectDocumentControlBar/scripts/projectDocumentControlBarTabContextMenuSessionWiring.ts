import { useI18n } from 'vue-i18n'

import type { I_projectDocumentControlBarTabContextMenuInput } from 'app/types/I_faProjectDocumentControlBarDomain'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { I_ref } from 'app/types/I_vueCompositionShims'

import { buildProjectDocumentControlBarTabContextMenuClickHandlers } from '../functions/projectDocumentControlBarTabContextMenuClickHandlers'
import { buildProjectDocumentControlBarTabContextMenuLabels } from '../functions/projectDocumentControlBarTabContextMenuLabels'
import { resolveOpenedDocumentTabIsTemporary } from 'app/src/scripts/openedDocuments/functions/openedDocumentTemporaryDomain'

const PROJECT_DOCUMENT_CONTROL_BAR_TAB_CONTEXT_MENU_BROWSE_SUBMENU_ROW_INDEX = 0

function createProjectDocumentControlBarTabContextMenuBrowseSubmenuBindings (input: {
  computed: <T>(getter: () => T) => I_computedRef<T>
  submenuHover: {
    onRootMenuHide: () => void
    onSubmenuActivatorEnter: (index: number) => void
    onSubmenuActivatorLeave: () => void
    onSubmenuContentEnter: () => void
    onSubmenuContentLeave: () => void
    onSubmenuModelUpdate: (index: number, shown: boolean) => void
    openSubmenuRowIndex: I_ref<number | null>
  }
}) {
  const isBrowseSubmenuOpen = input.computed(() => {
    return input.submenuHover.openSubmenuRowIndex.value ===
      PROJECT_DOCUMENT_CONTROL_BAR_TAB_CONTEXT_MENU_BROWSE_SUBMENU_ROW_INDEX
  })

  function onBrowseSubmenuActivatorEnter (): void {
    input.submenuHover.onSubmenuActivatorEnter(
      PROJECT_DOCUMENT_CONTROL_BAR_TAB_CONTEXT_MENU_BROWSE_SUBMENU_ROW_INDEX
    )
  }

  function onBrowseSubmenuModelUpdate (shown: boolean): void {
    input.submenuHover.onSubmenuModelUpdate(
      PROJECT_DOCUMENT_CONTROL_BAR_TAB_CONTEXT_MENU_BROWSE_SUBMENU_ROW_INDEX,
      shown
    )
  }

  const onRootMenuHide = input.submenuHover.onRootMenuHide
  const onSubmenuActivatorLeave = input.submenuHover.onSubmenuActivatorLeave
  const onSubmenuContentEnter = input.submenuHover.onSubmenuContentEnter
  const onSubmenuContentLeave = input.submenuHover.onSubmenuContentLeave

  return {
    isBrowseSubmenuOpen,
    onBrowseSubmenuActivatorEnter,
    onBrowseSubmenuModelUpdate,
    onRootMenuHide,
    onSubmenuActivatorLeave,
    onSubmenuContentEnter,
    onSubmenuContentLeave
  }
}

function buildProjectDocumentControlBarTabContextMenuSessionReturn (input: {
  browseSubmenuBindings: ReturnType<typeof createProjectDocumentControlBarTabContextMenuBrowseSubmenuBindings>
  clickHandlers: ReturnType<typeof buildProjectDocumentControlBarTabContextMenuClickHandlers>
  labels: ReturnType<typeof buildProjectDocumentControlBarTabContextMenuLabels>
  menuInput: I_projectDocumentControlBarTabContextMenuInput
}) {
  const openedDocumentTabs = input.menuInput.openedDocumentTabs
  const moveDocumentTabLeftKeybindLabel = input.menuInput.moveDocumentTabLeftKeybindLabel
  const moveDocumentTabRightKeybindLabel = input.menuInput.moveDocumentTabRightKeybindLabel
  const browseOpenedTabsLabel = input.labels.browseOpenedTabsLabel
  const closeAllTabsWithoutChangesExceptThisOneLabel =
    input.labels.closeAllTabsWithoutChangesExceptThisOneLabel
  const closeAllTabsWithoutChangesLabel = input.labels.closeAllTabsWithoutChangesLabel
  const closeThisTabLabel = input.labels.closeThisTabLabel
  const copyBackgroundColorLabel = input.labels.copyBackgroundColorLabel
  const copyNameLabel = input.labels.copyNameLabel
  const copyTextColorLabel = input.labels.copyTextColorLabel
  const deleteThisDocumentLabel = input.labels.deleteThisDocumentLabel
  const forceCloseAllTabsExceptThisOneLabel = input.labels.forceCloseAllTabsExceptThisOneLabel
  const forceCloseAllTabsLabel = input.labels.forceCloseAllTabsLabel
  const moveTabLeftLabel = input.labels.moveTabLeftLabel
  const moveTabRightLabel = input.labels.moveTabRightLabel
  const isBrowseSubmenuOpen = input.browseSubmenuBindings.isBrowseSubmenuOpen
  const onBrowseSubmenuActivatorEnter = input.browseSubmenuBindings.onBrowseSubmenuActivatorEnter
  const onBrowseSubmenuModelUpdate = input.browseSubmenuBindings.onBrowseSubmenuModelUpdate
  const onRootMenuHide = input.browseSubmenuBindings.onRootMenuHide
  const onSubmenuActivatorLeave = input.browseSubmenuBindings.onSubmenuActivatorLeave
  const onSubmenuContentEnter = input.browseSubmenuBindings.onSubmenuContentEnter
  const onSubmenuContentLeave = input.browseSubmenuBindings.onSubmenuContentLeave
  const onCloseAllTabsWithoutChangesClick = input.clickHandlers.onCloseAllTabsWithoutChangesClick
  const onCloseAllTabsWithoutChangesExceptThisOneClick =
    input.clickHandlers.onCloseAllTabsWithoutChangesExceptThisOneClick
  const onCloseThisTabClick = input.clickHandlers.onCloseThisTabClick
  const onCopyBackgroundColorClick = input.clickHandlers.onCopyBackgroundColorClick
  const onCopyNameClick = input.clickHandlers.onCopyNameClick
  const onCopyTextColorClick = input.clickHandlers.onCopyTextColorClick
  const onDeleteThisDocumentClick = input.clickHandlers.onDeleteThisDocumentClick
  const onForceCloseAllTabsClick = input.clickHandlers.onForceCloseAllTabsClick
  const onForceCloseAllTabsExceptThisOneClick =
    input.clickHandlers.onForceCloseAllTabsExceptThisOneClick
  const onMoveTabLeftClick = input.clickHandlers.onMoveTabLeftClick
  const onMoveTabRightClick = input.clickHandlers.onMoveTabRightClick
  const resolveBrowseTabLabel = input.clickHandlers.resolveBrowseTabLabel
  const resolveBrowseTabRoute = input.clickHandlers.resolveBrowseTabRoute
  const showDeleteThisDocument = !resolveOpenedDocumentTabIsTemporary(
    input.menuInput.tab.persistenceState
  )

  return {
    browseOpenedTabsLabel,
    closeAllTabsWithoutChangesExceptThisOneLabel,
    closeAllTabsWithoutChangesLabel,
    closeThisTabLabel,
    copyBackgroundColorLabel,
    copyNameLabel,
    copyTextColorLabel,
    deleteThisDocumentLabel,
    forceCloseAllTabsExceptThisOneLabel,
    forceCloseAllTabsLabel,
    isBrowseSubmenuOpen,
    moveDocumentTabLeftKeybindLabel,
    moveDocumentTabRightKeybindLabel,
    moveTabLeftLabel,
    moveTabRightLabel,
    onBrowseSubmenuActivatorEnter,
    onBrowseSubmenuModelUpdate,
    onCloseAllTabsWithoutChangesClick,
    onCloseAllTabsWithoutChangesExceptThisOneClick,
    onCloseThisTabClick,
    onCopyBackgroundColorClick,
    onCopyNameClick,
    onCopyTextColorClick,
    onDeleteThisDocumentClick,
    onForceCloseAllTabsClick,
    onForceCloseAllTabsExceptThisOneClick,
    onMoveTabLeftClick,
    onMoveTabRightClick,
    onRootMenuHide,
    onSubmenuActivatorLeave,
    onSubmenuContentEnter,
    onSubmenuContentLeave,
    openedDocumentTabs,
    resolveBrowseTabLabel,
    resolveBrowseTabRoute,
    showDeleteThisDocument
  }
}

export function buildProjectDocumentControlBarTabContextMenuSession (
  deps: {
    computed: <T>(getter: () => T) => I_computedRef<T>
    createAppControlSingleMenuSubmenuHover: () => {
      onRootMenuHide: () => void
      onSubmenuActivatorEnter: (index: number) => void
      onSubmenuActivatorLeave: () => void
      onSubmenuContentEnter: () => void
      onSubmenuContentLeave: () => void
      onSubmenuModelUpdate: (index: number, shown: boolean) => void
      openSubmenuRowIndex: I_ref<number | null>
    }
    useI18n: typeof useI18n
  },
  input: I_projectDocumentControlBarTabContextMenuInput
) {
  const { t } = deps.useI18n()
  const submenuHover = deps.createAppControlSingleMenuSubmenuHover()
  const labels = buildProjectDocumentControlBarTabContextMenuLabels({
    computed: deps.computed,
    translateBrowseOpenedTabs: () => t('projectUI.projectDocumentControlBar.browseOpenedTabs'),
    translateCloseAllTabsWithoutChanges: () => t('projectUI.projectDocumentControlBar.closeAllTabsWithoutChanges'),
    translateCloseAllTabsWithoutChangesExceptThisOne: () => t('projectUI.projectDocumentControlBar.closeAllTabsWithoutChangesExceptThisOne'),
    translateCloseThisTab: () => t('projectUI.projectDocumentControlBar.closeThisTab'),
    translateCopyBackgroundColor: () => t('projectUI.projectDocumentControlBar.copyBackgroundColor'),
    translateCopyName: () => t('projectUI.projectDocumentControlBar.copyName'),
    translateCopyTextColor: () => t('projectUI.projectDocumentControlBar.copyTextColor'),
    translateDeleteThisDocument: () => t('projectUI.projectDocumentControlBar.deleteThisDocument'),
    translateForceCloseAllTabs: () => t('projectUI.projectDocumentControlBar.forceCloseAllTabs'),
    translateForceCloseAllTabsExceptThisOne: () => t('projectUI.projectDocumentControlBar.forceCloseAllTabsExceptThisOne'),
    translateMoveTabLeft: () => t('projectUI.projectDocumentControlBar.moveTabLeft'),
    translateMoveTabRight: () => t('projectUI.projectDocumentControlBar.moveTabRight')
  })
  const clickHandlers = buildProjectDocumentControlBarTabContextMenuClickHandlers(input)
  const browseSubmenuBindings = createProjectDocumentControlBarTabContextMenuBrowseSubmenuBindings({
    computed: deps.computed,
    submenuHover
  })

  return buildProjectDocumentControlBarTabContextMenuSessionReturn({
    browseSubmenuBindings,
    clickHandlers,
    labels,
    menuInput: input
  })
}
