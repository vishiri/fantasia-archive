import { computed, onMounted, ref, toRaw, watch } from 'vue'
import { Result } from 'neverthrow'

import { APP_SETTINGS_OPTIONS } from 'app/src/components/dialogs/DialogAppSettings/_data/appSettingsOptions'
import { i18n } from 'app/i18n/externalFileLoader'
import { registerComponentDialogStackGuard } from 'app/src/scripts/appGlobalManagementUI/appGlobalManagementUI_manager'
import { runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun_manager'
import { S_FaUserSettings } from 'src/stores/S_FaUserSettings'
import { S_DialogComponent } from 'src/stores/S_Dialog'

import { createDialogAppSettings } from './functions/createDialogAppSettings'
import { buildAppSettingsRenderTree } from './functions/dialogAppSettingsTreeBuild'
import { filterAppSettingsTreeForSearch } from './functions/dialogAppSettingsSearch'
import { updateLocalAppSettingsField } from './functions/dialogAppSettingsUpdateLocalField'

const dialogAppSettingsApi = createDialogAppSettings({
  APP_SETTINGS_OPTIONS,
  S_DialogComponent,
  S_FaUserSettings,
  buildAppSettingsRenderTree,
  computed,
  filterAppSettingsTreeForSearch,
  i18n,
  onMounted,
  ref,
  registerComponentDialogStackGuard,
  Result,
  runFaActionAwait,
  toRaw,
  updateLocalAppSettingsField,
  watch
})

export const resolveDialogComponentStore = dialogAppSettingsApi.resolveDialogComponentStore

export const syncLocalAppSettingsFromStore = dialogAppSettingsApi.syncLocalAppSettingsFromStore

export const registerDialogAppSettingsWatchers = dialogAppSettingsApi.registerDialogAppSettingsWatchers

export const useDialogAppSettingsSearchComputed = dialogAppSettingsApi.useDialogAppSettingsSearchComputed

export const createDialogAppSettingsDialogActions = dialogAppSettingsApi.createDialogAppSettingsDialogActions

export const useDialogAppSettings = dialogAppSettingsApi.useDialogAppSettings
