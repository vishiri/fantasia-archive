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
        <FaLocaleTranslationsInput
          :model-value="props.world.displayNameTranslations"
          class="dialogProjectSettingsWorldsDetail__nameInput"
          :current-language-code="props.currentLanguageCode"
          :data-test-validation-error="props.nameHasError ? 'true' : 'false'"
          dense
          :error="props.nameHasError"
          :error-message="props.nameHasError ? $t('dialogs.projectSettings.fields.worldName.errorRequired') : undefined"
          :hide-bottom-space="!props.nameHasError"
          :max-length="FA_PROJECT_WORLD_DISPLAY_NAME_TRANSLATION_MAX_LENGTH"
          test-locator="dialogProjectSettings-worlds-nameInput"
          @update:model-value="(value) => emitDisplayNameTranslations(value as I_faProjectWorldDisplayNameTranslations)"
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

    <DialogProjectSettingsWorldTemplateLayoutPanel
      v-if="props.documentTemplates !== null"
      :current-language-code="props.currentLanguageCode"
      :document-templates="props.documentTemplates"
      :world="props.world"
      @update:template-layout="emitTemplateLayout"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { i18n } from 'app/i18n/externalFileLoader'
import DialogProjectSettingsWorldsDeleteButton from './DialogProjectSettingsWorldsDeleteButton.vue'
import DialogProjectSettingsWorldColorPaletteEditor from './DialogProjectSettingsWorldColorPaletteEditor.vue'
import DialogProjectSettingsWorldTemplateLayoutPanel from './DialogProjectSettingsWorldTemplateLayoutPanel.vue'
import FaColorPickerInput from 'app/src/components/elements/FaColorPickerInput/FaColorPickerInput.vue'
import FaLocaleTranslationsInput from 'app/src/components/elements/FaLocaleTranslationsInput/FaLocaleTranslationsInput.vue'
import { FA_PROJECT_WORLD_DISPLAY_NAME_TRANSLATION_MAX_LENGTH } from 'app/types/I_faProjectWorldDisplayNameTranslations'
import type { I_faProjectWorldDisplayNameTranslations } from 'app/types/I_faProjectWorldDisplayNameTranslations'
import type { I_faColorPickerPaletteAppendConfig } from 'app/types/I_faColorPickerInput'
import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_dialogProjectSettingsWorldTemplateLayoutDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import { parseFaProjectWorldColorPalleteToHexList } from 'app/src/scripts/projectWorlds/functions/faProjectWorldColorPalleteHexList'
import { buildDialogProjectSettingsWorldColorPaletteTooltipContent } from './scripts/functions/dialogProjectSettingsWorldColorPaletteTooltip'

defineOptions({
  name: 'DialogProjectSettingsWorldsDetailPanel'
})

const props = defineProps<{
  currentLanguageCode: T_faUserSettingsLanguageCode
  documentTemplates: I_dialogProjectSettingsDocumentTemplateDraft[] | null
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
  'update:displayNameTranslations': [value: I_faProjectWorldDisplayNameTranslations]
  'update:templateLayout': [layout: I_dialogProjectSettingsWorldTemplateLayoutDraft]
}>()

function emitDisplayNameTranslations (value: I_faProjectWorldDisplayNameTranslations): void {
  emit('update:displayNameTranslations', value)
}

function emitColor (value: string): void {
  emit('update:color', value)
}

function emitColorPallete (value: string): void {
  emit('update:colorPallete', value)
}

function emitTemplateLayout (layout: I_dialogProjectSettingsWorldTemplateLayoutDraft): void {
  emit('update:templateLayout', layout)
}
</script>

<style lang="scss" src="./styles/DialogProjectSettings.panelTitle.unscoped.scss"></style>

<style lang="scss" scoped>
.dialogProjectSettingsWorldsDetail__fieldsRow {
  align-items: flex-start;
  display: flex;
  flex: 0 0 auto;
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
  flex: 0 0 auto;
  margin-top: $dialogProjectSettings-worldsDetailPaletteSection-marginTop;
  width: 100%;
}

.dialogProjectSettingsWorldsDetail__paletteSection :deep(.dialogProjectSettings__panelTitle) {
  margin-top: 0;
}
</style>
