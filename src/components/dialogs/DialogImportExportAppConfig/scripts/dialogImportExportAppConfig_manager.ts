import { computed, onMounted, ref, watch } from 'vue'
import { Notify } from 'quasar'
import { Result } from 'neverthrow'

import { i18n } from 'app/i18n/externalFileLoader'
import { registerComponentDialogStackGuard } from 'app/src/scripts/appGlobalManagementUI/appGlobalManagementUI_manager'
import {
  runFaAction,
  runFaActionAwait
} from 'app/src/scripts/actionManager/faActionManagerRun_manager'
import * as dialogStoreModule from 'src/stores/S_Dialog'

import { createDialogImportExportAppConfig } from './functions/createDialogImportExportAppConfig'
import {
  isImportExportApplyDisabled,
  isImportExportCreateExportDisabled,
  isImportExportPartAvailable
} from './functions/dialogImportExportAppConfigDisabledRules'

const dialogImportExportAppConfigApi = createDialogImportExportAppConfig({
  S_DialogComponent: () => dialogStoreModule.S_DialogComponent(),
  Notify,
  computed,
  i18n,
  isImportExportApplyDisabled,
  isImportExportCreateExportDisabled,
  isImportExportPartAvailable,
  onMounted,
  ref,
  registerComponentDialogStackGuard,
  Result,
  runFaAction,
  runFaActionAwait,
  watch
})

export const registerImportExportApplyCheckboxSync = dialogImportExportAppConfigApi.registerImportExportApplyCheckboxSync

export const buildImportExportAppConfigDialogModelComputeds = dialogImportExportAppConfigApi.buildImportExportAppConfigDialogModelComputeds

export const useImportExportAppConfigDialogModel = dialogImportExportAppConfigApi.useImportExportAppConfigDialogModel

export const importExportDialogClickCreateExport = dialogImportExportAppConfigApi.importExportDialogClickCreateExport

export const importExportDialogClickPrepareImport = dialogImportExportAppConfigApi.importExportDialogClickPrepareImport

export const importExportDialogClickApplyImport = dialogImportExportAppConfigApi.importExportDialogClickApplyImport

export const useDialogImportExportAppConfigDialog = dialogImportExportAppConfigApi.useDialogImportExportAppConfigDialog

export const useDialogImportExportAppConfigLifecycle = dialogImportExportAppConfigApi.useDialogImportExportAppConfigLifecycle
