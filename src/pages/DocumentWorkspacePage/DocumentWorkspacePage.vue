<template>
  <main
    class="documentWorkspacePage q-page column no-wrap q-pa-xl"
    :class="workspacePageExtraHtmlClassList"
    data-test-locator="documentWorkspacePage"
  >
    <h4
      v-if="documentShowsPreview"
      class="documentWorkspacePage__previewTitle q-ma-none"
      data-test-locator="documentWorkspacePage-previewTitle"
    >
      {{ previewDisplayName }}
    </h4>
    <q-input
      v-if="documentShowsEditFields"
      v-model="displayNameModel"
      class="documentWorkspacePage__nameInput"
      data-test-locator="documentWorkspacePage-nameInput"
      :label="nameFieldLabel"
      outlined
      dense
    />

    <DocumentWorkspacePageBelongsUnderField
      v-model:belongs-under-model="belongsUnderModel"
      :belongs-under-field-description="belongsUnderFieldDescription"
      :belongs-under-field-label="belongsUnderFieldLabel"
      :belongs-under-field-read-only="belongsUnderFieldReadOnly"
      :document-tab="documentTab"
      :one-way-relationship-tooltip="oneWayRelationshipTooltip"
    />

    <div
      v-if="documentTab !== null"
      class="documentWorkspacePage__colorFields"
    >
      <div class="documentWorkspacePage__field dialogProjectSettings__field">
        <div class="documentWorkspacePage__fieldTitle">
          <span
            class="documentWorkspacePage__fieldLabel fa-text-label text-body2"
            data-test-locator="documentWorkspacePage-textColorLabel"
          >
            {{ textColorFieldLabel }}
          </span>
          <q-icon
            name="mdi-help-circle"
            size="16px"
            class="documentWorkspacePage__fieldHelpIcon q-ml-md"
            data-test-locator="documentWorkspacePage-textColorHelpIcon"
            :data-test-tooltip-text="textColorFieldDescription"
          >
            <q-tooltip>
              {{ textColorFieldDescription }}
            </q-tooltip>
          </q-icon>
        </div>
        <FaColorPickerInput
          v-model="textColorModel"
          :palette="worldPickerPalette"
          :palette-append="worldColorPaletteAppend"
          :read-only="documentColorPickersReadOnly"
          test-locator="documentWorkspacePage-textColorInput"
          @append-to-world-palette="onAppendToWorldPalette"
        />
      </div>

      <div class="documentWorkspacePage__field dialogProjectSettings__field">
        <div class="documentWorkspacePage__fieldTitle">
          <span
            class="documentWorkspacePage__fieldLabel fa-text-label text-body2"
            data-test-locator="documentWorkspacePage-backgroundColorLabel"
          >
            {{ backgroundColorFieldLabel }}
          </span>
          <q-icon
            name="mdi-help-circle"
            size="16px"
            class="documentWorkspacePage__fieldHelpIcon q-ml-md"
            data-test-locator="documentWorkspacePage-backgroundColorHelpIcon"
            :data-test-tooltip-text="backgroundColorFieldDescription"
          >
            <q-tooltip>
              {{ backgroundColorFieldDescription }}
            </q-tooltip>
          </q-icon>
        </div>
        <FaColorPickerInput
          v-model="backgroundColorModel"
          :palette="worldPickerPalette"
          :palette-append="worldColorPaletteAppend"
          :read-only="documentColorPickersReadOnly"
          test-locator="documentWorkspacePage-backgroundColorInput"
          @append-to-world-palette="onAppendToWorldPalette"
        />
      </div>
    </div>

    <DocumentWorkspacePageExtraHtmlClassesField
      v-model:extra-html-classes-model="extraHtmlClassesModel"
      :document-tab="documentTab"
      :extra-html-classes-field-description="extraHtmlClassesFieldDescription"
      :extra-html-classes-field-label="extraHtmlClassesFieldLabel"
      :extra-html-classes-field-read-only="extraHtmlClassesFieldReadOnly"
    />

    <DocumentWorkspacePageOrderNumberField
      v-model:order-number-model="orderNumberModel"
      :document-tab="documentTab"
      :order-number-field-description="orderNumberFieldDescription"
      :order-number-field-label="orderNumberFieldLabel"
      :order-number-field-read-only="orderNumberFieldReadOnly"
    />

    <FaLabeledBooleanToggle
      v-if="documentTab !== null"
      v-model="isCategoryModel"
      class="documentWorkspacePage__isCategoryToggle q-mt-md"
      :description="isCategoryDescription"
      :disabled="isCategoryToggleReadOnly"
      test-locator="documentWorkspacePage-isCategoryToggle"
      :title="isCategoryTitle"
    />

    <FaLabeledBooleanToggle
      v-if="documentTab !== null"
      v-model="isFinishedModel"
      class="documentWorkspacePage__isFinishedToggle q-mt-md"
      :description="isFinishedDescription"
      :disabled="isFinishedToggleReadOnly"
      icon="mdi-check-bold"
      test-locator="documentWorkspacePage-isFinishedToggle"
      :title="isFinishedTitle"
    />

    <FaLabeledBooleanToggle
      v-if="documentTab !== null"
      v-model="isMinorModel"
      class="documentWorkspacePage__isMinorToggle q-mt-md"
      :description="isMinorDescription"
      :disabled="isMinorToggleReadOnly"
      icon="mdi-magnify-minus-outline"
      test-locator="documentWorkspacePage-isMinorToggle"
      :title="isMinorTitle"
    />

    <FaLabeledBooleanToggle
      v-if="documentTab !== null"
      v-model="isDeadModel"
      class="documentWorkspacePage__isDeadToggle q-mt-md"
      :description="isDeadDescription"
      :disabled="isDeadToggleReadOnly"
      icon="mdi-skull-crossbones"
      test-locator="documentWorkspacePage-isDeadToggle"
      :title="isDeadTitle"
    />
  </main>
</template>

<script lang="ts" setup>
import FaColorPickerInput from 'app/src/components/elements/FaColorPickerInput/FaColorPickerInput.vue'
import FaLabeledBooleanToggle from 'app/src/components/elements/FaLabeledBooleanToggle/FaLabeledBooleanToggle.vue'

import DocumentWorkspacePageBelongsUnderField from './DocumentWorkspacePageBelongsUnderField.vue'
import DocumentWorkspacePageExtraHtmlClassesField from './DocumentWorkspacePageExtraHtmlClassesField.vue'
import DocumentWorkspacePageOrderNumberField from './DocumentWorkspacePageOrderNumberField.vue'
import { useDocumentWorkspacePage } from './scripts/documentWorkspacePage_manager'

defineOptions({
  name: 'DocumentWorkspacePage'
})

const {
  backgroundColorFieldDescription,
  backgroundColorFieldLabel,
  backgroundColorModel,
  belongsUnderFieldDescription,
  belongsUnderFieldLabel,
  belongsUnderFieldReadOnly,
  belongsUnderModel,
  displayNameModel,
  documentColorPickersReadOnly,
  documentShowsEditFields,
  documentShowsPreview,
  documentTab,
  extraHtmlClassesFieldDescription,
  extraHtmlClassesFieldLabel,
  extraHtmlClassesFieldReadOnly,
  extraHtmlClassesModel,
  workspacePageExtraHtmlClassList,
  isCategoryDescription,
  isCategoryModel,
  isCategoryTitle,
  isDeadDescription,
  isDeadModel,
  isDeadTitle,
  isDeadToggleReadOnly,
  isFinishedDescription,
  isFinishedModel,
  isFinishedTitle,
  isFinishedToggleReadOnly,
  isMinorDescription,
  isMinorModel,
  isMinorTitle,
  isMinorToggleReadOnly,
  nameFieldLabel,
  oneWayRelationshipTooltip,
  onAppendToWorldPalette,
  orderNumberFieldDescription,
  orderNumberFieldLabel,
  orderNumberFieldReadOnly,
  orderNumberModel,
  previewDisplayName,
  isCategoryToggleReadOnly,
  textColorFieldDescription,
  textColorFieldLabel,
  textColorModel,
  worldColorPaletteAppend,
  worldPickerPalette
} = useDocumentWorkspacePage()
</script>

<style lang="scss" scoped>
.documentWorkspacePage__colorFields {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
  max-width: 100%;
}

.documentWorkspacePage__field {
  max-width: 100%;
}

.documentWorkspacePage__fieldTitle {
  align-items: center;
  display: flex;
  justify-content: flex-start;
  margin-bottom: 8px;
}

.documentWorkspacePage__fieldHelpIcon {
  align-self: flex-start;
}

.documentWorkspacePage__fieldLabel {
  display: block;
}
</style>
