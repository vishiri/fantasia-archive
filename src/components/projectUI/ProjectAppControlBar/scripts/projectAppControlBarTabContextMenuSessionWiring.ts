import { useI18n } from 'vue-i18n'

import type { I_projectAppControlBarTabContextMenuInput } from 'app/types/I_faProjectAppControlBarDomain'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { I_ref } from 'app/types/I_vueCompositionShims'

import { buildProjectAppControlBarTabContextMenuClickHandlers } from '../functions/projectAppControlBarTabContextMenuClickHandlers'
import { buildProjectAppControlBarTabContextMenuLabels } from '../functions/projectAppControlBarTabContextMenuLabels'
import { resolveOpenedDocumentTabIsTemporary } from 'app/src/scripts/openedDocuments/functions/openedDocumentTemporaryDomain'

const PROJECT_APP_CONTROL_BAR_TAB_CONTEXT_MENU_BROWSE_SUBMENU_ROW_INDEX = 0

function createProjectAppControlBarTabContextMenuBrowseSubmenuBindings (input: {
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
      PROJECT_APP_CONTROL_BAR_TAB_CONTEXT_MENU_BROWSE_SUBMENU_ROW_INDEX
  })

  function onBrowseSubmenuActivatorEnter (): void {
    input.submenuHover.onSubmenuActivatorEnter(
      PROJECT_APP_CONTROL_BAR_TAB_CONTEXT_MENU_BROWSE_SUBMENU_ROW_INDEX
    )
  }

  function onBrowseSubmenuModelUpdate (shown: boolean): void {
    input.submenuHover.onSubmenuModelUpdate(
      PROJECT_APP_CONTROL_BAR_TAB_CONTEXT_MENU_BROWSE_SUBMENU_ROW_INDEX,
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

function buildProjectAppControlBarTabContextMenuSessionReturn (input: {
  browseSubmenuBindings: ReturnType<typeof createProjectAppControlBarTabContextMenuBrowseSubmenuBindings>
  clickHandlers: ReturnType<typeof buildProjectAppControlBarTabContextMenuClickHandlers>
  labels: ReturnType<typeof buildProjectAppControlBarTabContextMenuLabels>
  menuInput: I_projectAppControlBarTabContextMenuInput
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
  const copyDocumentLabel = input.labels.copyDocumentLabel
  const copyNameLabel = input.labels.copyNameLabel
  const copyTextColorLabel = input.labels.copyTextColorLabel
  const addNewDocumentUnderThisLabel = input.labels.addNewDocumentUnderThisLabel
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
  const onCopyDocumentClick = input.clickHandlers.onCopyDocumentClick
  const onCopyNameClick = input.clickHandlers.onCopyNameClick
  const onCopyTextColorClick = input.clickHandlers.onCopyTextColorClick
  const onAddNewDocumentUnderThisClick = input.clickHandlers.onAddNewDocumentUnderThisClick
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
    addNewDocumentUnderThisLabel,
    browseOpenedTabsLabel,
    closeAllTabsWithoutChangesExceptThisOneLabel,
    closeAllTabsWithoutChangesLabel,
    closeThisTabLabel,
    copyBackgroundColorLabel,
    copyDocumentLabel,
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
    onCopyDocumentClick,
    onCopyNameClick,
    onCopyTextColorClick,
    onAddNewDocumentUnderThisClick,
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

export function buildProjectAppControlBarTabContextMenuSession (
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
  input: I_projectAppControlBarTabContextMenuInput
) {
  const { t } = deps.useI18n()
  const submenuHover = deps.createAppControlSingleMenuSubmenuHover()
  const labels = buildProjectAppControlBarTabContextMenuLabels({
    computed: deps.computed,
    translateBrowseOpenedTabs: () => t('projectUI.projectAppControlBar.browseOpenedTabs'),
    translateCloseAllTabsWithoutChanges: () => t('projectUI.projectAppControlBar.closeAllTabsWithoutChanges'),
    translateCloseAllTabsWithoutChangesExceptThisOne: () => t('projectUI.projectAppControlBar.closeAllTabsWithoutChangesExceptThisOne'),
    translateCloseThisTab: () => t('projectUI.projectAppControlBar.closeThisTab'),
    translateCopyBackgroundColor: () => t('projectUI.projectAppControlBar.copyBackgroundColor'),
    translateCopyDocument: () => t('projectUI.projectHierarchyTree.contextMenu.copyDocument'),
    translateCopyName: () => t('projectUI.projectAppControlBar.copyName'),
    translateCopyTextColor: () => t('projectUI.projectAppControlBar.copyTextColor'),
    translateAddNewDocumentUnderThis: () => t('projectUI.projectHierarchyTree.contextMenu.addNewDocumentUnderThis'),
    translateDeleteThisDocument: () => t('projectUI.projectAppControlBar.deleteThisDocument'),
    translateForceCloseAllTabs: () => t('projectUI.projectAppControlBar.forceCloseAllTabs'),
    translateForceCloseAllTabsExceptThisOne: () => t('projectUI.projectAppControlBar.forceCloseAllTabsExceptThisOne'),
    translateMoveTabLeft: () => t('projectUI.projectAppControlBar.moveTabLeft'),
    translateMoveTabRight: () => t('projectUI.projectAppControlBar.moveTabRight')
  })
  const clickHandlers = buildProjectAppControlBarTabContextMenuClickHandlers(input)
  const browseSubmenuBindings = createProjectAppControlBarTabContextMenuBrowseSubmenuBindings({
    computed: deps.computed,
    submenuHover
  })

  return buildProjectAppControlBarTabContextMenuSessionReturn({
    browseSubmenuBindings,
    clickHandlers,
    labels,
    menuInput: input
  })
}
