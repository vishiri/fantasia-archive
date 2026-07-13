<template>
  <q-menu
    v-model="isOpenModel"
    anchor="bottom left"
    class="projectHierarchyTreeNodeContextMenu"
    dark
    data-test-locator="projectHierarchyTree-nodeContextMenu"
    :data-test-hierarchy-node-id="anchorNodeId ?? undefined"
    no-parent-event
    role="menu"
    self="top left"
    square
    :target="menuTargetElement ?? undefined"
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
    </q-list>
  </q-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'ProjectHierarchyTreeNodeContextMenu'
})

const props = defineProps<{
  anchorNodeId: string | null
  menuTargetElement: HTMLElement | null
  onCollapseAllClick: () => void
  onExpandAllClick: () => void
  onHide: () => void
}>()

const isOpenModel = defineModel<boolean>('isOpen', {
  required: true
})

const { t } = useI18n()

const expandAllUnderNodeLabel = computed(() => {
  return t('projectUI.projectHierarchyTree.contextMenu.expandAllUnderNode')
})

const collapseAllUnderNodeLabel = computed(() => {
  return t('projectUI.projectHierarchyTree.contextMenu.collapseAllUnderNode')
})

const anchorNodeId = computed(() => {
  return props.anchorNodeId
})

const menuTargetElement = computed(() => {
  return props.menuTargetElement
})

const onCollapseAllClick = props.onCollapseAllClick
const onExpandAllClick = props.onExpandAllClick
const onHide = props.onHide
</script>

<style lang="scss" src="./styles/ProjectHierarchyTreeNodeContextMenu.unscoped.scss"></style>
