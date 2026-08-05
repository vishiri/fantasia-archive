<template>
  <q-select
    ref="selectRef"
    class="faSelectInput"
    :color="color"
    :dark="dark"
    :dense="dense"
    :disable="disable"
    :filled="filled"
    :input-debounce="0"
    :label="label"
    :loading="loading"
    :model-value="modelValue"
    :multiple="multiple"
    :options="filteredOptions"
    :option-label="isObjectMode ? 'name' : undefined"
    :option-value="isObjectMode ? 'id' : undefined"
    :map-options="isObjectMode"
    use-chips
    use-input
    menu-anchor="bottom middle"
    menu-self="top middle"
    popup-content-class="faSelectInput__menu"
    :data-test-locator="testLocator"
    @filter="onFilter"
    @focus="onFocus"
    @new-value="onNewValue"
    @popup-show="onPopupShow"
    @update:model-value="onUpdateModelValue"
  >
    <template #selected-item="scope">
      <q-chip
        v-if="shouldShowFaSelectInputSelectedChip(scope.opt)"
        class="text-bold"
        :color="chipColorForOption(scope.opt)"
        dense
        removable
        :ripple="false"
        :tabindex="scope.tabindex"
        :text-color="chipTextColor"
        :data-test-locator="`${testLocator}-chip`"
        @remove="scope.removeAtIndex(scope.index)"
      >
        <q-icon
          v-if="resolveOptionIcon(scope.opt) !== null"
          class="q-mr-xs"
          :name="resolveOptionIcon(scope.opt) ?? undefined"
          size="16px"
        />
        {{ objectOptionLabel(scope.opt) }}
      </q-chip>
    </template>

    <template #option="scope">
      <div
        class="faSelectInput__optionWrap"
        :data-test-locator="`${testLocator}-option-${scope.index}`"
      >
        <q-separator
          v-if="scope.index > 0"
          class="faSelectInput__separatorAlt"
          :data-test-locator="`${testLocator}-separatorAlt-${scope.index}`"
        />
        <q-item v-bind="scope.itemProps">
          <q-item-section
            v-if="resolveOptionIcon(scope.opt) !== null"
            avatar
          >
            <q-icon :name="resolveOptionIcon(scope.opt) ?? undefined" />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              <span
                v-for="(segment, segmentIndex) in optionLabelHighlightSegments(scope.opt)"
                :key="`${segmentIndex}-${segment.text}`"
                :class="{
                  faSelectInput__optionMatch: segment.isMatch
                }"
              >{{ segment.text }}</span>
            </q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import {
  FA_SELECT_INPUT_CHIP_TEXT_COLOR,
  type I_faSelectInputChangePayload,
  type I_faSelectInputObjectItem,
  type T_faSelectInputFilterFn,
  type T_faSelectInputMode,
  type T_faSelectInputModelValue,
  type T_faSelectInputOption,
  type T_faSelectInputOptions
} from 'app/types/I_faSelectInput'

import {
  shouldShowFaSelectInputSelectedChip,
  useFaSelectInput
} from './scripts/faSelectInput_manager'

defineOptions({
  name: 'FaSelectInput'
})

const chipTextColor = FA_SELECT_INPUT_CHIP_TEXT_COLOR

const props = withDefaults(
  /* eslint-disable vue/require-default-prop -- exactOptionalPropertyTypes: omit undefined from withDefaults */
  defineProps<{
    allowCreateNew?: boolean
    clearInputOnSelect?: boolean
    color?: string
    dark?: boolean
    dense?: boolean
    disable?: boolean
    filled?: boolean
    filterFn?: T_faSelectInputFilterFn
    label?: string
    loading?: boolean
    mode: T_faSelectInputMode
    modelValue: T_faSelectInputModelValue
    multiple?: boolean
    options: T_faSelectInputOptions
    testLocator: string
  }>(),
  {
    allowCreateNew: false,
    clearInputOnSelect: false,
    color: 'primary-bright',
    dark: true,
    dense: true,
    disable: false,
    filled: true,
    loading: false,
    multiple: false
  }
  /* eslint-enable vue/require-default-prop */
)

const emit = defineEmits<{
  change: [payload: I_faSelectInputChangePayload]
  'new-value': [value: string | I_faSelectInputObjectItem]
  'request-options': []
  'update:modelValue': [value: T_faSelectInputModelValue]
}>()

const {
  chipColorForOption,
  clearIsNewFlags,
  filteredOptions,
  isObjectMode,
  onFilter,
  onFocus,
  onNewValue,
  onPopupShow,
  onUpdateModelValue,
  optionLabelHighlightSegments,
  selectRef
} = useFaSelectInput({
  emitChange: (payload) => {
    emit('change', payload)
  },
  emitModelValue: (value) => {
    emit('update:modelValue', value)
  },
  emitNewValue: (value) => {
    emit('new-value', value)
  },
  emitRequestOptions: () => {
    emit('request-options')
  },
  getAllowCreateNew: () => props.allowCreateNew,
  getClearInputOnSelect: () => props.clearInputOnSelect,
  getFilterFn: () => props.filterFn,
  getMode: () => props.mode,
  getModelValue: () => props.modelValue,
  getMultiple: () => props.multiple,
  getOptions: () => props.options
})

function objectOptionLabel (opt: T_faSelectInputOption): string {
  if (typeof opt === 'string') {
    return opt
  }
  return opt.name
}

function resolveOptionIcon (opt: T_faSelectInputOption): string | null {
  if (typeof opt === 'string') {
    return null
  }
  if (opt.icon === undefined || opt.icon.length === 0) {
    return null
  }
  return opt.icon
}

defineExpose({
  clearIsNewFlags
})
</script>

<style lang="scss" src="./styles/FaSelectInput.unscoped.scss"></style>
