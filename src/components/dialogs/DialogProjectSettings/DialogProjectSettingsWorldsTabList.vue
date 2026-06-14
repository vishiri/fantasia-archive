<template>
  <div
    :class="faVerticalDraggableTabsRootClassList"
    class="faVerticalDraggableTabs dialogProjectSettingsWorldsTabList"
  >
    <div
      class="faVerticalDraggableTabs__scroll hasScrollbar"
      data-test-locator="dialogProjectSettings-worlds-list"
    >
      <VueDraggable
        v-bind="faVerticalDraggableTabsSortableDragOptions"
        v-model="draggableWorlds"
        :animation="150"
        :set-data="hideNativeSortableDragGhost"
        :touch-start-threshold="5"
        class="faVerticalDraggableTabs__draggable column"
        @end="onWorldsDragEnd"
        @start="onWorldsDragStart"
      >
        <DialogProjectSettingsWorldsTabItem
          v-for="world in draggableWorlds"
          :key="world.id"
          :is-being-dragged="world.id === draggingWorldId"
          :is-list-dragging="draggingWorldId !== null"
          :is-selected="world.id === props.selectedWorldId"
          :tab-has-error="isWorldTabValidationError(world)"
          :world="world"
          @select="emit('select', $event)"
        />
      </VueDraggable>

      <q-separator class="faVerticalDraggableTabs__divider" />

      <div class="faVerticalDraggableTabs__addButtonRow">
        <q-btn
          outline
          class="faVerticalDraggableTabs__addButton"
          color="primary-bright"
          :label="$t('dialogs.projectSettings.panels.worlds.addWorldButton')"
          data-test-locator="dialogProjectSettings-worlds-addButton"
          @click="emit('addWorld')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import type { SortableEvent } from 'sortablejs'

import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import { isDialogProjectSettingsWorldTabValidationError } from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsWorldsDraft'
import DialogProjectSettingsWorldsTabItem from 'app/src/components/dialogs/DialogProjectSettings/DialogProjectSettingsWorldsTabItem.vue'
import { hideNativeSortableDragGhost } from 'app/src/scripts/faDragDrop/functions/hideNativeSortableDragGhost'
import {
  applyFaVerticalDraggableTabsDocumentDragCursor,
  clearFaVerticalDraggableTabsDocumentDragCursor
} from 'app/src/scripts/faDragDrop/functions/faVerticalDraggableTabsDocumentDragCursor'
import { faVerticalDraggableTabsSortableDragOptions } from 'app/src/scripts/faDragDrop/functions/faVerticalDraggableTabsSortableDragOptions'
import { readFaSortableDragItemDataAttribute } from 'app/src/scripts/faDragDrop/functions/readFaSortableDragItemDataAttribute'

defineOptions({
  name: 'DialogProjectSettingsWorldsTabList'
})

const props = defineProps<{
  selectedWorldId: string | null
  worlds: I_dialogProjectSettingsWorldDraft[]
}>()

const emit = defineEmits<{
  addWorld: []
  select: [id: string]
  'update:worlds': [worlds: I_dialogProjectSettingsWorldDraft[]]
}>()

function cloneWorldDraftList (
  worlds: I_dialogProjectSettingsWorldDraft[]
): I_dialogProjectSettingsWorldDraft[] {
  return worlds.map((world) => ({ ...world }))
}

const draggableWorlds = ref<I_dialogProjectSettingsWorldDraft[]>(
  cloneWorldDraftList(props.worlds)
)

const draggingWorldId = ref<string | null>(null)

const faVerticalDraggableTabsRootClassList = computed(() => ({
  'faVerticalDraggableTabs--listDragging': draggingWorldId.value !== null
}))

watch(
  () => props.worlds,
  (nextWorlds) => {
    draggableWorlds.value = cloneWorldDraftList(nextWorlds)
  },
  { deep: true }
)

function onWorldsDragStart (event: SortableEvent): void {
  draggingWorldId.value = readFaSortableDragItemDataAttribute(
    event.item,
    'data-test-world-id'
  )
  applyFaVerticalDraggableTabsDocumentDragCursor()
}

function onWorldsDragEnd (): void {
  draggingWorldId.value = null
  clearFaVerticalDraggableTabsDocumentDragCursor()
  emit('update:worlds', cloneWorldDraftList(draggableWorlds.value))
}

function isWorldTabValidationError (world: I_dialogProjectSettingsWorldDraft): boolean {
  return isDialogProjectSettingsWorldTabValidationError(world)
}
</script>

<style lang="scss" src="./styles/DialogProjectSettings.worldsTabList.unscoped.scss"></style>
