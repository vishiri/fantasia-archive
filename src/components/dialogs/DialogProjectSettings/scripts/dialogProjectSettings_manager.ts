import { computed, onMounted, ref, watch } from 'vue'
import { Result } from 'neverthrow'

import { faProjectSettingsFetchFreshForDialog } from 'app/src/stores/scripts/sFaProjectSettingsBridge'
import { registerComponentDialogStackGuard } from 'app/src/scripts/appGlobalManagementUI/appGlobalManagementUI_manager'
import { runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun_manager'
import { S_DialogComponent } from 'src/stores/S_Dialog'

import { createDialogProjectSettings } from './functions/createDialogProjectSettings'
import {
  FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB,
  isDialogProjectSettingsDirectInput,
  isDialogProjectSettingsSaveDisabled,
  isDialogProjectSettingsStoreTarget
} from './functions/dialogProjectSettingsDialogInput'

const dialogProjectSettingsApi = createDialogProjectSettings({
  FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB,
  S_DialogComponent,
  computed,
  faProjectSettingsFetchFreshForDialog,
  isDialogProjectSettingsDirectInput,
  isDialogProjectSettingsSaveDisabled,
  isDialogProjectSettingsStoreTarget,
  onMounted,
  ref,
  registerComponentDialogStackGuard,
  Result,
  runFaActionAwait,
  watch
})

export const resolveDialogComponentStore = dialogProjectSettingsApi.resolveDialogComponentStore

export const createDialogProjectSettingsDialogActions = dialogProjectSettingsApi.createDialogProjectSettingsDialogActions

export const registerDialogProjectSettingsWatchers = dialogProjectSettingsApi.registerDialogProjectSettingsWatchers

export const useDialogProjectSettings = dialogProjectSettingsApi.useDialogProjectSettings
