<template>
  <q-dialog
    v-model="dialogModel"
    :class="['dialogComponent', documentName, 'importExportProgramConfig']"
    :aria-label="$t('dialogs.importExportProgramConfig.ariaLabel')"
  >
    <q-card
      :class="['dialogComponent__wrapper', 'importExportProgramConfig', documentName]"
    >
      <q-card-section
        :class="['dialogComponent__content', 'importExportProgramConfig', documentName, 'q-mt-md', 'q-mb-sm', 'q-px-lg', 'q-pt-sm', 'hasScrollbar']"
      >
        <h6
          id="dialogImportExportProgramConfig-title"
          class="q-mb-md text-center"
        >
          {{ $t('dialogs.importExportProgramConfig.title') }}
        </h6>

        <div
          v-if="view === 'root'"
          class="row q-col-gutter-sm q-mb-sm justify-center"
        >
          <q-btn
            class="col-12 col-sm-auto"
            color="primary-bright"
            :label="$t('dialogs.importExportProgramConfig.importButton')"
            outline
            data-test-locator="dialogImportExportProgramConfig-button-import"
            @click="onRootImport"
          />
          <q-btn
            class="col-12 col-sm-auto"
            color="primary-bright"
            :label="$t('dialogs.importExportProgramConfig.exportButton')"
            outline
            data-test-locator="dialogImportExportProgramConfig-button-export"
            @click="view = 'export'"
          />
        </div>

        <div
          v-else-if="view === 'export'"
          class="q-gutter-y-sm"
        >
          <div class="text-body2 text-center q-mb-sm">
            {{ $t('dialogs.importExportProgramConfig.exportHint') }}
          </div>
          <q-checkbox
            v-model="exportIncludeProgramSettings"
            color="accent"
            data-test-locator="dialogImportExportProgramConfig-check-export-settings"
            :label="$t('dialogs.importExportProgramConfig.checkboxes.programSettings')"
          />
          <q-checkbox
            v-model="exportIncludeKeybinds"
            color="accent"
            data-test-locator="dialogImportExportProgramConfig-check-export-keybinds"
            :label="$t('dialogs.importExportProgramConfig.checkboxes.keybinds')"
          />
          <q-checkbox
            v-model="exportIncludeProgramStyling"
            color="accent"
            data-test-locator="dialogImportExportProgramConfig-check-export-styling"
            :label="$t('dialogs.importExportProgramConfig.checkboxes.programStyling')"
          />
          <div class="row justify-center q-mt-md">
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

        <div
          v-else
          class="q-gutter-y-sm"
        >
          <div class="text-body2 text-center q-mb-sm">
            {{ $t('dialogs.importExportProgramConfig.importSelectHint') }}
          </div>
          <q-checkbox
            v-model="importApplyProgramSettings"
            color="accent"
            data-test-locator="dialogImportExportProgramConfig-check-import-settings"
            :disable="!programSettingsImportEnabled"
            :label="$t('dialogs.importExportProgramConfig.checkboxes.programSettings')"
          />
          <q-checkbox
            v-model="importApplyKeybinds"
            color="accent"
            data-test-locator="dialogImportExportProgramConfig-check-import-keybinds"
            :disable="!keybindsImportEnabled"
            :label="$t('dialogs.importExportProgramConfig.checkboxes.keybinds')"
          />
          <q-checkbox
            v-model="importApplyProgramStyling"
            color="accent"
            data-test-locator="dialogImportExportProgramConfig-check-import-styling"
            :disable="!programStylingImportEnabled"
            :label="$t('dialogs.importExportProgramConfig.checkboxes.programStyling')"
          />
          <div class="row justify-center q-mt-md">
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
      </q-card-section>

      <q-card-actions
        align="around"
        class="q-mb-md"
      >
        <q-btn
          v-close-popup
          flat
          :label="$t('dialogs.markdownDocument.closeButton')"
          color="accent"
          data-test-locator="dialogImportExportProgramConfig-button-close"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import { registerComponentDialogStackGuard } from 'app/src/scripts/appGlobalManagementUI/dialogManagement'
import { S_DialogComponent } from 'app/src/stores/S_Dialog'
import { onMounted, watch } from 'vue'
import type { StoreGeneric } from 'pinia'

import { useDialogImportExportProgramConfigDialog } from './scripts/dialogImportExportProgramConfigDialog'

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

const props = defineProps<{
  directInput?: T_dialogName
}>()

registerComponentDialogStackGuard(dialogModel)

function openDialog (): void {
  dialogModel.value = true
}

function onRootImport (): void {
  void onClickImport()
}

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

<style lang="scss" scoped>
.importExportProgramConfig .dialogComponent__wrapper {
  max-width: 28rem;
  width: 90vw;
}
</style>
