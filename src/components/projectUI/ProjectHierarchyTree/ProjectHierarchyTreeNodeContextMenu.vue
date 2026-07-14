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
            {{ expandAllUnderNodeLabel }}
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
            {{ collapseAllUnderNodeLabel }}
          </span>
        </q-item-section>
        <q-item-section avatar>
          <q-icon
            class="projectHierarchyTreeNodeContextMenu__icon"
            name="mdi-collapse-all-outline"
          />
        </q-item-section>
      </q-item>
      <template v-if="showsAddNewRow">
        <q-separator
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
    </q-list>
  </q-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type { I_qMenuViewportPointerPosition } from 'app/types/I_qMenuViewportPointerPosition'

defineOptions({
  name: 'ProjectHierarchyTreeNodeContextMenu'
})

const props = defineProps<{
  addNewRowIcon: string | null
  addNewRowLabel: string | null
  anchorNodeId: string | null
  menuPointerPosition: I_qMenuViewportPointerPosition | null
  onAddNewClick: () => void
  onCollapseAllClick: () => void
  onExpandAllClick: () => void
  onHide: () => void
}>()

const isOpenModel = defineModel<boolean>('isOpen', {
  required: true
})

const { t } = useI18n()

const pointerAnchorRef = ref<HTMLElement | null>(null)

const expandAllUnderNodeLabel = computed(() => {
  return t('projectUI.projectHierarchyTree.contextMenu.expandAllUnderNode')
})

const collapseAllUnderNodeLabel = computed(() => {
  return t('projectUI.projectHierarchyTree.contextMenu.collapseAllUnderNode')
})

const showsAddNewRow = computed(() => {
  return props.addNewRowLabel !== null && props.addNewRowIcon !== null
})

const anchorNodeId = computed(() => {
  return props.anchorNodeId
})

const addNewRowIcon = computed(() => {
  return props.addNewRowIcon
})

const addNewRowLabel = computed(() => {
  return props.addNewRowLabel
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
const onCollapseAllClick = props.onCollapseAllClick
const onExpandAllClick = props.onExpandAllClick
const onHide = props.onHide
</script>

<style lang="scss" src="./styles/ProjectHierarchyTreeNodeContextMenu.unscoped.scss"></style>
