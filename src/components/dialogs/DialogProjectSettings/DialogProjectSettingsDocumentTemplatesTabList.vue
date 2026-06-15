<template>
  <div
    :class="faVerticalDraggableTabsRootClassList"
    :style="tabListRootStyle"
    class="faVerticalDraggableTabs dialogProjectSettingsDocumentTemplatesTabList"
    :data-test-layout-width="String(props.tabListWidthPx)"
  >
    <div
      class="faVerticalDraggableTabs__scroll hasScrollbar"
      data-test-locator="dialogProjectSettings-documentTemplates-list"
    >
      <VueDraggable
        v-bind="faVerticalDraggableTabsSortableDragOptions"
        v-model="draggableTemplates"
        :animation="150"
        :set-data="hideNativeSortableDragGhost"
        :touch-start-threshold="5"
        class="faVerticalDraggableTabs__draggable column"
        @end="onTemplatesDragEnd"
        @start="onTemplatesDragStart"
      >
        <DialogProjectSettingsDocumentTemplatesTabItem
          v-for="template in draggableTemplates"
          :key="template.id"
          :is-being-dragged="template.id === draggingTemplateId"
          :is-list-dragging="draggingTemplateId !== null"
          :is-selected="template.id === props.selectedTemplateId"
          :tab-has-error="isTemplateTabValidationError(template)"
          :template="template"
          @select="emit('select', $event)"
        />
      </VueDraggable>

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
  </div>
</template>

<script setup lang="ts">
// faVerticalDraggableTabs column host — layout props and drag wiring documented in
// .cursor/skills/fantasia-drag-drop/SKILL.md (Vertical draggable tab strips).
import { computed, ref, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import type { SortableEvent } from 'sortablejs'

import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type {
  T_faVerticalDraggableTabsTabJustifyContent,
  T_faVerticalDraggableTabsTabLabelTextTransform,
  T_faVerticalDraggableTabsTabTextAlign
} from 'app/types/I_faVerticalDraggableTabs'
import { FA_DIALOG_PROJECT_SETTINGS_VERTICAL_TAB_LIST_WIDTH_PX_DEFAULT } from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsDialogInput'
import { isDialogProjectSettingsDocumentTemplateTabValidationError } from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsDocumentTemplatesDraft'
import {
  FA_VERTICAL_DRAGGABLE_TABS_TAB_JUSTIFY_CONTENT_DEFAULT,
  FA_VERTICAL_DRAGGABLE_TABS_TAB_LABEL_FONT_SIZE_DEFAULT,
  FA_VERTICAL_DRAGGABLE_TABS_TAB_LABEL_TEXT_TRANSFORM_DEFAULT,
  FA_VERTICAL_DRAGGABLE_TABS_TAB_PADDING_DEFAULT,
  FA_VERTICAL_DRAGGABLE_TABS_TAB_TEXT_ALIGN_DEFAULT,
  buildFaVerticalDraggableTabsRootStyle
} from 'app/src/scripts/faDragDrop/functions/buildFaVerticalDraggableTabsRootStyle'
import DialogProjectSettingsDocumentTemplatesTabItem from 'app/src/components/dialogs/DialogProjectSettings/DialogProjectSettingsDocumentTemplatesTabItem.vue'
import { hideNativeSortableDragGhost } from 'app/src/scripts/faDragDrop/functions/hideNativeSortableDragGhost'
import {
  applyFaVerticalDraggableTabsDocumentDragCursor,
  clearFaVerticalDraggableTabsDocumentDragCursor
} from 'app/src/scripts/faDragDrop/functions/faVerticalDraggableTabsDocumentDragCursor'
import { faVerticalDraggableTabsSortableDragOptions } from 'app/src/scripts/faDragDrop/functions/faVerticalDraggableTabsSortableDragOptions'
import { readFaSortableDragItemDataAttribute } from 'app/src/scripts/faDragDrop/functions/readFaSortableDragItemDataAttribute'

defineOptions({
  name: 'DialogProjectSettingsDocumentTemplatesTabList'
})

const props = withDefaults(defineProps<{
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

const draggingTemplateId = ref<string | null>(null)

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
  },
  { deep: true }
)

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
  emit('update:templates', cloneTemplateDraftList(draggableTemplates.value))
}

function isTemplateTabValidationError (
  template: I_dialogProjectSettingsDocumentTemplateDraft
): boolean {
  return isDialogProjectSettingsDocumentTemplateTabValidationError(template)
}
</script>

<style lang="scss" src="./styles/DialogProjectSettings.worldsTabList.unscoped.scss"></style>
