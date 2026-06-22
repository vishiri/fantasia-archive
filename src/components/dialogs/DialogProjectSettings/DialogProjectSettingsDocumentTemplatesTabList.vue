<template>
  <div
    :class="faVerticalDraggableTabsRootClassList"
    :style="tabListRootStyle"
    class="faVerticalDraggableTabs dialogProjectSettingsDocumentTemplatesTabList"
    :data-test-layout-width="String(props.tabListWidthPx)"
  >
    <div class="faVerticalDraggableTabs__filterRow">
      <DialogProjectSettingsVerticalTabListFilterInput
        v-model="filterQuery"
        stretch-to-column-edge
        aria-label-key="dialogs.projectSettings.panels.documentTemplates.filterAriaLabel"
        clear-aria-label-key="dialogs.projectSettings.panels.documentTemplates.filterClearAriaLabel"
        placeholder-key="dialogs.projectSettings.panels.documentTemplates.filterPlaceholder"
        test-locator-clear="dialogProjectSettings-documentTemplatesFilterClear"
        test-locator-input="dialogProjectSettings-documentTemplatesFilterInput"
      />
    </div>

    <div
      ref="tabListScrollRef"
      class="faVerticalDraggableTabs__scroll"
      data-test-locator="dialogProjectSettings-documentTemplates-list"
    >
      <VueDraggable
        v-bind="faVerticalDraggableTabsSortableDragOptions"
        v-model="sortableTemplates"
        :animation="150"
        :set-data="hideNativeSortableDragGhost"
        :touch-start-threshold="5"
        class="faVerticalDraggableTabs__draggable column"
        @end="onTemplatesDragEnd"
        @start="onTemplatesDragStart"
      >
        <DialogProjectSettingsDocumentTemplatesTabItem
          v-for="template in sortableTemplates"
          :key="template.id"
          :current-language-code="props.currentLanguageCode"
          :is-being-dragged="template.id === draggingTemplateId"
          :is-list-dragging="draggingTemplateId !== null"
          :is-selected="template.id === props.selectedTemplateId"
          :tab-has-error="isTemplateTabValidationError(template)"
          :template="template"
          @select="emit('select', $event)"
        />
      </VueDraggable>
      <div
        v-if="showFilterEmpty"
        class="dialogProjectSettingsDocumentTemplatesTabList__filterEmpty fa-text-muted"
        data-test-locator="dialogProjectSettings-documentTemplatesFilterEmpty"
      >
        {{ $t('dialogs.projectSettings.panels.documentTemplates.emptyFilteredTemplates') }}
      </div>
    </div>

    <q-separator class="faVerticalDraggableTabs__divider" />

    <div class="faVerticalDraggableTabs__addButtonRow">
      <q-btn
        outline
        class="faVerticalDraggableTabs__addButton"
        color="primary-bright"
        :label="$t('dialogs.projectSettings.panels.documentTemplates.addTemplateButton')"
        data-test-locator="dialogProjectSettings-documentTemplates-addButton"
        @click="emit('addTemplate')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// faVerticalDraggableTabs column host — layout props and drag wiring documented in
// .cursor/skills/fantasia-drag-drop/SKILL.md (Vertical draggable tab strips).
import { computed, nextTick, ref, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import type { SortableEvent } from 'sortablejs'

import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import type {
  T_faVerticalDraggableTabsTabJustifyContent,
  T_faVerticalDraggableTabsTabLabelTextTransform,
  T_faVerticalDraggableTabsTabTextAlign
} from 'app/types/I_faVerticalDraggableTabs'
import { FA_DIALOG_PROJECT_SETTINGS_VERTICAL_TAB_LIST_WIDTH_PX_DEFAULT } from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsDialogInput'
import { isDialogProjectSettingsDocumentTemplateTabValidationError } from 'app/src/components/dialogs/DialogProjectSettings/scripts/dialogProjectSettingsDocumentTemplatesDraft'
import {
  FA_VERTICAL_DRAGGABLE_TABS_TAB_JUSTIFY_CONTENT_DEFAULT,
  FA_VERTICAL_DRAGGABLE_TABS_TAB_LABEL_FONT_SIZE_DEFAULT,
  FA_VERTICAL_DRAGGABLE_TABS_TAB_LABEL_TEXT_TRANSFORM_DEFAULT,
  FA_VERTICAL_DRAGGABLE_TABS_TAB_PADDING_DEFAULT,
  FA_VERTICAL_DRAGGABLE_TABS_TAB_TEXT_ALIGN_DEFAULT,
  buildFaVerticalDraggableTabsRootStyle
} from 'app/src/scripts/faDragDrop/functions/buildFaVerticalDraggableTabsRootStyle'
import DialogProjectSettingsDocumentTemplatesTabItem from 'app/src/components/dialogs/DialogProjectSettings/DialogProjectSettingsDocumentTemplatesTabItem.vue'
import DialogProjectSettingsVerticalTabListFilterInput from 'app/src/components/dialogs/DialogProjectSettings/DialogProjectSettingsVerticalTabListFilterInput.vue'
import { filterDialogProjectSettingsDocumentTemplatesByQuery } from './scripts/filterDialogProjectSettingsDocumentTemplatesByQuery'
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
  name: 'DialogProjectSettingsDocumentTemplatesTabList'
})

const props = withDefaults(defineProps<{
  currentLanguageCode: T_faUserSettingsLanguageCode
  dense?: boolean
  selectedTemplateId: string | null
  tabJustifyContent?: T_faVerticalDraggableTabsTabJustifyContent
  tabLabelFontSize?: string
  tabLabelTextTransform?: T_faVerticalDraggableTabsTabLabelTextTransform
  tabListWidthPx?: number
  tabPadding?: string
  tabTextAlign?: T_faVerticalDraggableTabsTabTextAlign
  templates: I_dialogProjectSettingsDocumentTemplateDraft[]
}>(), {
  dense: true,
  tabJustifyContent: FA_VERTICAL_DRAGGABLE_TABS_TAB_JUSTIFY_CONTENT_DEFAULT,
  tabLabelFontSize: FA_VERTICAL_DRAGGABLE_TABS_TAB_LABEL_FONT_SIZE_DEFAULT,
  tabLabelTextTransform: FA_VERTICAL_DRAGGABLE_TABS_TAB_LABEL_TEXT_TRANSFORM_DEFAULT,
  tabListWidthPx: FA_DIALOG_PROJECT_SETTINGS_VERTICAL_TAB_LIST_WIDTH_PX_DEFAULT,
  tabPadding: FA_VERTICAL_DRAGGABLE_TABS_TAB_PADDING_DEFAULT,
  tabTextAlign: FA_VERTICAL_DRAGGABLE_TABS_TAB_TEXT_ALIGN_DEFAULT
})

const emit = defineEmits<{
  addTemplate: []
  select: [id: string]
  'update:templates': [templates: I_dialogProjectSettingsDocumentTemplateDraft[]]
}>()

function cloneTemplateDraftList (
  templates: I_dialogProjectSettingsDocumentTemplateDraft[]
): I_dialogProjectSettingsDocumentTemplateDraft[] {
  return templates.map((template) => ({ ...template }))
}

const draggableTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[]>(
  cloneTemplateDraftList(props.templates)
)

const tabListScrollRef = ref<HTMLElement | null>(null)

const draggingTemplateId = ref<string | null>(null)

const filterQuery = ref('')

const {
  applySortableListToFull,
  showFilterEmpty,
  sortableList: sortableTemplates,
  syncSortableListFromFull
} = createDialogProjectSettingsFilteredVerticalTabListSortableWiring({
  cloneList: cloneTemplateDraftList,
  filterItems: (list, query) => {
    return filterDialogProjectSettingsDocumentTemplatesByQuery(
      list,
      query,
      props.currentLanguageCode
    )
  },
  filterQuery,
  fullList: draggableTemplates
})

const faVerticalDraggableTabsRootClassList = computed(() => ({
  'faVerticalDraggableTabs--listDragging': draggingTemplateId.value !== null
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
  () => props.templates,
  (nextTemplates) => {
    draggableTemplates.value = cloneTemplateDraftList(nextTemplates)
    syncSortableListFromFull()
  },
  { deep: true }
)

createDialogProjectSettingsScrollOnAppendWatch({
  getCount: () => props.templates.length,
  getScrollContainer: () => tabListScrollRef.value,
  itemSelector: '.faVerticalDraggableTabs__tab',
  nextTick,
  requestAnimationFrame: (callback) => window.requestAnimationFrame(callback),
  watch
})

function onTemplatesDragStart (event: SortableEvent): void {
  draggingTemplateId.value = readFaSortableDragItemDataAttribute(
    event.item,
    'data-test-template-id'
  )
  applyFaVerticalDraggableTabsDocumentDragCursor()
}

function onTemplatesDragEnd (): void {
  draggingTemplateId.value = null
  clearFaVerticalDraggableTabsDocumentDragCursor()
  applySortableListToFull()
  emit('update:templates', cloneTemplateDraftList(draggableTemplates.value))
}

function isTemplateTabValidationError (
  template: I_dialogProjectSettingsDocumentTemplateDraft
): boolean {
  return isDialogProjectSettingsDocumentTemplateTabValidationError(template)
}
</script>

<style lang="scss" src="./styles/DialogProjectSettings.worldsTabList.unscoped.scss"></style>
