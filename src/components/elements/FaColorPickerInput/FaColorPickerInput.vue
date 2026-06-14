<template>
  <div class="faColorPickerInput__row">
    <div
      ref="pickerMenuAnchorRef"
      class="faColorPickerInput__menuAnchor"
    >
      <q-input
        :model-value="props.modelValue"
        class="faColorPickerInput"
        :color="props.color"
        :dark="props.dark"
        :dense="props.dense"
        :data-test-locator="props.testLocator"
        filled
        outlined
        @click="openPickerMenu"
        @focus="openPickerMenu"
        @update:model-value="emitModelValueFromInput"
      >
        <template #prepend>
          <q-icon
            class="faColorPickerInput__pickerIcon"
            name="colorize"
            aria-hidden="true"
            :data-test-locator="colorPickerIconTestLocator"
          />
        </template>
        <template #append>
          <span
            class="faColorPickerInput__swatch"
            :class="{ 'faColorPickerInput__swatch--empty': isSwatchEmpty }"
            aria-hidden="true"
            :data-test-locator="colorSwatchTestLocator"
            :style="colorSwatchStyle"
          />
        </template>
      </q-input>
      <q-menu
        v-model="pickerMenuOpen"
        anchor="bottom right"
        class="faColorPickerInput__pickerMenu"
        :data-test-locator="colorPickerMenuTestLocator"
        no-focus
        no-parent-event
        :offset="menuOffset"
        self="top right"
        :target="pickerMenuAnchorRef ?? undefined"
        transition-hide="fade"
        transition-show="fade"
        @hide="onPickerMenuHide"
      >
        <q-color
          class="faColorPickerInput__picker faColorPickerQColor"
          :model-value="displayHex"
          :data-test-locator="colorPickerTestLocator"
          default-view="spectrum"
          format-model="hex"
          :no-footer="!hasPaletteFooter"
          no-header-tabs
          :palette="resolvedPalette"
          @change="onPickerChange"
          @update:model-value="onPickerUpdate"
        />
      </q-menu>
    </div>
    <q-btn
      v-if="showPaletteAppendButton"
      class="faColorPickerInput__appendButton"
      color="primary-bright"
      :data-test-locator="paletteAppendButtonTestLocator"
      :data-test-tooltip-text="$t(paletteAppendTooltipKey)"
      dense
      :disable="isPaletteAppendDisabled"
      flat
      icon="add"
      round
      size="sm"
      @click="onPaletteAppendClick"
    >
      <q-tooltip :delay="500">
        {{ $t(paletteAppendTooltipKey) }}
      </q-tooltip>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  FA_COLOR_PICKER_INPUT_DEFAULT_HEX,
  type I_faColorPickerPaletteAppendConfig,
  type T_faColorPickerInputPalette
} from 'app/types/I_faColorPickerInput'

import {
  useFaColorPickerInput,
  useFaColorPickerPaletteAppend
} from './scripts/faColorPickerInput_manager'

defineOptions({
  name: 'FaColorPickerInput'
})

const props = withDefaults(
  defineProps<{
    color?: string
    dark?: boolean
    defaultHex?: string
    dense?: boolean
    modelValue: string
    palette?: T_faColorPickerInputPalette
    paletteAppend?: I_faColorPickerPaletteAppendConfig
    testLocator: string
  }>(),
  {
    color: 'primary-bright',
    dark: true,
    defaultHex: FA_COLOR_PICKER_INPUT_DEFAULT_HEX,
    dense: true,
    palette: undefined,
    paletteAppend: undefined
  }
)

const emit = defineEmits<{
  'append-to-world-palette': [colorPallete: string]
  'update:modelValue': [value: string]
}>()

const pickerMenuAnchorRef = ref<HTMLElement | null>(null)
const pickerMenuOpen = ref(false)

function emitModelValueUpdate (value: string): void {
  emit('update:modelValue', value)
}

function emitAppendToWorldPalette (colorPallete: string): void {
  emit('append-to-world-palette', colorPallete)
}

const {
  colorSwatchStyle,
  displayHex,
  hasPaletteFooter,
  isSwatchEmpty,
  menuOffset,
  onPickerChange,
  onPickerMenuHide,
  onPickerUpdate,
  refreshProjectColorPalette,
  resolveLiveColorString,
  resolvedPalette
} = useFaColorPickerInput(props, emitModelValueUpdate)

const {
  isPaletteAppendDisabled,
  isPaletteAppendDuplicate,
  onPaletteAppendClick,
  showPaletteAppendButton
} = useFaColorPickerPaletteAppend(
  props,
  emitAppendToWorldPalette,
  resolveLiveColorString,
  refreshProjectColorPalette
)

const colorSwatchTestLocator = computed(() => `${props.testLocator}-swatch`)

const colorPickerIconTestLocator = computed(() => `${props.testLocator}-pickerIcon`)

const colorPickerMenuTestLocator = computed(() => `${props.testLocator}-pickerMenu`)

const colorPickerTestLocator = computed(() => `${props.testLocator}-picker`)

const paletteAppendButtonTestLocator = computed(() => `${props.testLocator}-appendToPalette`)

const paletteAppendTooltipKey = computed(() => {
  if (isPaletteAppendDuplicate.value) {
    return 'faColorPickerInput.appendToWorldPaletteDuplicateTooltip'
  }
  return 'faColorPickerInput.appendToWorldPaletteTooltip'
})

function openPickerMenu (): void {
  pickerMenuOpen.value = true
}

function emitModelValueFromInput (value: string | number | null): void {
  emitModelValueUpdate(value === null || value === undefined ? '' : String(value))
}
</script>

<style lang="scss" src="./styles/FaColorPickerInput.colorPickerMenu.unscoped.scss"></style>

<style lang="scss" scoped>
.faColorPickerInput__row {
  align-items: center;
  display: flex;
  gap: $faColorPickerInput-row-gap;
  max-width: 100%;
}

.faColorPickerInput__menuAnchor {
  flex: 1 1 auto;
  min-width: 0;
  width: $faColorPickerInput-width;
}

.faColorPickerInput {
  width: 100%;
}

.faColorPickerInput__appendButton {
  flex: 0 0 auto;
  height: $faColorPickerInput-appendButton-size;
  min-height: $faColorPickerInput-appendButton-size;
  min-width: $faColorPickerInput-appendButton-size;
  width: $faColorPickerInput-appendButton-size;
}

.faColorPickerInput__swatch {
  border:
    $faColorPickerInput-swatch-borderWidth
    solid
    $faColorPickerInput-swatch-borderColor;
  box-sizing: border-box;
  display: block;
  flex-shrink: 0;
  height: $faColorPickerInput-swatch-size;
  width: $faColorPickerInput-swatch-size;
}

.faColorPickerInput__swatch--empty {
  background-color: transparent;
}

.faColorPickerInput__pickerIcon {
  pointer-events: none;
}
</style>
