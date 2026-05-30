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

      <q-card-section class="dialogProjectSettings__body row no-wrap q-pa-none">
        <DialogProjectSettingsLeftColumn
          v-model:selected-category-tab="selectedCategoryTab"
        />

        <DialogProjectSettingsPanelsColumn
          v-if="localSettings !== null"
          :project-name="localSettings.projectName"
          :selected-category-tab="selectedCategoryTab"
          @update:project-name="updateProjectName"
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

        <q-btn
          outline
          :disable="isSaveDisabled"
          :label="$t('dialogs.projectSettings.saveButton')"
          color="primary-bright"
          data-test-locator="dialogProjectSettings-button-save"
          @click="void saveAndCloseDialog()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsProps } from 'app/types/I_dialogProjectSettings'
import DialogProjectSettingsLeftColumn from 'app/src/components/dialogs/DialogProjectSettings/DialogProjectSettingsLeftColumn.vue'
import DialogProjectSettingsPanelsColumn from 'app/src/components/dialogs/DialogProjectSettings/DialogProjectSettingsPanelsColumn.vue'
import { useDialogProjectSettings } from 'app/src/components/dialogs/DialogProjectSettings/scripts/dialogProjectSettings_manager'

defineOptions({
  name: 'DialogProjectSettings'
})

const props = defineProps<I_dialogProjectSettingsProps>()

const {
  dialogModel,
  documentName,
  isSaveDisabled,
  localSettings,
  saveAndCloseDialog,
  selectedCategoryTab
} = useDialogProjectSettings(props)

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
</script>

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
    z-index: $dialogProjectSettings-title-zIndex;
  }

  .dialogProjectSettings__body {
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
  }

  .q-tabs--vertical .q-tab {
    padding: 0 $dialogProjectSettings-verticalTab-paddingX;
  }
}
</style>
