<template>
  <q-dialog
    v-model="dialogModel"
    :class="['dialogComponent', documentName, 'importExportAppConfig']"
    :aria-label="$t('dialogs.importExportAppConfig.ariaLabel')"
  >
    <q-card
      :class="['dialogComponent__wrapper', 'importExportAppConfig', documentName]"
    >
      <h5
        id="dialogImportExportAppConfig-title"
        class="q-mb-md text-center text-h5"
      >
        {{ $t('dialogs.importExportAppConfig.title') }}
      </h5>

      <q-card-section
        :class="['dialogComponent__content', 'importExportAppConfig', documentName, 'hasScrollbar', 'q-pt-none']"
      >
        <q-stepper
          v-model="stepperPanel"
          :header-nav="false"
          flat
          :linear="false"
          class="importExportAppConfig__stepper"
        >
          <q-step
            :name="'root'"
            :header-nav="false"
            :title="$t('dialogs.importExportAppConfig.stepper.rootPanel')"
          >
            <h6 class="text-primary-bright text-center q-mt-lg q-mb-none">
              {{ $t('dialogs.importExportAppConfig.notice.heading') }}
            </h6>
            <q-card-section class="row q-mx-xl">
              <ul>
                <li>{{ $t('dialogs.importExportAppConfig.notice.list.exportFirst') }}</li>
                <li>{{ $t('dialogs.importExportAppConfig.notice.list.importOverwrites') }}</li>
                <li>{{ $t('dialogs.importExportAppConfig.notice.list.selectiveImport') }}</li>
              </ul>
            </q-card-section>
            <q-card-section class="q-pa-none importExportAppConfig__rootActions q-mb-sm q-mt-sm">
              <div class="row no-wrap importExportAppConfig__rootActionRow">
                <div class="col importExportAppConfig__rootActionCol">
                  <q-card-actions
                    align="center"
                    class="importExportAppConfig__rootActionActions"
                  >
                    <q-btn
                      flat
                      class="importExportAppConfig__rootActionBtn full-width"
                      color="primary-bright"
                      data-test-locator="dialogImportExportAppConfig-button-import"
                      :label="$t('dialogs.importExportAppConfig.importButton')"
                      @click="void onClickImport()"
                    />
                  </q-card-actions>
                </div>

                <q-separator
                  class="fa-separator-grey-lighter"
                  inset
                  vertical
                />

                <div class="col importExportAppConfig__rootActionCol">
                  <q-card-actions
                    align="center"
                    class="importExportAppConfig__rootActionActions"
                  >
                    <q-btn
                      flat
                      class="importExportAppConfig__rootActionBtn full-width"
                      color="primary-bright"
                      data-test-locator="dialogImportExportAppConfig-button-export"
                      :label="$t('dialogs.importExportAppConfig.exportButton')"
                      @click="onClickExportNav"
                    />
                  </q-card-actions>
                </div>
              </div>
            </q-card-section>
          </q-step>

          <q-step
            :name="'export'"
            :header-nav="false"
            :title="$t('dialogs.importExportAppConfig.stepper.exportPanel')"
          >
            <DialogImportExportAppConfigExportStep
              v-model:export-include-keybinds="exportIncludeKeybinds"
              v-model:export-include-app-noteboard="exportIncludeAppNoteboard"
              v-model:export-include-app-settings="exportIncludeAppSettings"
              v-model:export-include-app-styling="exportIncludeAppStyling"
              :create-export-disabled="createExportDisabled"
              @click-create-export="onClickCreateExport"
            />
          </q-step>

          <q-step
            :name="'import'"
            :header-nav="false"
            :title="$t('dialogs.importExportAppConfig.stepper.importPanel')"
          >
            <DialogImportExportAppConfigImportStep
              v-model:import-apply-keybinds="importApplyKeybinds"
              v-model:import-apply-app-noteboard="importApplyAppNoteboard"
              v-model:import-apply-app-settings="importApplyAppSettings"
              v-model:import-apply-app-styling="importApplyAppStyling"
              :import-apply-disabled="importApplyDisabled"
              :keybinds-import-enabled="keybindsImportEnabled"
              :app-noteboard-import-enabled="appNoteboardImportEnabled"
              :app-settings-import-enabled="appSettingsImportEnabled"
              :app-styling-import-enabled="appStylingImportEnabled"
              @click-import-selected="onClickImportSelected"
            />
          </q-step>
        </q-stepper>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import { ref, toRef, watch } from 'vue'

import type { T_importExportStepperPanel } from 'app/types/I_dialogImportExportAppConfig'
import { importExportViewToStepperPanel } from './scripts/functions/dialogImportExportAppConfigStepperMap'
import {
  useDialogImportExportAppConfigDialog,
  useDialogImportExportAppConfigLifecycle
} from './scripts/dialogImportExportAppConfig_manager'

import DialogImportExportAppConfigExportStep from './DialogImportExportAppConfigExportStep.vue'
import DialogImportExportAppConfigImportStep from './DialogImportExportAppConfigImportStep.vue'

const props = defineProps<{
  directInput?: T_dialogName | undefined
}>()

const documentName: T_dialogName = 'ImportExportAppConfig'

const {
  createExportDisabled,
  dialogModel,
  exportIncludeKeybinds,
  exportIncludeAppNoteboard,
  exportIncludeAppSettings,
  exportIncludeAppStyling,
  importApplyDisabled,
  importApplyKeybinds,
  importApplyAppNoteboard,
  importApplyAppSettings,
  importApplyAppStyling,
  keybindsImportEnabled,
  onClickCreateExport,
  onClickImport,
  onClickImportSelected,
  appNoteboardImportEnabled,
  appSettingsImportEnabled,
  appStylingImportEnabled,
  view
} = useDialogImportExportAppConfigDialog({
  onRequestClose: () => {
    dialogModel.value = false
  }
})

const stepperPanel = ref<T_importExportStepperPanel>(importExportViewToStepperPanel(view.value))
watch(
  view,
  (v) => {
    stepperPanel.value = importExportViewToStepperPanel(v)
  },
  { flush: 'sync' }
)

function onClickExportNav (): void {
  view.value = 'export'
  stepperPanel.value = 'export'
}

useDialogImportExportAppConfigLifecycle({
  dialogModel,
  directInput: toRef(props, 'directInput')
})
</script>

<style lang="scss" scoped src="./styles/DialogImportExportAppConfig.scoped.scss"></style>
