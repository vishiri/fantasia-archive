<template>
  <FaVerticalDraggableTabList
    add-button-label-key="dialogs.projectSettings.panels.worlds.addWorldButton"
    block-class-suffix="dialogProjectSettingsWorldsTabList"
    :clone-list="cloneWorldDraftList"
    :current-language-code="props.currentLanguageCode"
    :dense="props.dense"
    drag-id-data-attribute="data-test-world-id"
    empty-filtered-key="dialogs.projectSettings.panels.worlds.emptyFilteredWorlds"
    filter-aria-label-key="dialogs.projectSettings.panels.worlds.filterAriaLabel"
    filter-clear-aria-label-key="dialogs.projectSettings.panels.worlds.filterClearAriaLabel"
    :filter-items="filterWorldsByQuery"
    filter-placeholder-key="dialogs.projectSettings.panels.worlds.filterPlaceholder"
    :items="props.worlds"
    :tab-justify-content="props.tabJustifyContent"
    :tab-label-font-size="props.tabLabelFontSize"
    :tab-label-text-transform="props.tabLabelTextTransform"
    :tab-list-width-px="props.tabListWidthPx"
    :tab-padding="props.tabPadding"
    :tab-text-align="props.tabTextAlign"
    test-locator-add-button="dialogProjectSettings-worlds-addButton"
    test-locator-filter-clear="dialogProjectSettings-worldsFilterClear"
    test-locator-filter-empty="dialogProjectSettings-worldsFilterEmpty"
    test-locator-filter-input="dialogProjectSettings-worldsFilterInput"
    test-locator-list="dialogProjectSettings-worlds-list"
    @add="emit('addWorld')"
    @update:items="emit('update:worlds', $event)"
  >
    <template #tab="{ item, isBeingDragged, isListDragging }">
      <DialogProjectSettingsWorldsTabItem
        :current-language-code="props.currentLanguageCode"
        :is-being-dragged="isBeingDragged"
        :is-list-dragging="isListDragging"
        :is-selected="item.id === props.selectedWorldId"
        :tab-has-error="isWorldTabValidationError(item)"
        :world="item"
        @select="emit('select', $event)"
      />
    </template>
  </FaVerticalDraggableTabList>
</template>

<script setup lang="ts">
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
  FA_VERTICAL_DRAGGABLE_TABS_TAB_TEXT_ALIGN_DEFAULT
} from 'app/src/scripts/faDragDrop/faDragDrop_manager'
import FaVerticalDraggableTabList from 'app/src/components/elements/FaVerticalDraggableTabList/FaVerticalDraggableTabList.vue'
import DialogProjectSettingsWorldsTabItem from './DialogProjectSettingsWorldsTabItem.vue'
import { filterDialogProjectSettingsWorldsByQuery } from './scripts/filterDialogProjectSettingsWorldsByQuery'

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

function filterWorldsByQuery (
  list: I_dialogProjectSettingsWorldDraft[],
  query: string
): I_dialogProjectSettingsWorldDraft[] {
  return filterDialogProjectSettingsWorldsByQuery(
    list,
    query,
    props.currentLanguageCode
  )
}

function isWorldTabValidationError (world: I_dialogProjectSettingsWorldDraft): boolean {
  return isDialogProjectSettingsWorldTabValidationError(world, props.documentTemplates)
}
</script>
