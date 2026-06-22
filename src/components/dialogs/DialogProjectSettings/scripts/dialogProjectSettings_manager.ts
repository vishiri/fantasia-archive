import { computed, onMounted, ref, watch } from 'vue'

import { i18n } from 'app/i18n/externalFileLoader'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
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
import { hasDialogProjectSettingsDocumentTemplateNameValidationError } from './dialogProjectSettingsDocumentTemplatesDraft'
import { isDialogProjectSettingsFullDialogSaveDisabled } from './dialogProjectSettingsDialogSaveValidation'
import {
  hasDialogProjectSettingsWorldColorPalleteValidationError,
  hasDialogProjectSettingsWorldNameValidationError,
  hasDialogProjectSettingsWorldTemplateLayoutValidationError,
  isDialogProjectSettingsProjectNameInvalid
} from './functions/dialogProjectSettingsWorldsSaveValidation'

const buildDialogProjectSettingsSaveValidationTooltipForDraft =
  createBuildDialogProjectSettingsSaveValidationTooltip({
    resolveDefaultNewTemplateName: () => {
      return i18n.global.t('dialogs.projectSettings.panels.documentTemplates.defaultNewTemplateName')
    },
    resolveDefaultNewWorldName: () => {
      return i18n.global.t('dialogs.projectSettings.panels.worlds.defaultNewWorldName')
    },
    getCurrentLanguageCode: () => {
      return S_FaUserSettings().settings?.languageCode ?? 'en-US'
    },
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
      getCurrentLanguageCode: () => {
        return S_FaUserSettings().settings?.languageCode ?? 'en-US'
      },
      resolveNewTemplateDefaultDisplayName: () => {
        return i18n.global.t('dialogs.projectSettings.panels.documentTemplates.defaultNewTemplateName')
      },
      resolveNewWorldDefaultDisplayName: () => {
        return i18n.global.t('dialogs.projectSettings.panels.worlds.defaultNewWorldName')
      },
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
  hasDialogProjectSettingsWorldTemplateLayoutValidationError,
  isDialogProjectSettingsFullDialogSaveDisabled,
  isDialogProjectSettingsProjectNameInvalid,
  registerComponentDialogStackGuard,
  watch,
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
