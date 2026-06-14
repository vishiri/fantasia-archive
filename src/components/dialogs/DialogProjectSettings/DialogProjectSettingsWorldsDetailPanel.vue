<template>
  <div class="dialogProjectSettings__worldsDetail">
    <div class="dialogProjectSettingsWorldsDetail__fieldsRow">
      <div class="dialogProjectSettingsWorldsDetail__nameField dialogProjectSettings__field">
        <div class="dialogProjectSettings__panelTitle">
          <span
            class="dialogProjectSettings__fieldLabel fa-text-label text-body2"
            data-test-locator="dialogProjectSettings-worlds-nameLabel"
          >
            {{ $t('dialogs.projectSettings.fields.worldName.label') }}
          </span>
        </div>
        <q-input
          :model-value="props.world.displayName"
          class="dialogProjectSettingsWorldsDetail__nameInput"
          color="primary-bright"
          dark
          dense
          :data-test-validation-error="props.nameHasError ? 'true' : 'false'"
          data-test-locator="dialogProjectSettings-worlds-nameInput"
          filled
          :error="props.nameHasError"
          :error-message="props.nameHasError ? $t('dialogs.projectSettings.fields.worldName.errorRequired') : undefined"
          outlined
          @update:model-value="emitDisplayName"
        />
      </div>

      <div class="dialogProjectSettingsWorldsDetail__colorField dialogProjectSettings__field">
        <div class="dialogProjectSettings__panelTitle">
          <span
            class="dialogProjectSettings__fieldLabel fa-text-label text-body2"
            data-test-locator="dialogProjectSettings-worlds-colorLabel"
          >
            {{ $t('dialogs.projectSettings.fields.worldColor.label') }}
          </span>
          <q-icon
            name="mdi-help-circle"
            size="16px"
            class="dialogProjectSettings__fieldHelpIcon q-ml-md"
            data-test-locator="dialogProjectSettings-worlds-colorTooltipIcon"
            :data-test-tooltip-text="$t('dialogs.projectSettings.fields.worldColor.tooltip')"
          >
            <q-tooltip
              :delay="500"
              content-class="dialogProjectSettings__fieldHelpTooltip"
            >
              {{ $t('dialogs.projectSettings.fields.worldColor.tooltip') }}
            </q-tooltip>
          </q-icon>
        </div>
        <FaColorPickerInput
          :model-value="props.world.color"
          :palette="worldPickerPalette"
          :palette-append="worldColorPaletteAppend"
          test-locator="dialogProjectSettings-worlds-colorInput"
          @append-to-world-palette="emitColorPallete"
          @update:model-value="emitColor"
        />
      </div>

      <div class="dialogProjectSettingsWorldsDetail__deleteCol">
        <DialogProjectSettingsWorldsDeleteButton
          :remove-disabled="props.removeDisabled"
          :remove-disabled-reason="props.removeDisabledReason"
          @confirm="emit('remove')"
        />
      </div>
    </div>

    <div class="dialogProjectSettingsWorldsDetail__paletteSection dialogProjectSettings__field">
      <div class="dialogProjectSettings__panelTitle">
        <span
          class="dialogProjectSettings__fieldLabel fa-text-label text-body2"
          data-test-locator="dialogProjectSettings-worlds-colorPaletteLabel"
        >
          {{ $t('dialogs.projectSettings.fields.worldColorPalette.label') }}
        </span>
        <q-icon
          name="mdi-help-circle"
          size="16px"
          class="dialogProjectSettings__fieldHelpIcon q-ml-md"
          data-test-locator="dialogProjectSettings-worlds-colorPaletteTooltipIcon"
          :data-test-tooltip-text="worldColorPaletteTooltip.flatText"
        >
          <q-tooltip
            :delay="500"
            content-class="dialogProjectSettings__fieldHelpTooltip"
          >
            <div class="dialogProjectSettings__fieldHelpTooltipIntro">
              {{ worldColorPaletteTooltip.intro }}
            </div>
            <div class="dialogProjectSettings__fieldHelpTooltipRightClickIntro">
              {{ worldColorPaletteTooltip.rightClickIntro }}
            </div>
            <div class="dialogProjectSettings__fieldHelpTooltipBullet">
              {{ worldColorPaletteTooltip.deletionBullet }}
            </div>
            <div class="dialogProjectSettings__fieldHelpTooltipBullet">
              {{ worldColorPaletteTooltip.duplicationBullet }}
            </div>
          </q-tooltip>
        </q-icon>
      </div>
      <DialogProjectSettingsWorldColorPaletteEditor
        :key="props.world.id"
        :color-pallete="props.world.colorPallete"
        @update:color-pallete="emitColorPallete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { i18n } from 'app/i18n/externalFileLoader'
import DialogProjectSettingsWorldsDeleteButton from './DialogProjectSettingsWorldsDeleteButton.vue'
import DialogProjectSettingsWorldColorPaletteEditor from './DialogProjectSettingsWorldColorPaletteEditor.vue'
import FaColorPickerInput from 'app/src/components/elements/FaColorPickerInput/FaColorPickerInput.vue'
import type { I_faColorPickerPaletteAppendConfig } from 'app/types/I_faColorPickerInput'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import { parseFaProjectWorldColorPalleteToHexList } from 'app/src/scripts/projectWorlds/functions/faProjectWorldColorPalleteHexList'
import { buildDialogProjectSettingsWorldColorPaletteTooltipContent } from './scripts/functions/dialogProjectSettingsWorldColorPaletteTooltip'

defineOptions({
  name: 'DialogProjectSettingsWorldsDetailPanel'
})

const props = defineProps<{
  nameHasError: boolean
  removeDisabled: boolean
  removeDisabledReason: 'hasDocuments' | 'lastWorld' | null
  world: I_dialogProjectSettingsWorldDraft
}>()

const worldPickerPalette = computed(() => {
  return parseFaProjectWorldColorPalleteToHexList(props.world.colorPallete)
})

const worldColorPaletteAppend = computed((): I_faColorPickerPaletteAppendConfig => ({
  mode: 'draft',
  worldColorPalette: props.world.colorPallete
}))

const worldColorPaletteTooltipI18nPrefix = 'dialogs.projectSettings.fields.worldColorPalette'

const worldColorPaletteTooltip = computed(() => {
  return buildDialogProjectSettingsWorldColorPaletteTooltipContent({
    deletionLabel: i18n.global.t(`${worldColorPaletteTooltipI18nPrefix}.tooltipRightClickDeletion`),
    duplicationLabel: i18n.global.t(`${worldColorPaletteTooltipI18nPrefix}.tooltipRightClickDuplication`),
    intro: i18n.global.t(`${worldColorPaletteTooltipI18nPrefix}.tooltipIntro`),
    rightClickIntro: i18n.global.t(`${worldColorPaletteTooltipI18nPrefix}.tooltipRightClickIntro`)
  })
})

const emit = defineEmits<{
  remove: []
  'update:color': [value: string]
  'update:colorPallete': [value: string]
  'update:displayName': [value: string]
}>()

function emitDisplayName (value: string | number | null): void {
  emit('update:displayName', value === null || value === undefined ? '' : String(value))
}

function emitColor (value: string): void {
  emit('update:color', value)
}

function emitColorPallete (value: string): void {
  emit('update:colorPallete', value)
}
</script>

<style lang="scss" src="./styles/DialogProjectSettings.panelTitle.unscoped.scss"></style>

<style lang="scss" scoped>
.dialogProjectSettingsWorldsDetail__fieldsRow {
  align-items: flex-start;
  display: flex;
  flex-wrap: nowrap;
  gap: $dialogProjectSettings-worldsDetailFieldsRow-gap;
}

.dialogProjectSettingsWorldsDetail__nameField {
  flex: 1 1 auto;
  min-width: 0;
}

.dialogProjectSettingsWorldsDetail__colorField {
  flex: 0 0 auto;
}

.dialogProjectSettingsWorldsDetail__deleteCol {
  align-self: flex-end;
  flex: 0 0 auto;
  margin-bottom: $dialogProjectSettings-worldsDetailDeleteCol-marginBottom;
}

.dialogProjectSettingsWorldsDetail__paletteSection {
  margin-top: $dialogProjectSettings-worldsDetailPaletteSection-marginTop;
  width: 100%;
}
</style>
