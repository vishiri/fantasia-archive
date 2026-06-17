<template>
  <q-dialog
    v-model="dialogModel"
    persistent
    :class="['dialogComponent', documentName]"
    aria-labelledby="dialogProjectSettings-title"
  >
    <q-card
      :class="['dialogComponent__wrapper', 'dialogProjectSettings', documentName]"
    >
      <h5
        id="dialogProjectSettings-title"
        class="dialogProjectSettings__title text-center text-h5"
        data-test-locator="dialogProjectSettings-title"
      >
        {{ $t('dialogs.projectSettings.title') }}
      </h5>

      <q-card-section class="dialogProjectSettings__body column no-wrap q-pa-none">
        <DialogProjectSettingsTabBar
          v-model:selected-category-tab="selectedCategoryTab"
          :document-templates-tab-has-error="hasDocumentTemplatesSettingsValidationError"
          :general-tab-has-error="hasGeneralSettingsValidationError"
          :worlds-tab-has-error="hasWorldsSettingsValidationError"
        />

        <DialogProjectSettingsPanelsColumn
          v-if="localSettings !== null"
          class="col"
          :document-templates="localDocumentTemplates"
          :project-name="localSettings.projectName"
          :project-name-has-error="hasGeneralSettingsValidationError"
          :selected-category-tab="selectedCategoryTab"
          :worlds="localWorlds"
          @add-document-template="addDocumentTemplate"
          @add-world="addWorld"
          @remove-document-template="removeDocumentTemplate"
          @remove-world="removeWorld"
          @update:document-templates="updateDocumentTemplatesOrder"
          @update:project-name="updateProjectName"
          @update:worlds="updateWorldsOrder"
          @update-document-template-display-name="updateDocumentTemplateDisplayName"
          @update-document-template-icon="updateDocumentTemplateIcon"
          @update-document-template-world-appendix="updateDocumentTemplateWorldAppendix"
          @update-world-color="updateWorldColor"
          @update-world-color-pallete="updateWorldColorPallete"
          @update-world-display-name="updateWorldDisplayName"
          @update-world-template-layout="updateWorldTemplateLayout"
        />
      </q-card-section>

      <q-card-actions
        align="right"
        class="q-mb-lg q-px-md q-gutter-sm dialogProjectSettings__cardActions"
      >
        <q-btn
          v-close-popup
          flat
          :label="$t('dialogs.projectSettings.closeButton')"
          class="q-mr-xl"
          color="accent"
          data-test-locator="dialogProjectSettings-button-close"
        />

        <div class="dialogProjectSettings__saveRow row items-center no-wrap">
          <q-btn
            outline
            :disable="isSaveDisabled"
            :label="$t('dialogs.projectSettings.saveButton')"
            color="primary-bright"
            data-test-locator="dialogProjectSettings-button-save"
            @click="void saveAndCloseDialog()"
          />

          <q-icon
            v-if="saveValidationErrorsTooltip.flatText.length > 0"
            name="mdi-alert-circle"
            color="negative"
            size="20px"
            class="dialogProjectSettings__saveErrorIcon q-ml-sm"
            data-test-locator="dialogProjectSettings-saveErrorsIcon"
            :data-test-tooltip-text="saveValidationErrorsTooltip.flatText"
          >
            <q-tooltip
              :delay="500"
              anchor="top end"
              content-class="dialogProjectSettings__saveErrorTooltip"
              :offset="saveErrorsTooltipOffset"
              self="bottom end"
            >
              <div class="dialogProjectSettings__saveErrorTooltipIntro">
                {{ saveValidationErrorsTooltip.intro }}
              </div>
              <div
                v-for="(bullet, bulletIndex) in saveValidationErrorsTooltip.bullets"
                :key="bulletIndex"
                class="dialogProjectSettings__saveErrorTooltipBullet"
              >
                {{ bullet }}
              </div>
            </q-tooltip>
          </q-icon>
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsProps } from 'app/types/I_dialogProjectSettings'
import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import DialogProjectSettingsTabBar from 'app/src/components/dialogs/DialogProjectSettings/DialogProjectSettingsTabBar.vue'
import DialogProjectSettingsPanelsColumn from 'app/src/components/dialogs/DialogProjectSettings/DialogProjectSettingsPanelsColumn.vue'
import { useDialogProjectSettings } from 'app/src/components/dialogs/DialogProjectSettings/scripts/dialogProjectSettings_manager'

defineOptions({
  name: 'DialogProjectSettings'
})

const props = defineProps<I_dialogProjectSettingsProps>()

const {
  addDocumentTemplate,
  addWorld,
  dialogModel,
  documentName,
  hasDocumentTemplatesSettingsValidationError,
  hasGeneralSettingsValidationError,
  hasWorldsSettingsValidationError,
  isSaveDisabled,
  localDocumentTemplates,
  localSettings,
  localWorlds,
  removeDocumentTemplate,
  removeWorld,
  saveAndCloseDialog,
  saveValidationErrorsTooltip,
  selectedCategoryTab,
  updateDocumentTemplateDisplayName,
  updateDocumentTemplateIcon,
  updateDocumentTemplateWorldAppendix,
  updateWorldColor,
  updateWorldColorPallete,
  updateWorldDisplayName,
  updateWorldTemplateLayout
} = useDialogProjectSettings(props)

const saveErrorsTooltipOffset: [number, number] = [0, 8]

function updateProjectName (value: string): void {
  if (localSettings.value === null) {
    return
  }
  const next: I_faProjectSettingsRoot = {
    ...localSettings.value,
    projectName: value
  }
  localSettings.value = next
}

function updateWorldsOrder (worlds: I_dialogProjectSettingsWorldDraft[]): void {
  localWorlds.value = worlds.map((world) => ({ ...world }))
}

function updateDocumentTemplatesOrder (
  templates: I_dialogProjectSettingsDocumentTemplateDraft[]
): void {
  localDocumentTemplates.value = templates.map((template) => ({ ...template }))
}
</script>

<style lang="scss" src="./styles/DialogProjectSettings.saveErrorsTooltip.unscoped.scss"></style>
<style lang="scss" src="./styles/DialogProjectSettings.templateQIconDisplay.unscoped.scss"></style>

<style lang="scss">
.ProjectSettings {
  &.dialogComponent__wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: calc(100vh - #{$dialogProjectSettings-card-maxHeightSubtract});
    max-width: calc(100vw - #{$dialogProjectSettings-card-maxWidthViewportSubtract});
    overflow: hidden;
    position: relative;
    width: $dialogProjectSettings-card-width;
  }

  .dialogProjectSettings__title {
    margin-bottom: 0;
    z-index: $dialogProjectSettings-title-zIndex;
  }

  .dialogProjectSettings__body {
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
  }

  .dialogProjectSettings__tabs .q-tab {
    padding: 0 $dialogProjectSettings-horizontalTab-paddingX;
  }
}
</style>
