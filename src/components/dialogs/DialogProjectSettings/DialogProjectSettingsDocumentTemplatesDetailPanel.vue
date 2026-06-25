<template>
  <div class="dialogProjectSettings__documentTemplatesDetail">
    <div class="dialogProjectSettingsDocumentTemplatesDetail__fieldsRow">
      <div class="dialogProjectSettingsDocumentTemplatesDetail__nameField dialogProjectSettings__field">
        <div class="dialogProjectSettings__panelTitle">
          <span
            class="dialogProjectSettings__fieldLabel fa-text-label text-body2"
            data-test-locator="dialogProjectSettings-documentTemplates-nameLabel"
          >
            {{ $t('dialogs.projectSettings.fields.documentTemplateName.label') }}
          </span>
        </div>
        <FaLocaleTranslationsInput
          translation-forms="singularPlural"
          :model-value="{
            singular: props.template.titleSingularTranslations,
            plural: props.template.titlePluralTranslations
          }"
          class="dialogProjectSettingsDocumentTemplatesDetail__nameInput"
          :current-language-code="props.currentLanguageCode"
          :data-test-validation-error="props.nameHasError ? 'true' : 'false'"
          dense
          :error="props.nameHasError"
          :error-message="props.nameHasError ? $t('dialogs.projectSettings.fields.documentTemplateName.errorRequired') : undefined"
          :hide-bottom-space="!props.nameHasError"
          :max-length="FA_PROJECT_DOCUMENT_TEMPLATE_TITLE_TRANSLATION_MAX_LENGTH"
          test-locator="dialogProjectSettings-documentTemplates-nameInput"
          @update:model-value="(value) => emitTitleTranslations(value as I_faLocaleSingularPluralTranslations)"
        />
      </div>

      <div class="dialogProjectSettingsDocumentTemplatesDetail__appendixField dialogProjectSettings__field">
        <div class="dialogProjectSettings__panelTitle">
          <span
            class="dialogProjectSettings__fieldLabel fa-text-label text-body2"
            data-test-locator="dialogProjectSettings-documentTemplates-worldAppendixLabel"
          >
            {{ $t('dialogs.projectSettings.fields.documentTemplateWorldAppendix.label') }}
          </span>
          <q-icon
            name="mdi-help-circle"
            size="16px"
            class="dialogProjectSettings__fieldHelpIcon q-ml-md"
            data-test-locator="dialogProjectSettings-documentTemplates-worldAppendixTooltipIcon"
            :data-test-tooltip-text="$t('dialogs.projectSettings.fields.documentTemplateWorldAppendix.tooltip')"
            :aria-label="$t('dialogs.projectSettings.fields.documentTemplateWorldAppendix.helpAriaLabel')"
          >
            <q-tooltip
              content-class="dialogProjectSettings__fieldHelpTooltip"
            >
              {{ $t('dialogs.projectSettings.fields.documentTemplateWorldAppendix.tooltip') }}
            </q-tooltip>
          </q-icon>
        </div>
        <FaLocaleTranslationsInput
          :model-value="props.template.worldAppendixTranslations"
          class="dialogProjectSettingsDocumentTemplatesDetail__appendixInput"
          :current-language-code="props.currentLanguageCode"
          dense
          :max-length="FA_PROJECT_DOCUMENT_TEMPLATE_WORLD_APPENDIX_TRANSLATION_MAX_LENGTH"
          test-locator="dialogProjectSettings-documentTemplates-worldAppendixInput"
          @update:model-value="(value) => emitWorldAppendixTranslations(value as I_faProjectDocumentTemplateWorldAppendixTranslations)"
        />
      </div>

      <div class="faIconPickerInput__field dialogProjectSettingsDocumentTemplatesDetail__iconField dialogProjectSettings__field">
        <div class="dialogProjectSettings__panelTitle">
          <span
            class="dialogProjectSettings__fieldLabel fa-text-label text-body2"
            data-test-locator="dialogProjectSettings-documentTemplates-iconLabel"
          >
            {{ $t('dialogs.projectSettings.fields.documentTemplateIcon.label') }}
          </span>
        </div>
        <FaIconPickerInput
          :model-value="props.template.icon"
          test-locator="dialogProjectSettings-documentTemplates-iconInput"
          @update:model-value="emitIcon"
        />
      </div>

      <div class="dialogProjectSettingsDocumentTemplatesDetail__deleteCol">
        <DialogProjectSettingsDocumentTemplatesDeleteButton
          :remove-disabled="props.removeDisabled"
          @confirm="emit('remove')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FA_PROJECT_DOCUMENT_TEMPLATE_TITLE_TRANSLATION_MAX_LENGTH } from 'app/types/I_faProjectDocumentTemplateTitleTranslations'
import { FA_PROJECT_DOCUMENT_TEMPLATE_WORLD_APPENDIX_TRANSLATION_MAX_LENGTH } from 'app/types/I_faProjectDocumentTemplateWorldAppendixTranslations'

import DialogProjectSettingsDocumentTemplatesDeleteButton from './DialogProjectSettingsDocumentTemplatesDeleteButton.vue'
import FaIconPickerInput from 'app/src/components/elements/FaIconPickerInput/FaIconPickerInput.vue'
import FaLocaleTranslationsInput from 'app/src/components/elements/FaLocaleTranslationsInput/FaLocaleTranslationsInput.vue'
import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faProjectDocumentTemplateWorldAppendixTranslations } from 'app/types/I_faProjectDocumentTemplateWorldAppendixTranslations'

defineOptions({
  name: 'DialogProjectSettingsDocumentTemplatesDetailPanel'
})

const props = defineProps<{
  currentLanguageCode: T_faUserSettingsLanguageCode
  nameHasError: boolean
  removeDisabled: boolean
  template: I_dialogProjectSettingsDocumentTemplateDraft
}>()

const emit = defineEmits<{
  remove: []
  'update:icon': [value: string]
  'update:title-translations': [value: I_faLocaleSingularPluralTranslations]
  'update:worldAppendixTranslations': [value: I_faProjectDocumentTemplateWorldAppendixTranslations]
}>()

function emitTitleTranslations (value: I_faLocaleSingularPluralTranslations): void {
  emit('update:title-translations', value)
}

function emitWorldAppendixTranslations (
  value: I_faProjectDocumentTemplateWorldAppendixTranslations
): void {
  emit('update:worldAppendixTranslations', value)
}

function emitIcon (value: string | number | null): void {
  emit('update:icon', value === null || value === undefined ? '' : String(value))
}
</script>

<style lang="scss" src="./styles/DialogProjectSettings.panelTitle.unscoped.scss"></style>

<style lang="scss" scoped>
.dialogProjectSettingsDocumentTemplatesDetail__fieldsRow {
  align-items: flex-end;
  display: flex;
  flex-wrap: nowrap;
  gap: $dialogProjectSettings-worldsDetailFieldsRow-gap;
}

.dialogProjectSettingsDocumentTemplatesDetail__nameField {
  flex: 1 1 auto;
  min-width: 0;
}

.dialogProjectSettingsDocumentTemplatesDetail__nameInput {
  flex: 1 1 auto;
  min-width: 0;
}

.dialogProjectSettingsDocumentTemplatesDetail__appendixField {
  flex: 1 1 auto;
  max-width: $dialogProjectSettings-documentTemplatesWorldAppendixField-maxWidth;
  min-width: 0;
}

.dialogProjectSettingsDocumentTemplatesDetail__iconField {
  flex: 0 0 auto;
}

.dialogProjectSettingsDocumentTemplatesDetail__deleteCol {
  flex: 0 0 auto;
}
</style>
