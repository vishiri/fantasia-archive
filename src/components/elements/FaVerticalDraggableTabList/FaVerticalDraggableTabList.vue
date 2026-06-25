<template>
  <div
    :class="[faVerticalDraggableTabsRootClassList, props.blockClassSuffix]"
    :style="tabListRootStyle"
    class="faVerticalDraggableTabs"
    :data-test-layout-width="String(props.tabListWidthPx)"
  >
    <div class="faVerticalDraggableTabs__filterRow">
      <DialogProjectSettingsVerticalTabListFilterInput
        v-model="filterQuery"
        stretch-to-column-edge
        :aria-label-key="props.filterAriaLabelKey"
        :clear-aria-label-key="props.filterClearAriaLabelKey"
        :placeholder-key="props.filterPlaceholderKey"
        :test-locator-clear="props.testLocatorFilterClear"
        :test-locator-input="props.testLocatorFilterInput"
      />
    </div>

    <div
      ref="tabListScrollRef"
      class="faVerticalDraggableTabs__scroll"
      :data-test-locator="props.testLocatorList"
    >
      <VueDraggable
        v-bind="faVerticalDraggableTabsSortableDragOptions"
        v-model="sortableList"
        :animation="150"
        :set-data="hideNativeSortableDragGhost"
        :touch-start-threshold="5"
        class="faVerticalDraggableTabs__draggable column"
        @end="onDragEnd"
        @start="onDragStart"
      >
        <template
          v-for="item in sortableList"
          :key="item.id"
        >
          <slot
            :drag-id="item.id"
            :is-being-dragged="item.id === draggingItemId"
            :is-list-dragging="draggingItemId !== null"
            :item="item"
            name="tab"
          />
        </template>
      </VueDraggable>
      <div
        v-if="showFilterEmpty"
        class="faVerticalDraggableTabList__filterEmpty fa-text-muted"
        :class="`${props.blockClassSuffix}__filterEmpty`"
        :data-test-locator="props.testLocatorFilterEmpty"
      >
        {{ $t(props.emptyFilteredKey) }}
      </div>
    </div>

    <q-separator class="faVerticalDraggableTabs__divider" />

    <div class="faVerticalDraggableTabs__addButtonRow">
      <q-btn
        outline
        class="faVerticalDraggableTabs__addButton"
        color="primary-bright"
        :label="$t(props.addButtonLabelKey)"
        :data-test-locator="props.testLocatorAddButton"
        @click="emit('add')"
      />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends I_faVerticalDraggableTabListIdentifiedItem">
// faVerticalDraggableTabs column host — layout props and drag wiring documented in
// .cursor/skills/fantasia-drag-drop/SKILL.md (Vertical draggable tab strips).
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import type { ShallowRef } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import type { SortableEvent } from 'sortablejs'

import type { I_faVerticalDraggableTabListIdentifiedItem } from 'app/types/I_faVerticalDraggableTabList'
import type {
  T_faVerticalDraggableTabsTabJustifyContent,
  T_faVerticalDraggableTabsTabLabelTextTransform,
  T_faVerticalDraggableTabsTabTextAlign
} from 'app/types/I_faVerticalDraggableTabs'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import { FA_DIALOG_PROJECT_SETTINGS_VERTICAL_TAB_LIST_WIDTH_PX_DEFAULT } from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsDialogInput'
import {
  FA_VERTICAL_DRAGGABLE_TABS_TAB_JUSTIFY_CONTENT_DEFAULT,
  FA_VERTICAL_DRAGGABLE_TABS_TAB_LABEL_FONT_SIZE_DEFAULT,
  FA_VERTICAL_DRAGGABLE_TABS_TAB_LABEL_TEXT_TRANSFORM_DEFAULT,
  FA_VERTICAL_DRAGGABLE_TABS_TAB_PADDING_DEFAULT,
  FA_VERTICAL_DRAGGABLE_TABS_TAB_TEXT_ALIGN_DEFAULT,
  applyFaVerticalDraggableTabsDocumentDragCursor,
  buildFaVerticalDraggableTabsRootStyle,
  clearFaVerticalDraggableTabsDocumentDragCursor,
  faVerticalDraggableTabsSortableDragOptions,
  hideNativeSortableDragGhost,
  readFaSortableDragItemDataAttribute
} from 'app/src/scripts/faDragDrop/faDragDrop_manager'
import DialogProjectSettingsVerticalTabListFilterInput from 'app/src/components/dialogs/DialogProjectSettings/DialogProjectSettingsVerticalTabListFilterInput.vue'
import { createDialogProjectSettingsFilteredVerticalTabListSortableWiring } from 'app/src/components/dialogs/DialogProjectSettings/scripts/dialogProjectSettingsFilteredVerticalTabListSortableWiring'
import { createDialogProjectSettingsScrollOnAppendWatch } from 'app/src/components/dialogs/DialogProjectSettings/scripts/dialogProjectSettingsScrollOnAppendWiring'

defineOptions({
  name: 'FaVerticalDraggableTabList'
})

const props = withDefaults(defineProps<{
  addButtonLabelKey: string
  blockClassSuffix: string
  cloneList: (list: T[]) => T[]
  currentLanguageCode: T_faUserSettingsLanguageCode
  dense?: boolean
  dragIdDataAttribute: string
  emptyFilteredKey: string
  filterAriaLabelKey: string
  filterClearAriaLabelKey: string
  filterItems: (list: T[], query: string) => T[]
  filterPlaceholderKey: string
  items: T[]
  tabJustifyContent?: T_faVerticalDraggableTabsTabJustifyContent
  tabLabelFontSize?: string
  tabLabelTextTransform?: T_faVerticalDraggableTabsTabLabelTextTransform
  tabListWidthPx?: number
  tabPadding?: string
  tabTextAlign?: T_faVerticalDraggableTabsTabTextAlign
  testLocatorAddButton: string
  testLocatorFilterClear: string
  testLocatorFilterEmpty: string
  testLocatorFilterInput: string
  testLocatorList: string
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
  add: []
  'update:items': [items: T[]]
}>()

const draggableItems: ShallowRef<T[]> = shallowRef(props.cloneList(props.items))

const tabListScrollRef = ref<HTMLElement | null>(null)

const draggingItemId = ref<string | null>(null)

const filterQuery = ref('')

const {
  applySortableListToFull,
  showFilterEmpty,
  sortableList,
  syncSortableListFromFull
} = createDialogProjectSettingsFilteredVerticalTabListSortableWiring({
  cloneList: props.cloneList,
  filterItems: (list, query) => props.filterItems(list, query),
  filterQuery,
  fullList: draggableItems
})

const faVerticalDraggableTabsRootClassList = computed(() => ({
  'faVerticalDraggableTabs--listDragging': draggingItemId.value !== null
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
  () => props.items,
  (nextItems) => {
    draggableItems.value = props.cloneList(nextItems)
    syncSortableListFromFull()
  },
  { deep: true }
)

createDialogProjectSettingsScrollOnAppendWatch({
  getCount: () => props.items.length,
  getScrollContainer: () => tabListScrollRef.value,
  itemSelector: '.faVerticalDraggableTabs__tab',
  nextTick,
  requestAnimationFrame: (callback) => window.requestAnimationFrame(callback),
  watch
})

function onDragStart (event: SortableEvent): void {
  draggingItemId.value = readFaSortableDragItemDataAttribute(
    event.item,
    props.dragIdDataAttribute
  )
  applyFaVerticalDraggableTabsDocumentDragCursor()
}

function onDragEnd (): void {
  draggingItemId.value = null
  clearFaVerticalDraggableTabsDocumentDragCursor()
  applySortableListToFull()
  emit('update:items', props.cloneList(draggableItems.value))
}
</script>

<style lang="scss" src="app/src/components/dialogs/DialogProjectSettings/styles/DialogProjectSettings.worldsTabList.unscoped.scss"></style>
