<template>
  <q-item
    clickable
    class="projectHierarchyTreeNodeContextMenu__item projectHierarchyTreeNodeContextMenu__item--sortByActivator non-selectable"
    data-test-locator="projectHierarchyTree-nodeContextMenu-sortBy"
    role="menuitem"
    @mouseenter="onSortBySubmenuActivatorEnter"
    @mouseleave="onSubmenuActivatorLeave"
  >
    <q-item-section>
      <span class="projectHierarchyTreeNodeContextMenu__primaryLabel">
        {{ sortByLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectHierarchyTreeNodeContextMenu__icon"
        name="keyboard_arrow_right"
      />
    </q-item-section>
    <ProjectHierarchyTreeNodeContextMenuSortBySubmenu
      :is-sort-by-submenu-open="isSortBySubmenuOpen"
      :on-sort-by-item-click="onSortByItemClick"
      :on-sort-by-submenu-model-update="onSortBySubmenuModelUpdate"
      :on-submenu-content-enter="onSubmenuContentEnter"
      :on-submenu-content-leave="onSubmenuContentLeave"
      :resolve-sort-by-item-detail-direction="resolveSortByItemDetailDirection"
      :resolve-sort-by-item-detail-scope="resolveSortByItemDetailScope"
      :resolve-sort-by-item-title="resolveSortByItemTitle"
    />
  </q-item>
</template>

<script setup lang="ts">
import type { T_faProjectHierarchyTreeSortByMenuItemId } from 'app/types/I_faProjectHierarchyTreeDomain'

import ProjectHierarchyTreeNodeContextMenuSortBySubmenu from './ProjectHierarchyTreeNodeContextMenuSortBySubmenu.vue'

defineOptions({
  name: 'ProjectHierarchyTreeNodeContextMenuSortByRow'
})

defineProps<{
  isSortBySubmenuOpen: boolean
  onSortByItemClick: (itemId: T_faProjectHierarchyTreeSortByMenuItemId) => void
  onSortBySubmenuActivatorEnter: () => void
  onSortBySubmenuModelUpdate: (shown: boolean) => void
  onSubmenuActivatorLeave: () => void
  onSubmenuContentEnter: () => void
  onSubmenuContentLeave: () => void
  resolveSortByItemDetailDirection: (itemId: T_faProjectHierarchyTreeSortByMenuItemId) => string
  resolveSortByItemDetailScope: (itemId: T_faProjectHierarchyTreeSortByMenuItemId) => string
  resolveSortByItemTitle: (itemId: T_faProjectHierarchyTreeSortByMenuItemId) => string
  sortByLabel: string
}>()
</script>
