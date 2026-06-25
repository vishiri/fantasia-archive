<template>
  <FaVerticalDraggableTabList
    add-button-label-key="dialogs.projectSettings.panels.documentTemplates.addTemplateButton"
    block-class-suffix="dialogProjectSettingsDocumentTemplatesTabList"
    :clone-list="cloneTemplateDraftList"
    :current-language-code="props.currentLanguageCode"
    :dense="props.dense"
    drag-id-data-attribute="data-test-template-id"
    empty-filtered-key="dialogs.projectSettings.panels.documentTemplates.emptyFilteredTemplates"
    filter-aria-label-key="dialogs.projectSettings.panels.documentTemplates.filterAriaLabel"
    filter-clear-aria-label-key="dialogs.projectSettings.panels.documentTemplates.filterClearAriaLabel"
    :filter-items="filterTemplatesByQuery"
    filter-placeholder-key="dialogs.projectSettings.panels.documentTemplates.filterPlaceholder"
    :items="props.templates"
    :tab-justify-content="props.tabJustifyContent"
    :tab-label-font-size="props.tabLabelFontSize"
    :tab-label-text-transform="props.tabLabelTextTransform"
    :tab-list-width-px="props.tabListWidthPx"
    :tab-padding="props.tabPadding"
    :tab-text-align="props.tabTextAlign"
    test-locator-add-button="dialogProjectSettings-documentTemplates-addButton"
    test-locator-filter-clear="dialogProjectSettings-documentTemplatesFilterClear"
    test-locator-filter-empty="dialogProjectSettings-documentTemplatesFilterEmpty"
    test-locator-filter-input="dialogProjectSettings-documentTemplatesFilterInput"
    test-locator-list="dialogProjectSettings-documentTemplates-list"
    @add="emit('addTemplate')"
    @update:items="emit('update:templates', $event)"
  >
    <template #tab="{ item, isBeingDragged, isListDragging }">
      <DialogProjectSettingsDocumentTemplatesTabItem
        :current-language-code="props.currentLanguageCode"
        :is-being-dragged="isBeingDragged"
        :is-list-dragging="isListDragging"
        :is-selected="item.id === props.selectedTemplateId"
        :tab-has-error="isTemplateTabValidationError(item)"
        :template="item"
        @select="emit('select', $event)"
      />
    </template>
  </FaVerticalDraggableTabList>
</template>

<script setup lang="ts">
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
  FA_VERTICAL_DRAGGABLE_TABS_TAB_TEXT_ALIGN_DEFAULT
} from 'app/src/scripts/faDragDrop/faDragDrop_manager'
import FaVerticalDraggableTabList from 'app/src/components/elements/FaVerticalDraggableTabList/FaVerticalDraggableTabList.vue'
import DialogProjectSettingsDocumentTemplatesTabItem from './DialogProjectSettingsDocumentTemplatesTabItem.vue'
import { filterDialogProjectSettingsDocumentTemplatesByQuery } from './scripts/filterDialogProjectSettingsDocumentTemplatesByQuery'

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

function filterTemplatesByQuery (
  list: I_dialogProjectSettingsDocumentTemplateDraft[],
  query: string
): I_dialogProjectSettingsDocumentTemplateDraft[] {
  return filterDialogProjectSettingsDocumentTemplatesByQuery(
    list,
    query,
    props.currentLanguageCode
  )
}

function isTemplateTabValidationError (
  template: I_dialogProjectSettingsDocumentTemplateDraft
): boolean {
  return isDialogProjectSettingsDocumentTemplateTabValidationError(template)
}
</script>
