<template>
  <div
    :class="editorRootClassList"
    class="dialogProjectSettingsWorldColorPalette"
    data-test-locator="dialogProjectSettings-worlds-colorPaletteEditor"
  >
    <component
      :is="VueDraggable"
      v-bind="faVerticalDraggableTabsSortableDragOptions"
      v-model="colorPaletteEntries"
      :animation="150"
      class="dialogProjectSettingsWorldColorPalette__draggable"
      :set-data="hideNativeSortableDragGhost"
      :touch-start-threshold="5"
      item-key="id"
      @end="onDragEnd"
      @start="onDragStart"
    >
      <DialogProjectSettingsWorldColorPaletteSwatch
        v-for="(entry, index) in colorPaletteEntries"
        :key="entry.id"
        :duplicate-disabled="wouldSwatchDuplicateExceedMaxLength(entry.id)"
        :duplicate-hex-keys="duplicateHexKeys"
        :entry-id="entry.id"
        :hex="entry.hex"
        :index="index"
        :is-being-dragged="entry.id === draggingEntryId"
        :is-list-dragging="isListDragging"
        :picker-open="openSwatchIndex === index"
        :world-picker-palette="worldPickerPalette"
        @delete="onSwatchDelete(entry.id)"
        @duplicate="onSwatchDuplicate(entry.id)"
        @picker-close="setOpenSwatchIndex(null)"
        @picker-open="setOpenSwatchIndex(index)"
        @update:hex="onSwatchColorUpdate(entry.id, $event)"
      />
    </component>
    <q-btn
      class="dialogProjectSettingsWorldColorPalette__addButton"
      color="primary-bright"
      :disable="isAddDisabled"
      flat
      icon="add"
      :aria-label="$t('dialogs.projectSettings.fields.worldColorPalette.addButton')"
      data-test-locator="dialogProjectSettings-worlds-colorPaletteAddButton"
      @click="onAddColor"
    />
  </div>
</template>

<script setup lang="ts">
import DialogProjectSettingsWorldColorPaletteSwatch from './DialogProjectSettingsWorldColorPaletteSwatch.vue'
import { useDialogProjectSettingsWorldColorPaletteEditor } from './scripts/dialogProjectSettingsWorldColorPaletteEditor_manager'

defineOptions({
  name: 'DialogProjectSettingsWorldColorPaletteEditor'
})

const props = defineProps<{
  colorPallete: string
}>()

const emit = defineEmits<{
  'update:colorPallete': [value: string]
}>()

const {
  VueDraggable,
  colorPaletteEntries,
  duplicateHexKeys,
  draggingEntryId,
  editorRootClassList,
  faVerticalDraggableTabsSortableDragOptions,
  hideNativeSortableDragGhost,
  isAddDisabled,
  isListDragging,
  onAddColor,
  onDragEnd,
  onDragStart,
  onSwatchColorUpdate,
  onSwatchDelete,
  onSwatchDuplicate,
  openSwatchIndex,
  worldPickerPalette,
  setOpenSwatchIndex,
  wouldSwatchDuplicateExceedMaxLength
} = useDialogProjectSettingsWorldColorPaletteEditor(props, emit)
</script>

<style lang="scss" src="./styles/DialogProjectSettings.worldColorPalette.unscoped.scss"></style>

<style lang="scss" scoped>
.dialogProjectSettingsWorldColorPalette {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  width: 100%;
}

.dialogProjectSettingsWorldColorPalette__draggable {
  display: contents;
}

.dialogProjectSettingsWorldColorPalette__addButton {
  flex: 0 0 auto;
  height: $dialogProjectSettings-worldColorPalette-addButton-size;
  min-height: $dialogProjectSettings-worldColorPalette-addButton-size;
  min-width: $dialogProjectSettings-worldColorPalette-addButton-size;
  width: $dialogProjectSettings-worldColorPalette-addButton-size;
}
</style>
