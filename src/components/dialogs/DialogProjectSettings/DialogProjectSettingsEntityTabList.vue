<template>
  <FaVerticalDraggableTabList
    :add-button-label-key="props.addButtonLabelKey"
    :block-class-suffix="props.blockClassSuffix"
    :clone-list="props.cloneList"
    :current-language-code="props.currentLanguageCode"
    :dense="props.dense"
    :drag-id-data-attribute="props.dragIdDataAttribute"
    :empty-filtered-key="props.emptyFilteredKey"
    :filter-aria-label-key="props.filterAriaLabelKey"
    :filter-clear-aria-label-key="props.filterClearAriaLabelKey"
    :filter-items="props.filterItems"
    :filter-placeholder-key="props.filterPlaceholderKey"
    :items="props.items"
    :tab-justify-content="props.tabJustifyContent"
    :tab-label-font-size="props.tabLabelFontSize"
    :tab-label-text-transform="props.tabLabelTextTransform"
    :tab-list-width-px="props.tabListWidthPx"
    :tab-padding="props.tabPadding"
    :tab-text-align="props.tabTextAlign"
    :test-locator-add-button="props.testLocatorAddButton"
    :test-locator-filter-clear="props.testLocatorFilterClear"
    :test-locator-filter-empty="props.testLocatorFilterEmpty"
    :test-locator-filter-input="props.testLocatorFilterInput"
    :test-locator-list="props.testLocatorList"
    @add="emit('add')"
    @update:items="emit('update:items', $event)"
  >
    <template #tab="slotProps">
      <slot
        name="tab"
        v-bind="slotProps"
      />
    </template>
  </FaVerticalDraggableTabList>
</template>

<script setup lang="ts" generic="T extends I_faVerticalDraggableTabListIdentifiedItem">
import type { I_faVerticalDraggableTabListIdentifiedItem } from 'app/types/I_faVerticalDraggableTabList'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import type {
  T_faVerticalDraggableTabsTabJustifyContent,
  T_faVerticalDraggableTabsTabLabelTextTransform,
  T_faVerticalDraggableTabsTabTextAlign
} from 'app/types/I_faVerticalDraggableTabs'
import {
  FA_VERTICAL_DRAGGABLE_TABS_TAB_JUSTIFY_CONTENT_DEFAULT,
  FA_VERTICAL_DRAGGABLE_TABS_TAB_LABEL_FONT_SIZE_DEFAULT,
  FA_VERTICAL_DRAGGABLE_TABS_TAB_LABEL_TEXT_TRANSFORM_DEFAULT,
  FA_VERTICAL_DRAGGABLE_TABS_TAB_PADDING_DEFAULT,
  FA_VERTICAL_DRAGGABLE_TABS_TAB_TEXT_ALIGN_DEFAULT
} from '../../../scripts/faDragDrop/faDragDrop_manager'
import FaVerticalDraggableTabList from '../../elements/FaVerticalDraggableTabList/FaVerticalDraggableTabList.vue'
import {
  FA_DIALOG_PROJECT_SETTINGS_VERTICAL_TAB_LIST_WIDTH_PX_DEFAULT
} from './scripts/dialogProjectSettings_manager'

defineOptions({
  name: 'DialogProjectSettingsEntityTabList'
})

const props = withDefaults(defineProps<{
  addButtonLabelKey: string
  blockClassSuffix: string
  cloneList: (items: T[]) => T[]
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
</script>

<style lang="scss" src="./styles/DialogProjectSettings.worldsTabList.unscoped.scss"></style>
