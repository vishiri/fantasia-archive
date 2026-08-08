<template>
  <q-item
    clickable
    class="projectHierarchyTreeNodeContextMenu__item projectHierarchyTreeNodeContextMenu__item--tagAddActivator non-selectable"
    data-test-locator="projectHierarchyTree-nodeContextMenu-addNewDocumentToThisTag"
    role="menuitem"
    @mouseenter="onAddToTagSubmenuActivatorEnter"
    @mouseleave="onSubmenuActivatorLeave"
  >
    <q-item-section>
      <span class="projectHierarchyTreeNodeContextMenu__primaryLabel">
        {{ addNewDocumentToThisTagLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectHierarchyTreeNodeContextMenu__icon fa-color-glyph"
        name="keyboard_arrow_right"
      />
    </q-item-section>
    <q-menu
      :model-value="isAddToTagSubmenuOpen"
      anchor="top end"
      class="projectHierarchyTreeNodeContextMenu__tagAddSubmenu"
      dark
      data-test-locator="projectHierarchyTree-nodeContextMenu-addNewDocumentToThisTagSubmenu"
      role="menu"
      self="top start"
      transition-hide="jump-left"
      transition-show="jump-right"
      @mouseenter="onSubmenuContentEnter"
      @mouseleave="onSubmenuContentLeave"
      @update:model-value="onAddToTagSubmenuModelUpdate"
    >
      <q-list
        class="projectHierarchyTreeNodeContextMenu__list"
        dark
        role="none"
      >
        <template
          v-for="(placement, placementIndex) in addDocumentPlacementOptions"
          :key="placement.nodeId"
        >
          <q-separator
            v-if="contextMenuShouldShowSeparatorAltBeforeIndex(placementIndex)"
            class="projectHierarchyTreeNodeContextMenu__separatorAlt"
            dark
            role="separator"
          />
          <q-item
            v-close-popup
            clickable
            class="projectHierarchyTreeNodeContextMenu__item non-selectable"
            :data-test-locator="`projectHierarchyTree-nodeContextMenu-addNewDocumentToThisTag-${placement.nodeId}`"
            role="menuitem"
            @click="onAddNewDocumentToThisTagClick(placement.nodeId)"
          >
            <q-item-section>
              <span class="projectHierarchyTreeNodeContextMenu__primaryLabel">
                {{ placement.label }}
              </span>
            </q-item-section>
            <q-item-section avatar>
              <q-icon
                class="projectHierarchyTreeNodeContextMenu__icon fa-color-glyph"
                :name="placement.icon"
              />
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-menu>
  </q-item>

  <q-separator
    class="projectHierarchyTreeNodeContextMenu__separatorAlt"
    dark
    role="separator"
  />

  <q-item
    v-close-popup
    clickable
    class="projectHierarchyTreeNodeContextMenu__item non-selectable"
    data-test-locator="projectHierarchyTree-nodeContextMenu-renameTag"
    role="menuitem"
    @click="onRenameTagClick"
  >
    <q-item-section>
      <span class="projectHierarchyTreeNodeContextMenu__primaryLabel">
        {{ renameTagLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectHierarchyTreeNodeContextMenu__icon fa-color-glyph"
        name="mdi-tag"
      />
    </q-item-section>
  </q-item>

  <q-separator
    class="projectHierarchyTreeNodeContextMenu__separatorAlt"
    dark
    role="separator"
  />

  <q-item
    v-close-popup
    clickable
    class="projectHierarchyTreeNodeContextMenu__item text-secondary non-selectable"
    data-test-locator="projectHierarchyTree-nodeContextMenu-deleteTag"
    role="menuitem"
    @click="onDeleteTagClick"
  >
    <q-item-section>
      <span class="projectHierarchyTreeNodeContextMenu__primaryLabel">
        {{ deleteTagLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectHierarchyTreeNodeContextMenu__icon fa-color-glyph"
        name="mdi-tag-off"
      />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import type { I_faProjectHierarchyTreeTagAddDocumentPlacementOption } from 'app/types/I_faProjectHierarchyTreeDomain'
import { contextMenuShouldShowSeparatorAltBeforeIndex } from 'app/src/components/globals/AppControlMenus/scripts/functions/contextMenuShouldShowSeparatorAltBeforeItem'

defineOptions({
  name: 'ProjectHierarchyTreeNodeContextMenuTagRows'
})

defineProps<{
  addDocumentPlacementOptions: readonly I_faProjectHierarchyTreeTagAddDocumentPlacementOption[]
  addNewDocumentToThisTagLabel: string
  deleteTagLabel: string
  isAddToTagSubmenuOpen: boolean
  onAddNewDocumentToThisTagClick: (placementNodeId: string) => void
  onAddToTagSubmenuActivatorEnter: () => void
  onAddToTagSubmenuModelUpdate: (shown: boolean) => void
  onDeleteTagClick: () => void
  onRenameTagClick: () => void
  onSubmenuActivatorLeave: () => void
  onSubmenuContentEnter: () => void
  onSubmenuContentLeave: () => void
  renameTagLabel: string
}>()
</script>
