<template>
  <div class="q-gutter-y-sm">
    <h6 class="text-primary-bright text-center q-mt-lg q-mb-md">
      {{ $t('dialogs.importExportAppConfig.importSelectHint') }}
    </h6>

    <q-list class="q-pl-xl q-pr-xl">
      <DialogImportExportAppConfigQItemCheckboxRow
        v-model="importApplyAppSettings"
        checkbox-color="dark"
        data-test-locator="dialogImportExportAppConfig-check-import-settings"
        :disabled="!appSettingsImportEnabled"
        label-i18n-key="dialogs.importExportAppConfig.checkboxes.appSettings"
      />
      <DialogImportExportAppConfigQItemCheckboxRow
        v-model="importApplyKeybinds"
        checkbox-color="dark"
        data-test-locator="dialogImportExportAppConfig-check-import-keybinds"
        :disabled="!keybindsImportEnabled"
        label-i18n-key="dialogs.importExportAppConfig.checkboxes.keybinds"
      />
      <DialogImportExportAppConfigQItemCheckboxRow
        v-model="importApplyAppStyling"
        checkbox-color="dark"
        data-test-locator="dialogImportExportAppConfig-check-import-styling"
        :disabled="!appStylingImportEnabled"
        label-i18n-key="dialogs.importExportAppConfig.checkboxes.appStyling"
      />
      <DialogImportExportAppConfigQItemCheckboxRow
        v-model="importApplyAppNoteboard"
        checkbox-color="dark"
        data-test-locator="dialogImportExportAppConfig-check-import-noteboard"
        :disabled="!appNoteboardImportEnabled"
        label-i18n-key="dialogs.importExportAppConfig.checkboxes.appNoteboard"
      />
    </q-list>
    <div class="row justify-center q-mt-lg q-mb-lg">
      <q-btn
        color="primary-bright"
        :disable="importApplyDisabled"
        :label="$t('dialogs.importExportAppConfig.importSelected')"
        data-test-locator="dialogImportExportAppConfig-button-importSelected"
        outline
        @click="emit('clickImportSelected')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import DialogImportExportAppConfigQItemCheckboxRow from './DialogImportExportAppConfigQItemCheckboxRow.vue'

defineProps<{
  importApplyDisabled: boolean
  keybindsImportEnabled: boolean
  appNoteboardImportEnabled: boolean
  appSettingsImportEnabled: boolean
  appStylingImportEnabled: boolean
}>()

const importApplyAppSettings = defineModel<boolean>('importApplyAppSettings', { required: true })
const importApplyKeybinds = defineModel<boolean>('importApplyKeybinds', { required: true })
const importApplyAppStyling = defineModel<boolean>('importApplyAppStyling', { required: true })
const importApplyAppNoteboard = defineModel<boolean>('importApplyAppNoteboard', { required: true })

const emit = defineEmits<{
  clickImportSelected: []
}>()
</script>
