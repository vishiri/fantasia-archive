import { computed, ref } from 'vue'

import type { I_qMenuViewportPointerPosition } from 'app/types/I_qMenuViewportPointerPosition'
import type { T_faProjectHierarchyTreeSortByMenuItemId } from 'app/types/I_faProjectHierarchyTreeDomain'

import { createAppControlSingleMenuSubmenuHover } from 'app/src/components/globals/AppControlSingleMenu/scripts/appControlSingleMenu_manager'
import { PROJECT_HIERARCHY_TREE_SORT_BY_MENU_ITEMS } from './projectHierarchyTreeSortByMenuItems'
import { resolveProjectHierarchyTreeNodeContextMenuLabels } from './projectHierarchyTreeNodeContextMenuWiring'

const PROJECT_HIERARCHY_TREE_SORT_BY_SUBMENU_ROW_INDEX = 0
const PROJECT_HIERARCHY_TREE_TAG_ADD_SUBMENU_ROW_INDEX = 1

export function resolveProjectHierarchyTreeNodeContextMenuPointerAnchorStyle (
  position: I_qMenuViewportPointerPosition | null
): Record<string, string> {
  if (position === null) {
    return {
      height: '0',
      left: '0',
      opacity: '0',
      pointerEvents: 'none',
      position: 'fixed',
      top: '0',
      width: '0'
    }
  }
  return {
    height: '1px',
    left: `${position.left}px`,
    pointerEvents: 'none',
    position: 'fixed',
    top: `${position.top}px`,
    width: '1px'
  }
}

export function createProjectHierarchyTreeNodeContextMenuUiWiring (deps: {
  t: (key: string) => string
}) {
  const submenuHover = createAppControlSingleMenuSubmenuHover()
  const pointerAnchorRef = ref<HTMLElement | null>(null)
  const isSortBySubmenuOpen = computed(() => {
    return submenuHover.openSubmenuRowIndex.value === PROJECT_HIERARCHY_TREE_SORT_BY_SUBMENU_ROW_INDEX
  })
  const isAddToTagSubmenuOpen = computed(() => {
    return submenuHover.openSubmenuRowIndex.value === PROJECT_HIERARCHY_TREE_TAG_ADD_SUBMENU_ROW_INDEX
  })
  const menuLabels = computed(() => resolveProjectHierarchyTreeNodeContextMenuLabels(deps.t))

  function findSortByMenuItem (itemId: T_faProjectHierarchyTreeSortByMenuItemId) {
    return PROJECT_HIERARCHY_TREE_SORT_BY_MENU_ITEMS.find((item) => {
      return item.id === itemId
    }) as (typeof PROJECT_HIERARCHY_TREE_SORT_BY_MENU_ITEMS)[number]
  }

  function resolveSortByItemTitle (itemId: T_faProjectHierarchyTreeSortByMenuItemId): string {
    return deps.t(findSortByMenuItem(itemId).titleKey)
  }

  function resolveSortByItemDetailDirection (itemId: T_faProjectHierarchyTreeSortByMenuItemId): string {
    return deps.t(findSortByMenuItem(itemId).detailDirectionKey)
  }

  function resolveSortByItemDetailScope (itemId: T_faProjectHierarchyTreeSortByMenuItemId): string {
    return deps.t(findSortByMenuItem(itemId).detailScopeKey)
  }

  function onSortBySubmenuActivatorEnter (): void {
    submenuHover.onSubmenuActivatorEnter(PROJECT_HIERARCHY_TREE_SORT_BY_SUBMENU_ROW_INDEX)
  }

  function onSortBySubmenuModelUpdate (shown: boolean): void {
    submenuHover.onSubmenuModelUpdate(PROJECT_HIERARCHY_TREE_SORT_BY_SUBMENU_ROW_INDEX, shown)
  }

  function onAddToTagSubmenuActivatorEnter (): void {
    submenuHover.onSubmenuActivatorEnter(PROJECT_HIERARCHY_TREE_TAG_ADD_SUBMENU_ROW_INDEX)
  }

  function onAddToTagSubmenuModelUpdate (shown: boolean): void {
    submenuHover.onSubmenuModelUpdate(PROJECT_HIERARCHY_TREE_TAG_ADD_SUBMENU_ROW_INDEX, shown)
  }

  function onRootMenuHide (onHide: () => void): void {
    submenuHover.onRootMenuHide()
    onHide()
  }

  return {
    isAddToTagSubmenuOpen,
    isSortBySubmenuOpen,
    menuLabels,
    onAddToTagSubmenuActivatorEnter,
    onAddToTagSubmenuModelUpdate,
    onRootMenuHide,
    onSortBySubmenuActivatorEnter,
    onSortBySubmenuModelUpdate,
    onSubmenuActivatorLeave: submenuHover.onSubmenuActivatorLeave,
    onSubmenuContentEnter: submenuHover.onSubmenuContentEnter,
    onSubmenuContentLeave: submenuHover.onSubmenuContentLeave,
    pointerAnchorRef,
    resolveSortByItemDetailDirection,
    resolveSortByItemDetailScope,
    resolveSortByItemTitle
  }
}
