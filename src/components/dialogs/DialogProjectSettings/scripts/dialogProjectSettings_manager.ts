import { computed, onMounted, ref, watch } from 'vue'

import { i18n } from 'app/i18n/externalFileLoader'
import { faProjectDocumentTemplatesFetchFreshForDialog } from 'app/src/stores/scripts/sFaProjectDocumentTemplatesBridge'
import { faProjectSettingsFetchFreshForDialog } from 'app/src/stores/scripts/sFaProjectSettingsBridge'
import { faProjectWorldsFetchFreshForDialog } from 'app/src/stores/scripts/sFaProjectWorldsBridge'
import { registerComponentDialogStackGuard } from 'app/src/scripts/appGlobalManagementUI/appGlobalManagementUI_manager'
import { runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun_manager'
import { S_DialogComponent } from 'src/stores/S_Dialog'

import { createDialogProjectSettingsRefsWiring } from './createDialogProjectSettingsRefsWiring'
import { createDialogProjectSettingsUseHook } from './createDialogProjectSettingsUseWiring'
import { createDialogProjectSettingsWatchersWiring } from './createDialogProjectSettingsWatchersWiring'
import { createDialogProjectSettingsDialogActions as buildDialogProjectSettingsDialogActions } from './dialogProjectSettingsDialogActionsWiring'
import { createBuildDialogProjectSettingsSaveValidationTooltip } from './dialogProjectSettingsSaveValidationTooltipWiring'
import { createDialogProjectSettings } from './createDialogProjectSettings'
import {
  FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB,
  isDialogProjectSettingsDirectInput,
  isDialogProjectSettingsStoreTarget
} from './functions/dialogProjectSettingsDialogInput'
import { hasDialogProjectSettingsDocumentTemplateNameValidationError } from './functions/dialogProjectSettingsDocumentTemplatesDraft'
import { isDialogProjectSettingsFullDialogSaveDisabled } from './dialogProjectSettingsDialogSaveValidation'
import {
  hasDialogProjectSettingsWorldColorPalleteValidationError,
  hasDialogProjectSettingsWorldNameValidationError,
  isDialogProjectSettingsProjectNameInvalid
} from './functions/dialogProjectSettingsWorldsDraft'

const buildDialogProjectSettingsSaveValidationTooltipForDraft =
  createBuildDialogProjectSettingsSaveValidationTooltip({
    defaultNewTemplateName: i18n.global.t(
      'dialogs.projectSettings.panels.documentTemplates.defaultNewTemplateName'
    ),
    defaultNewWorldName: i18n.global.t('dialogs.projectSettings.panels.worlds.defaultNewWorldName'),
    translate: (key, params) => i18n.global.t(key, params ?? {})
  })

const dialogProjectSettingsApi = createDialogProjectSettings({
  S_DialogComponent,
  buildDialogProjectSettingsSaveValidationTooltipForDraft,
  computed,
  createDialogProjectSettingsDialogActions: (params) => {
    return buildDialogProjectSettingsDialogActions({
      FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB,
      faProjectDocumentTemplatesFetchFreshForDialog,
      faProjectSettingsFetchFreshForDialog,
      faProjectWorldsFetchFreshForDialog,
      newTemplateDefaultDisplayName: i18n.global.t(
        'dialogs.projectSettings.panels.documentTemplates.defaultNewTemplateName'
      ),
      newWorldDefaultDisplayName: i18n.global.t('dialogs.projectSettings.panels.worlds.defaultNewWorldName'),
      runFaActionAwait
    }, params)
  },
  createDialogProjectSettingsRefs: () => {
    return createDialogProjectSettingsRefsWiring({
      FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB,
      ref
    })
  },
  createDialogProjectSettingsUseHook,
  hasDialogProjectSettingsDocumentTemplateNameValidationError,
  hasDialogProjectSettingsWorldColorPalleteValidationError,
  hasDialogProjectSettingsWorldNameValidationError,
  isDialogProjectSettingsFullDialogSaveDisabled,
  isDialogProjectSettingsProjectNameInvalid,
  registerComponentDialogStackGuard,
  registerDialogProjectSettingsWatchers: createDialogProjectSettingsWatchersWiring({
    isDialogProjectSettingsDirectInput,
    isDialogProjectSettingsStoreTarget,
    onMounted,
    resolveDialogComponentStore: () => {
      try {
        return S_DialogComponent()
      } catch {
        return null
      }
    },
    watch
  })
})

export const resolveDialogComponentStore = dialogProjectSettingsApi.resolveDialogComponentStore

export const createDialogProjectSettingsDialogActions = dialogProjectSettingsApi.createDialogProjectSettingsDialogActions

export const registerDialogProjectSettingsWatchers = dialogProjectSettingsApi.registerDialogProjectSettingsWatchers

export const useDialogProjectSettings = dialogProjectSettingsApi.useDialogProjectSettings
