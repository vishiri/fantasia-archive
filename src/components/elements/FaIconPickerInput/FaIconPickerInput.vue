<template>
  <div
    ref="pickerMenuAnchorRef"
    class="faIconPickerInput__row"
    :data-test-locator="props.testLocator"
  >
    <q-btn
      class="faIconPickerInput__trigger fa-text-label"
      :data-test-icon-name="props.modelValue.trim().length > 0 ? props.modelValue.trim() : undefined"
      :data-test-locator="triggerTestLocator"
      dense
      flat
      :icon="previewIconName"
      round
      @click="openPickerMenu"
    >
      <q-tooltip>
        <div>{{ $t('faIconPickerInput.triggerTooltipClick') }}</div>
        <div>
          {{ $t('faIconPickerInput.triggerTooltipCurrentIcon', { iconName: previewIconName }) }}
        </div>
      </q-tooltip>
    </q-btn>

    <q-menu
      v-model="menuOpen"
      anchor="bottom left"
      class="faIconPickerInput__pickerMenu"
      :data-test-locator="menuTestLocator"
      no-focus
      no-parent-event
      :offset="menuOffset"
      self="top left"
      :target="pickerMenuAnchorRef ?? undefined"
      transition-hide="fade"
      transition-show="fade"
      @before-show="onMenuShow"
      @hide="onMenuHide"
      @show="onMenuShown"
    >
      <FaIconPickerInputMenuPanel
        ref="menuPanelRef"
        :catalog-load-error="catalogLoadError"
        :catalog-rows="catalogRows"
        :has-catalog-rows="hasCatalogRows"
        :is-catalog-loading="isCatalogLoading"
        :menu-test-locator="menuTestLocator"
        :model-value="props.modelValue"
        :search-query="searchQuery"
        @icon-select="onIconSelect"
        @search-update="onSearchQueryUpdate"
      />
    </q-menu>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, toRef, type Ref } from 'vue'

import { FA_ICON_PICKER_EMPTY_PLACEHOLDER_ICON } from 'app/types/I_faIconPickerInput'

import FaIconPickerInputMenuPanel from './FaIconPickerInputMenuPanel.vue'
import { useFaIconPickerInput } from './scripts/faIconPickerInput_manager'

defineOptions({
  name: 'FaIconPickerInput'
})

const props = withDefaults(
  defineProps<{
    defaultIcon?: string
    modelValue: string
    testLocator: string
  }>(),
  {
    defaultIcon: FA_ICON_PICKER_EMPTY_PLACEHOLDER_ICON
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const pickerMenuAnchorRef = ref<HTMLElement | null>(null)
const menuPanelRef = ref<InstanceType<typeof FaIconPickerInputMenuPanel> | null>(null)

function emitModelValue (value: string): void {
  emit('update:modelValue', value)
}

const modelValueRef = toRef(props, 'modelValue')

const {
  catalogLoadError,
  catalogRows,
  hasCatalogRows,
  isCatalogLoading,
  menuOpen,
  onIconSelect,
  onMenuHide,
  onMenuShow,
  onSearchQueryUpdate,
  previewIconName,
  searchQuery
} = useFaIconPickerInput({
  defaultIcon: props.defaultIcon,
  emitModelValue,
  modelValue: modelValueRef as Ref<string>
})

const menuOffset = computed((): [number, number] => [0, 4])

const triggerTestLocator = computed(() => `${props.testLocator}-trigger`)

const menuTestLocator = computed(() => `${props.testLocator}-menu`)

function openPickerMenu (): void {
  menuOpen.value = true
}

function onMenuShown (): void {
  void nextTick(() => {
    menuPanelRef.value?.focusSearchInput()
  })
}
</script>

<style lang="scss" src="./styles/FaIconPickerInput.menu.unscoped.scss"></style>
<style lang="scss" src="./styles/FaIconPickerInput.field.unscoped.scss"></style>

<style lang="scss" scoped>
.faIconPickerInput__row {
  align-items: center;
  display: flex;
  gap: $faIconPickerInput-row-gap;
  max-width: $faIconPickerInput-field-width;
  min-width: 0;
  width: $faIconPickerInput-field-width;
}

.faIconPickerInput__trigger {
  flex: 0 0 auto;
  height: $faIconPickerInput-trigger-size;
  min-height: $faIconPickerInput-trigger-size;
  min-width: $faIconPickerInput-trigger-size;
  width: $faIconPickerInput-trigger-size;

  :deep(.q-icon) {
    font-size: $faQIconDisplay-iconFontSize;
  }

  :deep(.fa-solid::before) {
    font-size: $faQIconDisplay-faSolidBefore-fontSize;
    margin-top: $faQIconDisplay-faSolidBefore-marginTop;
  }
}
</style>
