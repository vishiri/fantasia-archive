<template>
  <div
    :class="faVerticalDraggableTabsRootClassList"
    :style="tabListRootStyle"
    class="faVerticalDraggableTabs dialogProjectSettingsWorldsTabList"
    :data-test-layout-width="String(props.tabListWidthPx)"
  >
    <div class="faVerticalDraggableTabs__filterRow">
      <DialogProjectSettingsVerticalTabListFilterInput
        v-model="filterQuery"
        stretch-to-column-edge
        aria-label-key="dialogs.projectSettings.panels.worlds.filterAriaLabel"
        clear-aria-label-key="dialogs.projectSettings.panels.worlds.filterClearAriaLabel"
        placeholder-key="dialogs.projectSettings.panels.worlds.filterPlaceholder"
        test-locator-clear="dialogProjectSettings-worldsFilterClear"
        test-locator-input="dialogProjectSettings-worldsFilterInput"
      />
    </div>

    <div
      ref="tabListScrollRef"
      class="faVerticalDraggableTabs__scroll"
      data-test-locator="dialogProjectSettings-worlds-list"
    >
      <VueDraggable
        v-bind="faVerticalDraggableTabsSortableDragOptions"
        v-model="sortableWorlds"
        :animation="150"
        :set-data="hideNativeSortableDragGhost"
        :touch-start-threshold="5"
        class="faVerticalDraggableTabs__draggable column"
        @end="onWorldsDragEnd"
        @start="onWorldsDragStart"
      >
        <DialogProjectSettingsWorldsTabItem
          v-for="world in sortableWorlds"
          :key="world.id"
          :current-language-code="props.currentLanguageCode"
          :is-being-dragged="world.id === draggingWorldId"
          :is-list-dragging="draggingWorldId !== null"
          :is-selected="world.id === props.selectedWorldId"
          :tab-has-error="isWorldTabValidationError(world)"
          :world="world"
          @select="emit('select', $event)"
        />
      </VueDraggable>
      <div
        v-if="showFilterEmpty"
        class="dialogProjectSettingsWorldsTabList__filterEmpty fa-text-muted"
        data-test-locator="dialogProjectSettings-worldsFilterEmpty"
      >
        {{ $t('dialogs.projectSettings.panels.worlds.emptyFilteredWorlds') }}
      </div>
    </div>

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
</template>

<script setup lang="ts">
// faVerticalDraggableTabs column host — layout props and drag wiring documented in
// .cursor/skills/fantasia-drag-drop/SKILL.md (Vertical draggable tab strips).
import { ref, watch, computed, nextTick } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import type { SortableEvent } from 'sortablejs'

import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import type {
  T_faVerticalDraggableTabsTabJustifyContent,
  T_faVerticalDraggableTabsTabLabelTextTransform,
  T_faVerticalDraggableTabsTabTextAlign
} from 'app/types/I_faVerticalDraggableTabs'
import { FA_DIALOG_PROJECT_SETTINGS_VERTICAL_TAB_LIST_WIDTH_PX_DEFAULT } from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsDialogInput'
import { isDialogProjectSettingsWorldTabValidationError } from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsWorldsSaveValidation'
import {
  FA_VERTICAL_DRAGGABLE_TABS_TAB_JUSTIFY_CONTENT_DEFAULT,
  FA_VERTICAL_DRAGGABLE_TABS_TAB_LABEL_FONT_SIZE_DEFAULT,
  FA_VERTICAL_DRAGGABLE_TABS_TAB_LABEL_TEXT_TRANSFORM_DEFAULT,
  FA_VERTICAL_DRAGGABLE_TABS_TAB_PADDING_DEFAULT,
  FA_VERTICAL_DRAGGABLE_TABS_TAB_TEXT_ALIGN_DEFAULT,
  buildFaVerticalDraggableTabsRootStyle
} from 'app/src/scripts/faDragDrop/functions/buildFaVerticalDraggableTabsRootStyle'
import DialogProjectSettingsVerticalTabListFilterInput from 'app/src/components/dialogs/DialogProjectSettings/DialogProjectSettingsVerticalTabListFilterInput.vue'
import DialogProjectSettingsWorldsTabItem from 'app/src/components/dialogs/DialogProjectSettings/DialogProjectSettingsWorldsTabItem.vue'
import { filterDialogProjectSettingsWorldsByQuery } from './scripts/filterDialogProjectSettingsWorldsByQuery'
import { createDialogProjectSettingsFilteredVerticalTabListSortableWiring } from './scripts/dialogProjectSettingsFilteredVerticalTabListSortableWiring'
import { hideNativeSortableDragGhost } from 'app/src/scripts/faDragDrop/functions/hideNativeSortableDragGhost'
import {
  applyFaVerticalDraggableTabsDocumentDragCursor,
  clearFaVerticalDraggableTabsDocumentDragCursor
} from 'app/src/scripts/faDragDrop/functions/faVerticalDraggableTabsDocumentDragCursor'
import { faVerticalDraggableTabsSortableDragOptions } from 'app/src/scripts/faDragDrop/functions/faVerticalDraggableTabsSortableDragOptions'
import { readFaSortableDragItemDataAttribute } from 'app/src/scripts/faDragDrop/functions/readFaSortableDragItemDataAttribute'
import { createDialogProjectSettingsScrollOnAppendWatch } from './scripts/dialogProjectSettingsScrollOnAppendWiring'

defineOptions({
  name: 'DialogProjectSettingsWorldsTabList'
})

const props = withDefaults(defineProps<{
  currentLanguageCode: T_faUserSettingsLanguageCode
  dense?: boolean
  documentTemplates: I_dialogProjectSettingsDocumentTemplateDraft[] | null
  selectedWorldId: string | null
  tabJustifyContent?: T_faVerticalDraggableTabsTabJustifyContent
  tabLabelFontSize?: string
  tabLabelTextTransform?: T_faVerticalDraggableTabsTabLabelTextTransform
  tabListWidthPx?: number
  tabPadding?: string
  tabTextAlign?: T_faVerticalDraggableTabsTabTextAlign
  worlds: I_dialogProjectSettingsWorldDraft[]
}>(), {
  dense: false,
  tabJustifyContent: FA_VERTICAL_DRAGGABLE_TABS_TAB_JUSTIFY_CONTENT_DEFAULT,
  tabLabelFontSize: FA_VERTICAL_DRAGGABLE_TABS_TAB_LABEL_FONT_SIZE_DEFAULT,
  tabLabelTextTransform: FA_VERTICAL_DRAGGABLE_TABS_TAB_LABEL_TEXT_TRANSFORM_DEFAULT,
  tabListWidthPx: FA_DIALOG_PROJECT_SETTINGS_VERTICAL_TAB_LIST_WIDTH_PX_DEFAULT,
  tabPadding: FA_VERTICAL_DRAGGABLE_TABS_TAB_PADDING_DEFAULT,
  tabTextAlign: FA_VERTICAL_DRAGGABLE_TABS_TAB_TEXT_ALIGN_DEFAULT
})

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

const tabListScrollRef = ref<HTMLElement | null>(null)

const draggingWorldId = ref<string | null>(null)

const filterQuery = ref('')

const {
  applySortableListToFull,
  showFilterEmpty,
  sortableList: sortableWorlds,
  syncSortableListFromFull
} = createDialogProjectSettingsFilteredVerticalTabListSortableWiring({
  cloneList: cloneWorldDraftList,
  filterItems: (list, query) => {
    return filterDialogProjectSettingsWorldsByQuery(
      list,
      query,
      props.currentLanguageCode
    )
  },
  filterQuery,
  fullList: draggableWorlds
})

const faVerticalDraggableTabsRootClassList = computed(() => ({
  'faVerticalDraggableTabs--listDragging': draggingWorldId.value !== null
}))

const tabListRootStyle = computed(() => buildFaVerticalDraggableTabsRootStyle({
  columnWidthPx: props.tabListWidthPx,
  tabDense: props.dense,
  tabJustifyContent: props.tabJustifyContent,
  tabLabelFontSize: props.tabLabelFontSize,
  tabLabelTextTransform: props.tabLabelTextTransform,
  tabPadding: props.tabPadding,
  tabTextAlign: props.tabTextAlign
}))

watch(
  () => props.worlds,
  (nextWorlds) => {
    draggableWorlds.value = cloneWorldDraftList(nextWorlds)
    syncSortableListFromFull()
  },
  { deep: true }
)

createDialogProjectSettingsScrollOnAppendWatch({
  getCount: () => props.worlds.length,
  getScrollContainer: () => tabListScrollRef.value,
  itemSelector: '.faVerticalDraggableTabs__tab',
  nextTick,
  requestAnimationFrame: (callback) => window.requestAnimationFrame(callback),
  watch
})

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
  applySortableListToFull()
  emit('update:worlds', cloneWorldDraftList(draggableWorlds.value))
}

function isWorldTabValidationError (world: I_dialogProjectSettingsWorldDraft): boolean {
  return isDialogProjectSettingsWorldTabValidationError(world, props.documentTemplates)
}
</script>

<style lang="scss" src="./styles/DialogProjectSettings.worldsTabList.unscoped.scss"></style>
