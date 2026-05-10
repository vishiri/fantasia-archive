<template>
  <div class="q-gutter-y-sm">
    <h6
      class="text-primary-bright text-center q-mt-lg q-mb-md"
      data-test-locator="dialogImportExportAppConfig-export-hint"
    >
      {{ $t('dialogs.importExportAppConfig.exportHint') }}
    </h6>

    <q-list class="q-pl-xl q-pr-xl">
      <DialogImportExportAppConfigQItemCheckboxRow
        v-model="exportIncludeAppSettings"
        checkbox-color="dark"
        data-test-locator="dialogImportExportAppConfig-check-export-settings"
        label-i18n-key="dialogs.importExportAppConfig.checkboxes.appSettings"
      />
      <DialogImportExportAppConfigQItemCheckboxRow
        v-model="exportIncludeKeybinds"
        checkbox-color="dark"
        data-test-locator="dialogImportExportAppConfig-check-export-keybinds"
        label-i18n-key="dialogs.importExportAppConfig.checkboxes.keybinds"
      />
      <DialogImportExportAppConfigQItemCheckboxRow
        v-model="exportIncludeAppStyling"
        checkbox-color="dark"
        data-test-locator="dialogImportExportAppConfig-check-export-styling"
        label-i18n-key="dialogs.importExportAppConfig.checkboxes.appStyling"
      />
      <DialogImportExportAppConfigQItemCheckboxRow
        v-model="exportIncludeAppNoteboard"
        checkbox-color="dark"
        data-test-locator="dialogImportExportAppConfig-check-export-noteboard"
        label-i18n-key="dialogs.importExportAppConfig.checkboxes.appNoteboard"
      />
    </q-list>
    <div class="row justify-center q-mt-lg q-mb-lg">
      <q-btn
        color="primary-bright"
        :disable="createExportDisabled"
        :label="$t('dialogs.importExportAppConfig.createExportFile')"
        data-test-locator="dialogImportExportAppConfig-button-createExport"
        outline
        @click="emit('clickCreateExport')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import DialogImportExportAppConfigQItemCheckboxRow from './DialogImportExportAppConfigQItemCheckboxRow.vue'

defineProps<{
  createExportDisabled: boolean
}>()

const exportIncludeAppSettings = defineModel<boolean>('exportIncludeAppSettings', { required: true })
const exportIncludeKeybinds = defineModel<boolean>('exportIncludeKeybinds', { required: true })
const exportIncludeAppStyling = defineModel<boolean>('exportIncludeAppStyling', { required: true })
const exportIncludeAppNoteboard = defineModel<boolean>('exportIncludeAppNoteboard', { required: true })

const emit = defineEmits<{
  clickCreateExport: []
}>()
</script>
