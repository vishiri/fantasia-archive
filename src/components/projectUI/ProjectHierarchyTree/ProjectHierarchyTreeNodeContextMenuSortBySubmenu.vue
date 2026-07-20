<template>
  <q-menu
    :model-value="isSortBySubmenuOpen"
    anchor="top end"
    class="projectHierarchyTreeNodeContextMenu__sortBySubmenu"
    dark
    data-test-locator="projectHierarchyTree-nodeContextMenu-sortBySubmenu"
    role="menu"
    self="top start"
    transition-hide="jump-left"
    transition-show="jump-right"
    @mouseenter="onSubmenuContentEnter"
    @mouseleave="onSubmenuContentLeave"
    @update:model-value="onSortBySubmenuModelUpdate"
  >
    <q-list
      class="projectHierarchyTreeNodeContextMenu__list"
      dark
      role="none"
    >
      <template
        v-for="item in sortByMenuItems"
        :key="item.id"
      >
        <q-separator
          v-if="item.separatorBefore === 'alt'"
          class="projectHierarchyTreeNodeContextMenu__separatorAlt"
          dark
          role="separator"
        />
        <q-separator
          v-else-if="item.separatorBefore === 'group'"
          class="projectHierarchyTreeNodeContextMenu__separator"
          dark
          role="separator"
        />
        <q-item
          v-close-popup
          clickable
          class="projectHierarchyTreeNodeContextMenu__item non-selectable"
          :data-test-locator="`projectHierarchyTree-nodeContextMenu-sortBy-${item.id}`"
          role="menuitem"
          @click="onSortByItemClick(item.id)"
        >
          <q-item-section>
            <span class="projectHierarchyTreeNodeContextMenu__primaryLabel">
              {{ resolveSortByItemTitle(item.id) }}
            </span>
            <span class="projectHierarchyTreeNodeContextMenu__sortByDetail">{{ resolveSortByItemDetailDirection(item.id) }} | {{ resolveSortByItemDetailScope(item.id) }}</span>
          </q-item-section>
        </q-item>
      </template>
    </q-list>
  </q-menu>
</template>

<script setup lang="ts">
import type { T_faProjectHierarchyTreeSortByMenuItemId } from 'app/types/I_faProjectHierarchyTreeDomain'

import { PROJECT_HIERARCHY_TREE_SORT_BY_MENU_ITEMS } from './scripts/projectHierarchyTreeSortByMenuItems'

defineOptions({
  name: 'ProjectHierarchyTreeNodeContextMenuSortBySubmenu'
})

defineProps<{
  isSortBySubmenuOpen: boolean
  onSortByItemClick: (itemId: T_faProjectHierarchyTreeSortByMenuItemId) => void
  onSortBySubmenuModelUpdate: (shown: boolean) => void
  onSubmenuContentEnter: () => void
  onSubmenuContentLeave: () => void
  resolveSortByItemDetailDirection: (itemId: T_faProjectHierarchyTreeSortByMenuItemId) => string
  resolveSortByItemDetailScope: (itemId: T_faProjectHierarchyTreeSortByMenuItemId) => string
  resolveSortByItemTitle: (itemId: T_faProjectHierarchyTreeSortByMenuItemId) => string
}>()

const sortByMenuItems = PROJECT_HIERARCHY_TREE_SORT_BY_MENU_ITEMS
</script>
