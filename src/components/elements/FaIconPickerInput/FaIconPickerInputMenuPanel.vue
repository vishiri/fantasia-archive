<template>
  <div
    class="faIconPickerInput__menuPanel"
    :data-test-locator="props.menuTestLocator"
  >
    <div class="faIconPickerInput__menuHeader">
      <q-input
        ref="searchInputRef"
        :model-value="props.searchQuery"
        class="faIconPickerInput__search"
        clearable
        color="primary-bright"
        dark
        dense
        :data-test-locator="`${props.menuTestLocator}-search`"
        filled
        :placeholder="$t('faIconPickerInput.searchPlaceholder')"
        @update:model-value="onSearchUpdate"
      >
        <template #prepend>
          <q-icon
            aria-hidden="true"
            name="search"
          />
        </template>
      </q-input>
    </div>

    <q-inner-loading :showing="props.isCatalogLoading">
      <q-spinner
        color="primary-bright"
        size="32px"
      />
    </q-inner-loading>

    <div
      v-if="props.catalogLoadError"
      class="faIconPickerInput__statusMessage fa-text-muted text-body2"
      :data-test-locator="`${props.menuTestLocator}-loadError`"
    >
      {{ props.catalogLoadError }}
    </div>

    <div
      v-else-if="!props.isCatalogLoading && !props.hasCatalogRows"
      class="faIconPickerInput__statusMessage fa-text-muted text-body2"
      :data-test-locator="`${props.menuTestLocator}-empty`"
    >
      {{ $t('faIconPickerInput.emptyResultsMessage') }}
    </div>

    <q-virtual-scroll
      v-else-if="props.hasCatalogRows"
      v-slot="{ item: iconRow, index: rowIndex }"
      class="faIconPickerInput__virtualScroll hasScrollbar"
      :data-test-locator="`${props.menuTestLocator}-virtualScroll`"
      :items="props.catalogRows"
      :virtual-scroll-item-size="virtualRowHeightPx"
    >
      <div
        class="faIconPickerInput__iconRow"
        :data-test-locator="`${props.menuTestLocator}-row-${rowIndex}`"
      >
        <q-btn
          v-for="iconName in iconRow"
          :key="iconName"
          class="faIconPickerInput__iconCell"
          :class="{ 'faIconPickerInput__iconCell--selected': iconName === props.modelValue }"
          :data-test-icon-name="iconName"
          :data-test-locator="`${props.menuTestLocator}-iconCell`"
          dense
          flat
          :icon="iconName"
          @click="emitIconSelect(iconName)"
        >
          <q-tooltip>
            {{ iconName }}
          </q-tooltip>
        </q-btn>
      </div>
    </q-virtual-scroll>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { QInput } from 'quasar'

import {
  FA_ICON_PICKER_VIRTUAL_ROW_HEIGHT_PX,
  type T_faIconPickerCatalogRow
} from 'app/types/I_faIconPickerInput'

defineOptions({
  name: 'FaIconPickerInputMenuPanel'
})

const props = defineProps<{
  catalogLoadError: string | null
  catalogRows: T_faIconPickerCatalogRow[]
  hasCatalogRows: boolean
  isCatalogLoading: boolean
  menuTestLocator: string
  modelValue: string
  searchQuery: string
}>()

const emit = defineEmits<{
  'icon-select': [iconName: string]
  'search-update': [value: string | number | null]
}>()

const virtualRowHeightPx = FA_ICON_PICKER_VIRTUAL_ROW_HEIGHT_PX
const searchInputRef = ref<QInput | null>(null)

function focusSearchInput (): void {
  searchInputRef.value?.focus()
}

function onSearchUpdate (value: string | number | null): void {
  emit('search-update', value)
}

function emitIconSelect (iconName: string): void {
  emit('icon-select', iconName)
}

defineExpose({
  focusSearchInput
})
</script>
