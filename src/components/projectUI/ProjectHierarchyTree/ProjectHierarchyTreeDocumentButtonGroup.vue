<template>
  <div
    class="projectHierarchyTreeDocumentButtonGroup"
    data-test-locator="projectHierarchyTree-documentButtonGroup"
  >
    <q-btn
      v-if="props.showsOpen"
      class="projectHierarchyTreeDocumentButtonGroup__button projectHierarchyTreeDocumentButtonGroup__button--open"
      color="dark"
      data-test-locator="projectHierarchyTree-documentButton-open"
      dense
      flat
      icon="mdi-book-open-page-variant-outline"
      round
      size="24px"
      tabindex="-1"
      @auxclick.stop.prevent="onOpenActivate"
      @click.stop.prevent="onOpenActivate"
      @contextmenu.stop.prevent="onOpenActivate"
      @pointerdown.stop="onButtonPointerDown"
    >
      <q-tooltip>
        {{ $t('projectUI.projectHierarchyTree.contextMenu.openDocument') }}
      </q-tooltip>
    </q-btn>
    <q-btn
      v-if="props.showsEdit"
      class="projectHierarchyTreeDocumentButtonGroup__button projectHierarchyTreeDocumentButtonGroup__button--edit"
      color="dark"
      data-test-locator="projectHierarchyTree-documentButton-edit"
      dense
      flat
      icon="mdi-pencil"
      round
      size="24px"
      tabindex="-1"
      @auxclick.stop.prevent="onEditActivate"
      @click.stop.prevent="onEditActivate"
      @contextmenu.stop.prevent="onEditActivate"
      @pointerdown.stop="onButtonPointerDown"
    >
      <q-tooltip>
        {{ $t('projectUI.projectHierarchyTree.contextMenu.editDocument') }}
      </q-tooltip>
    </q-btn>
    <q-btn
      v-if="props.showsAddUnder"
      class="projectHierarchyTreeDocumentButtonGroup__button projectHierarchyTreeDocumentButtonGroup__button--addUnder"
      color="dark"
      data-test-locator="projectHierarchyTree-documentButton-addUnder"
      dense
      flat
      icon="mdi-file-tree"
      round
      size="24px"
      tabindex="-1"
      @auxclick.stop.prevent="onAddUnderActivate"
      @click.stop.prevent="onAddUnderActivate"
      @contextmenu.stop.prevent="onAddUnderActivate"
      @pointerdown.stop="onButtonPointerDown"
    >
      <q-tooltip>
        {{ $t('projectUI.projectHierarchyTree.contextMenu.addNewDocumentUnderThis') }}
      </q-tooltip>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ProjectHierarchyTreeDocumentButtonGroup'
})

const props = defineProps<{
  showsAddUnder: boolean
  showsEdit: boolean
  showsOpen: boolean
}>()

const emit = defineEmits<{
  addUnderActivate: []
  editActivate: []
  openActivate: []
}>()

function onButtonPointerDown (): void {
  // Stops row pointer handling; activation uses click, context menu, or aux click.
}

function onOpenActivate (): void {
  emit('openActivate')
}

function onEditActivate (): void {
  emit('editActivate')
}

function onAddUnderActivate (): void {
  emit('addUnderActivate')
}
</script>

<style lang="scss" src="./styles/ProjectHierarchyTreeDocumentButtonGroup.unscoped.scss"></style>
