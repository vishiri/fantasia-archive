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
        <q-input
          :model-value="props.template.displayName"
          class="dialogProjectSettingsDocumentTemplatesDetail__nameInput"
          color="primary-bright"
          dark
          dense
          :data-test-validation-error="props.nameHasError ? 'true' : 'false'"
          data-test-locator="dialogProjectSettings-documentTemplates-nameInput"
          filled
          :error="props.nameHasError"
          :error-message="props.nameHasError ? $t('dialogs.projectSettings.fields.documentTemplateName.errorRequired') : undefined"
          outlined
          @update:model-value="emitDisplayName"
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
          >
            <q-tooltip
              :delay="500"
              content-class="dialogProjectSettings__fieldHelpTooltip"
            >
              {{ $t('dialogs.projectSettings.fields.documentTemplateWorldAppendix.tooltip') }}
            </q-tooltip>
          </q-icon>
        </div>
        <q-input
          :model-value="props.template.worldAppendix"
          class="dialogProjectSettingsDocumentTemplatesDetail__appendixInput"
          color="primary-bright"
          dark
          dense
          data-test-locator="dialogProjectSettings-documentTemplates-worldAppendixInput"
          filled
          outlined
          @update:model-value="emitWorldAppendix"
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
import DialogProjectSettingsDocumentTemplatesDeleteButton from './DialogProjectSettingsDocumentTemplatesDeleteButton.vue'
import FaIconPickerInput from 'app/src/components/elements/FaIconPickerInput/FaIconPickerInput.vue'
import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'

defineOptions({
  name: 'DialogProjectSettingsDocumentTemplatesDetailPanel'
})

const props = defineProps<{
  nameHasError: boolean
  removeDisabled: boolean
  template: I_dialogProjectSettingsDocumentTemplateDraft
}>()

const emit = defineEmits<{
  remove: []
  'update:displayName': [value: string]
  'update:icon': [value: string]
  'update:worldAppendix': [value: string]
}>()

function emitDisplayName (value: string | number | null): void {
  emit('update:displayName', value === null || value === undefined ? '' : String(value))
}

function emitWorldAppendix (value: string | number | null): void {
  emit('update:worldAppendix', value === null || value === undefined ? '' : String(value))
}

function emitIcon (value: string | number | null): void {
  emit('update:icon', value === null || value === undefined ? '' : String(value))
}
</script>

<style lang="scss" src="./styles/DialogProjectSettings.panelTitle.unscoped.scss"></style>

<style lang="scss" scoped>
.dialogProjectSettingsDocumentTemplatesDetail__fieldsRow {
  align-items: flex-start;
  display: flex;
  flex-wrap: nowrap;
  gap: $dialogProjectSettings-worldsDetailFieldsRow-gap;
}

.dialogProjectSettingsDocumentTemplatesDetail__nameField,
.dialogProjectSettingsDocumentTemplatesDetail__appendixField {
  flex: 1 1 auto;
  min-width: 0;
}

.dialogProjectSettingsDocumentTemplatesDetail__iconField {
  flex: 0 0 auto;
}

.dialogProjectSettingsDocumentTemplatesDetail__deleteCol {
  align-self: flex-end;
  flex: 0 0 auto;
  margin-bottom: $dialogProjectSettings-worldsDetailDeleteCol-marginBottom;
}
</style>
