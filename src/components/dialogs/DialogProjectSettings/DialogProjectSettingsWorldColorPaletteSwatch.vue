<template>
  <div
    ref="swatchAnchorRef"
    class="dialogProjectSettingsWorldColorPaletteSwatch"
    :class="{
      'dialogProjectSettingsWorldColorPaletteSwatch--duplicate': isDuplicate,
      'dialogProjectSettingsWorldColorPaletteSwatch--beingDragged': props.isBeingDragged
    }"
    data-test-locator="dialogProjectSettings-worlds-colorPaletteSwatch"
    :data-test-palette-entry-id="props.entryId"
    :data-test-palette-index="String(props.index)"
    :data-test-tooltip-text="props.isListDragging ? undefined : tooltipHex"
    role="button"
    tabindex="0"
    @click="onSwatchClick"
    @contextmenu.prevent="onSwatchContextMenu"
    @keydown.enter.prevent="onSwatchClick"
    @keydown.space.prevent="onSwatchClick"
  >
    <span
      class="dialogProjectSettingsWorldColorPaletteSwatch__color"
      :style="swatchStyle"
      aria-hidden="true"
    />
    <q-icon
      v-if="isDuplicate"
      aria-hidden="true"
      class="dialogProjectSettingsWorldColorPaletteSwatch__duplicateIcon"
      :color="duplicateIconColor"
      data-test-locator="dialogProjectSettings-worlds-colorPaletteDuplicateIcon"
      :data-test-duplicate-icon-color="duplicateIconColor"
      name="mdi-exclamation"
    />
    <q-tooltip
      v-if="!props.isListDragging"
      anchor="top middle"
      :delay="500"
      self="bottom middle"
    >
      {{ tooltipHex }}
    </q-tooltip>
    <q-menu
      v-model="contextMenuOpen"
      anchor="top left"
      class="dialogProjectSettingsWorldColorPaletteSwatch__contextMenu"
      dark
      data-test-locator="dialogProjectSettings-worlds-colorPaletteContextMenu"
      no-focus
      no-parent-event
      role="menu"
      self="top left"
      square
      :target="swatchAnchorRef ?? undefined"
      transition-hide="fade"
      transition-show="fade"
    >
      <q-list
        class="dialogProjectSettingsWorldColorPaletteSwatch__contextMenuList"
        dark
        role="none"
      >
        <q-item
          v-close-popup
          clickable
          class="dialogProjectSettingsWorldColorPaletteSwatch__contextMenuItem non-selectable"
          :disable="props.duplicateDisabled"
          role="menuitem"
          data-test-locator="dialogProjectSettings-worlds-colorPaletteContextMenu-duplicate"
          @click="onDuplicateColor"
        >
          <q-item-section>
            <span class="dialogProjectSettingsWorldColorPaletteSwatch__contextMenuLabel">
              {{ $t('dialogs.projectSettings.fields.worldColorPalette.contextMenu.duplicateColor') }}
            </span>
          </q-item-section>
          <q-item-section avatar>
            <q-icon
              class="dialogProjectSettingsWorldColorPaletteSwatch__contextMenuIcon"
              name="mdi-content-copy"
            />
          </q-item-section>
        </q-item>
        <q-separator
          class="dialogProjectSettingsWorldColorPaletteSwatch__contextMenuSeparator"
          dark
          role="separator"
        />
        <q-item
          v-close-popup
          clickable
          class="dialogProjectSettingsWorldColorPaletteSwatch__contextMenuItem dialogProjectSettingsWorldColorPaletteSwatch__contextMenuItem--delete non-selectable text-negative"
          role="menuitem"
          data-test-locator="dialogProjectSettings-worlds-colorPaletteContextMenu-delete"
          @click="onDeleteColor"
        >
          <q-item-section>
            <span class="dialogProjectSettingsWorldColorPaletteSwatch__contextMenuLabel">
              {{ $t('dialogs.projectSettings.fields.worldColorPalette.contextMenu.deleteColor') }}
            </span>
          </q-item-section>
          <q-item-section avatar>
            <q-icon
              class="dialogProjectSettingsWorldColorPaletteSwatch__contextMenuIcon"
              name="mdi-delete"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
    <q-menu
      v-model="pickerMenuOpen"
      anchor="bottom left"
      class="dialogProjectSettingsWorldColorPaletteSwatch__pickerMenu"
      data-test-locator="dialogProjectSettings-worlds-colorPalettePickerMenu"
      no-focus
      no-parent-event
      :offset="menuOffset"
      self="top left"
      :target="swatchAnchorRef ?? undefined"
      transition-hide="fade"
      transition-show="fade"
      @hide="onPickerMenuHide"
    >
      <q-color
        class="dialogProjectSettingsWorldColorPaletteSwatch__picker faColorPickerQColor"
        :model-value="displayHex"
        data-test-locator="dialogProjectSettings-worlds-colorPalettePicker"
        default-view="spectrum"
        format-model="hex"
        :no-footer="!hasPaletteFooter"
        no-header-tabs
        :palette="props.worldPickerPalette"
        @change="onPickerChange"
        @update:model-value="onPickerUpdate"
      />
    </q-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import type { T_faColorPickerInputPalette } from 'app/types/I_faColorPickerInput'
import { useDialogProjectSettingsWorldColorPaletteSwatch } from './scripts/dialogProjectSettingsWorldColorPaletteSwatch_manager'

defineOptions({
  name: 'DialogProjectSettingsWorldColorPaletteSwatch'
})

const props = defineProps<{
  duplicateDisabled: boolean
  duplicateHexKeys: ReadonlySet<string>
  entryId: string
  hex: string
  index: number
  isBeingDragged: boolean
  isListDragging: boolean
  pickerOpen: boolean
  worldPickerPalette: T_faColorPickerInputPalette
}>()

const emit = defineEmits<{
  delete: []
  duplicate: []
  'picker-close': []
  'picker-open': []
  'update:hex': [value: string]
}>()

const swatchAnchorRef = ref<HTMLElement | null>(null)
const pickerMenuOpen = ref(false)
const contextMenuOpen = ref(false)

const {
  displayHex,
  duplicateIconColor,
  hasPaletteFooter,
  isDuplicate,
  menuOffset,
  onPickerChange,
  onPickerMenuHide,
  onPickerUpdate,
  swatchStyle,
  tooltipHex
} = useDialogProjectSettingsWorldColorPaletteSwatch(props, emit)

watch(() => props.pickerOpen, (open) => {
  pickerMenuOpen.value = open
}, {
  immediate: true
})

function closePickerMenu (): void {
  pickerMenuOpen.value = false
  emit('picker-close')
}

function onSwatchClick (): void {
  contextMenuOpen.value = false
  emit('picker-open')
  pickerMenuOpen.value = true
}

function onSwatchContextMenu (): void {
  if (props.isListDragging) {
    return
  }
  closePickerMenu()
  contextMenuOpen.value = true
}

function onDuplicateColor (): void {
  emit('duplicate')
}

function onDeleteColor (): void {
  emit('delete')
}
</script>

<style lang="scss" src="./styles/DialogProjectSettings.worldColorPalette.unscoped.scss"></style>
<style lang="scss" src="./styles/DialogProjectSettings.worldColorPaletteContextMenu.unscoped.scss"></style>

<style lang="scss" scoped>
.dialogProjectSettingsWorldColorPaletteSwatch {
  box-sizing: border-box;
  cursor: grab;
  flex: 0 0 auto;
  height: $dialogProjectSettings-worldColorPalette-swatch-size;
  position: relative;
  width: $dialogProjectSettings-worldColorPalette-swatch-size;
}

.dialogProjectSettingsWorldColorPaletteSwatch--beingDragged {
  opacity: 0.45;
}

.dialogProjectSettingsWorldColorPaletteSwatch__color {
  border:
    $dialogProjectSettings-worldColorPalette-swatch-borderWidth
    solid
    $dialogProjectSettings-worldColorPalette-swatch-borderColor;
  box-sizing: border-box;
  display: block;
  height: 100%;
  width: 100%;
}

.dialogProjectSettingsWorldColorPaletteSwatch__duplicateIcon {
  font-size: $dialogProjectSettings-worldColorPalette-duplicateIcon-size;
  left: 50%;
  pointer-events: none;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}
</style>
