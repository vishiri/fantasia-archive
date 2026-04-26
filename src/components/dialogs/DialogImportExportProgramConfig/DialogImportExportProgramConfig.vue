<template>
  <q-dialog
    v-model="dialogModel"
    :class="['dialogComponent', documentName, 'importExportProgramConfig']"
    :aria-label="$t('dialogs.importExportProgramConfig.ariaLabel')"
  >
    <q-card
      :class="['dialogComponent__wrapper', 'importExportProgramConfig', documentName]"
    >
      <h5
        id="dialogImportExportProgramConfig-title"
        class="q-mb-md text-center"
      >
        {{ $t('dialogs.importExportProgramConfig.title') }}
      </h5>

      <q-card-section
        :class="['dialogComponent__content', 'importExportProgramConfig', documentName, 'hasScrollbar', 'q-pt-none']"
      >
        <q-stepper
          v-model="stepperPanel"
          animated
          :header-nav="false"
          flat
          class="importExportProgramConfig__stepper"
        >
          <q-step
            :name="'import'"
            :header-nav="false"
            :title="$t('dialogs.importExportProgramConfig.stepper.importPanel')"
          >
            <div class="q-gutter-y-sm">
              <h6 class="text-primary-bright text-center q-mt-lg q-mb-md">
                {{ $t('dialogs.importExportProgramConfig.importSelectHint') }}
              </h6>

              <q-list class="q-pl-xl q-pr-xl">
                <DialogImportExportProgramConfigQItemCheckboxRow
                  v-model="importApplyProgramSettings"
                  checkbox-color="dark"
                  data-test-locator="dialogImportExportProgramConfig-check-import-settings"
                  :disabled="!programSettingsImportEnabled"
                  label-i18n-key="dialogs.importExportProgramConfig.checkboxes.programSettings"
                />
                <DialogImportExportProgramConfigQItemCheckboxRow
                  v-model="importApplyKeybinds"
                  checkbox-color="dark"
                  data-test-locator="dialogImportExportProgramConfig-check-import-keybinds"
                  :disabled="!keybindsImportEnabled"
                  label-i18n-key="dialogs.importExportProgramConfig.checkboxes.keybinds"
                />
                <DialogImportExportProgramConfigQItemCheckboxRow
                  v-model="importApplyProgramStyling"
                  checkbox-color="dark"
                  data-test-locator="dialogImportExportProgramConfig-check-import-styling"
                  :disabled="!programStylingImportEnabled"
                  label-i18n-key="dialogs.importExportProgramConfig.checkboxes.programStyling"
                />
              </q-list>
              <div class="row justify-center q-mt-lg q-mb-lg">
                <q-btn
                  color="primary-bright"
                  :disable="importApplyDisabled"
                  :label="$t('dialogs.importExportProgramConfig.importSelected')"
                  data-test-locator="dialogImportExportProgramConfig-button-importSelected"
                  outline
                  @click="onClickImportSelected"
                />
              </div>
            </div>
          </q-step>

          <q-step
            :name="'root'"
            :header-nav="false"
            :title="$t('dialogs.importExportProgramConfig.stepper.rootPanel')"
          >
            <h6 class="text-primary-bright text-center q-mt-lg q-mb-none">
              {{ $t('dialogs.importExportProgramConfig.notice.heading') }}
            </h6>
            <q-card-section class="row q-mx-xl">
              <ul>
                <li>{{ $t('dialogs.importExportProgramConfig.notice.list.exportFirst') }}</li>
                <li>{{ $t('dialogs.importExportProgramConfig.notice.list.importOverwrites') }}</li>
                <li>{{ $t('dialogs.importExportProgramConfig.notice.list.selectiveImport') }}</li>
              </ul>
            </q-card-section>
            <q-card-section class="q-pa-none importExportProgramConfig__rootActions q-mb-sm q-mt-sm">
              <div class="row no-wrap importExportProgramConfig__rootActionRow">
                <div class="col importExportProgramConfig__rootActionCol">
                  <q-card-actions
                    align="center"
                    class="importExportProgramConfig__rootActionActions"
                  >
                    <q-btn
                      flat
                      class="importExportProgramConfig__rootActionBtn full-width"
                      color="primary-bright"
                      data-test-locator="dialogImportExportProgramConfig-button-import"
                      :label="$t('dialogs.importExportProgramConfig.importButton')"
                      @click="void onClickImport()"
                    />
                  </q-card-actions>
                </div>

                <q-separator
                  class="fa-separator-grey-lighter"
                  inset
                  vertical
                />

                <div class="col importExportProgramConfig__rootActionCol">
                  <q-card-actions
                    align="center"
                    class="importExportProgramConfig__rootActionActions"
                  >
                    <q-btn
                      flat
                      class="importExportProgramConfig__rootActionBtn full-width"
                      color="primary-bright"
                      data-test-locator="dialogImportExportProgramConfig-button-export"
                      :label="$t('dialogs.importExportProgramConfig.exportButton')"
                      @click="view = 'export'"
                    />
                  </q-card-actions>
                </div>
              </div>
            </q-card-section>
          </q-step>

          <q-step
            :name="'export'"
            :header-nav="false"
            :title="$t('dialogs.importExportProgramConfig.stepper.exportPanel')"
          >
            <div class="q-gutter-y-sm">
              <h6 class="text-primary-bright text-center q-mt-lg q-mb-md">
                {{ $t('dialogs.importExportProgramConfig.exportHint') }}
              </h6>

              <q-list class="q-pl-xl q-pr-xl">
                <DialogImportExportProgramConfigQItemCheckboxRow
                  v-model="exportIncludeProgramSettings"
                  checkbox-color="dark"
                  data-test-locator="dialogImportExportProgramConfig-check-export-settings"
                  label-i18n-key="dialogs.importExportProgramConfig.checkboxes.programSettings"
                />
                <DialogImportExportProgramConfigQItemCheckboxRow
                  v-model="exportIncludeKeybinds"
                  checkbox-color="dark"
                  data-test-locator="dialogImportExportProgramConfig-check-export-keybinds"
                  label-i18n-key="dialogs.importExportProgramConfig.checkboxes.keybinds"
                />
                <DialogImportExportProgramConfigQItemCheckboxRow
                  v-model="exportIncludeProgramStyling"
                  checkbox-color="dark"
                  data-test-locator="dialogImportExportProgramConfig-check-export-styling"
                  label-i18n-key="dialogs.importExportProgramConfig.checkboxes.programStyling"
                />
              </q-list>
              <div class="row justify-center q-mt-lg q-mb-lg">
                <q-btn
                  color="primary-bright"
                  :disable="createExportDisabled"
                  :label="$t('dialogs.importExportProgramConfig.createExportFile')"
                  data-test-locator="dialogImportExportProgramConfig-button-createExport"
                  outline
                  @click="onClickCreateExport"
                />
              </div>
            </div>
          </q-step>
        </q-stepper>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import { registerComponentDialogStackGuard } from 'app/src/scripts/appGlobalManagementUI/dialogManagement'
import { S_DialogComponent } from 'app/src/stores/S_Dialog'
import { onMounted, ref, watch } from 'vue'
import type { StoreGeneric } from 'pinia'

import { useDialogImportExportProgramConfigDialog } from './scripts/dialogImportExportProgramConfigDialog'
import {
  type T_importExportStepperPanel,
  importExportViewToStepperPanel
} from './scripts/dialogImportExportProgramConfigStepperMap'

import DialogImportExportProgramConfigQItemCheckboxRow from './DialogImportExportProgramConfigQItemCheckboxRow.vue'

const resolveDialogComponentStore = (): StoreGeneric | null => {
  try {
    return S_DialogComponent()
  } catch {
    return null
  }
}

const documentName: T_dialogName = 'ImportExportProgramConfig'

const {
  createExportDisabled,
  dialogModel,
  exportIncludeKeybinds,
  exportIncludeProgramSettings,
  exportIncludeProgramStyling,
  importApplyDisabled,
  importApplyKeybinds,
  importApplyProgramStyling,
  importApplyProgramSettings,
  keybindsImportEnabled,
  onClickCreateExport,
  onClickImport,
  onClickImportSelected,
  programSettingsImportEnabled,
  programStylingImportEnabled,
  view
} = useDialogImportExportProgramConfigDialog({
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
const props = defineProps<{
  directInput?: T_dialogName
}>()

registerComponentDialogStackGuard(dialogModel)
function openDialog (): void { dialogModel.value = true }
watch(
  () => resolveDialogComponentStore()?.dialogUUID,
  () => {
    const s = resolveDialogComponentStore()
    if (s?.dialogToOpen === 'ImportExportProgramConfig') {
      openDialog()
    }
  }
)

watch(
  () => props.directInput,
  () => {
    if (props.directInput === 'ImportExportProgramConfig') {
      openDialog()
    }
  }
)

onMounted(() => {
  if (props.directInput === 'ImportExportProgramConfig') {
    openDialog()
  }
})
</script>

<style lang="scss" scoped src="./styles/DialogImportExportProgramConfig.scoped.scss"></style>
