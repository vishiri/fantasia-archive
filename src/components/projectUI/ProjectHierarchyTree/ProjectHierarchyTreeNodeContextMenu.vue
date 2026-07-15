<template>
  <div
    ref="pointerAnchorRef"
    class="projectHierarchyTreeNodeContextMenu__pointerAnchor"
    :style="pointerAnchorStyle"
  />
  <q-menu
    v-model="isOpenModel"
    anchor="top left"
    class="projectHierarchyTreeNodeContextMenu"
    dark
    data-test-locator="projectHierarchyTree-nodeContextMenu"
    :data-test-hierarchy-node-id="anchorNodeId ?? undefined"
    no-parent-event
    role="menu"
    self="top left"
    :target="pointerAnchorRef ?? undefined"
    @hide="onHide"
  >
    <q-list class="projectHierarchyTreeNodeContextMenu__list">
      <template v-if="showsBulkExpandRows">
        <q-item
          v-close-popup
          clickable
          class="projectHierarchyTreeNodeContextMenu__item non-selectable"
          data-test-locator="projectHierarchyTree-nodeContextMenu-expandAll"
          role="menuitem"
          @click="onExpandAllClick"
        >
          <q-item-section>
            <span class="projectHierarchyTreeNodeContextMenu__primaryLabel">
              {{ menuLabels.expandAllUnderNodeLabel }}
            </span>
          </q-item-section>
          <q-item-section avatar>
            <q-icon
              class="projectHierarchyTreeNodeContextMenu__icon"
              name="mdi-expand-all-outline"
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
          class="projectHierarchyTreeNodeContextMenu__item non-selectable"
          data-test-locator="projectHierarchyTree-nodeContextMenu-collapseAll"
          role="menuitem"
          @click="onCollapseAllClick"
        >
          <q-item-section>
            <span class="projectHierarchyTreeNodeContextMenu__primaryLabel">
              {{ menuLabels.collapseAllUnderNodeLabel }}
            </span>
          </q-item-section>
          <q-item-section avatar>
            <q-icon
              class="projectHierarchyTreeNodeContextMenu__icon"
              name="mdi-collapse-all-outline"
            />
          </q-item-section>
        </q-item>
      </template>
      <template v-if="showsAddNewRow">
        <q-separator
          v-if="showsBulkExpandRows"
          class="projectHierarchyTreeNodeContextMenu__separator"
          dark
          role="separator"
        />
        <q-item
          v-close-popup
          clickable
          class="projectHierarchyTreeNodeContextMenu__item non-selectable"
          data-test-locator="projectHierarchyTree-nodeContextMenu-addNew"
          role="menuitem"
          @click="onAddNewClick"
        >
          <q-item-section>
            <span class="projectHierarchyTreeNodeContextMenu__primaryLabel">
              {{ addNewRowLabel }}
            </span>
          </q-item-section>
          <q-item-section avatar>
            <q-icon
              class="projectHierarchyTreeNodeContextMenu__icon"
              :name="addNewRowIcon ?? undefined"
            />
          </q-item-section>
        </q-item>
      </template>
      <template v-if="showsCopyRows">
        <q-separator
          v-if="showsBulkExpandRows || showsAddNewRow"
          class="projectHierarchyTreeNodeContextMenu__separator"
          dark
          role="separator"
        />
        <ProjectHierarchyTreeNodeContextMenuCopyRows
          :copy-background-color-label="menuLabels.copyBackgroundColorLabel"
          :copy-name-label="menuLabels.copyNameLabel"
          :copy-text-color-label="menuLabels.copyTextColorLabel"
          :on-copy-background-color-click="onCopyBackgroundColorClick"
          :on-copy-name-click="onCopyNameClick"
          :on-copy-text-color-click="onCopyTextColorClick"
        />
        <q-separator
          class="projectHierarchyTreeNodeContextMenu__separator"
          dark
          role="separator"
        />
        <ProjectHierarchyTreeNodeContextMenuDocumentRows
          :add-new-document-under-this-label="menuLabels.addNewDocumentUnderThisLabel"
          :copy-document-label="menuLabels.copyDocumentLabel"
          :edit-document-label="menuLabels.editDocumentLabel"
          :on-add-new-document-under-this-click="onAddNewDocumentUnderThisClick"
          :on-copy-document-click="onCopyDocumentClick"
          :on-edit-document-click="onEditDocumentClick"
          :on-open-document-click="onOpenDocumentClick"
          :open-document-label="menuLabels.openDocumentLabel"
        />
        <q-separator
          class="projectHierarchyTreeNodeContextMenu__separator"
          dark
          role="separator"
        />
        <ProjectHierarchyTreeNodeContextMenuDeleteRow
          :delete-document-label="menuLabels.deleteDocumentLabel"
          :on-delete-document-click="onDeleteDocumentClick"
        />
      </template>
    </q-list>
  </q-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type { I_qMenuViewportPointerPosition } from 'app/types/I_qMenuViewportPointerPosition'

import ProjectHierarchyTreeNodeContextMenuCopyRows from './ProjectHierarchyTreeNodeContextMenuCopyRows.vue'
import ProjectHierarchyTreeNodeContextMenuDeleteRow from './ProjectHierarchyTreeNodeContextMenuDeleteRow.vue'
import ProjectHierarchyTreeNodeContextMenuDocumentRows from './ProjectHierarchyTreeNodeContextMenuDocumentRows.vue'
import { resolveProjectHierarchyTreeNodeContextMenuLabels } from './scripts/projectHierarchyTreeNodeContextMenuLabelsWiring'

defineOptions({
  name: 'ProjectHierarchyTreeNodeContextMenu'
})

const props = defineProps<{
  addNewRowIcon: string | null
  addNewRowLabel: string | null
  anchorNodeId: string | null
  menuPointerPosition: I_qMenuViewportPointerPosition | null
  onAddNewClick: () => void
  onAddNewDocumentUnderThisClick: () => void
  onCollapseAllClick: () => void
  onCopyBackgroundColorClick: () => void
  onCopyDocumentClick: () => void
  onCopyNameClick: () => void
  onCopyTextColorClick: () => void
  onDeleteDocumentClick: () => void
  onEditDocumentClick: () => void
  onExpandAllClick: () => void
  onHide: () => void
  onOpenDocumentClick: () => void
  showsBulkExpandRows: boolean
  showsCopyRows: boolean
}>()

const isOpenModel = defineModel<boolean>('isOpen', {
  required: true
})

const { t } = useI18n()

const pointerAnchorRef = ref<HTMLElement | null>(null)

const menuLabels = computed(() => resolveProjectHierarchyTreeNodeContextMenuLabels(t))

const showsAddNewRow = computed(() => {
  return props.addNewRowLabel !== null && props.addNewRowIcon !== null
})

const pointerAnchorStyle = computed((): Record<string, string> => {
  const position = props.menuPointerPosition
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
})

const onAddNewClick = props.onAddNewClick
const onAddNewDocumentUnderThisClick = props.onAddNewDocumentUnderThisClick
const onCollapseAllClick = props.onCollapseAllClick
const onCopyBackgroundColorClick = props.onCopyBackgroundColorClick
const onCopyDocumentClick = props.onCopyDocumentClick
const onCopyNameClick = props.onCopyNameClick
const onCopyTextColorClick = props.onCopyTextColorClick
const onDeleteDocumentClick = props.onDeleteDocumentClick
const onEditDocumentClick = props.onEditDocumentClick
const onExpandAllClick = props.onExpandAllClick
const onHide = props.onHide
const onOpenDocumentClick = props.onOpenDocumentClick
</script>

<style lang="scss" src="./styles/ProjectHierarchyTreeNodeContextMenu.unscoped.scss"></style>
