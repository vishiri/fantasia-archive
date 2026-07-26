import type { Ref } from 'vue'

import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { readonly, ref } from 'vue'
import { ResultAsync } from 'neverthrow'

import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import { i18n } from 'app/i18n/externalFileLoader'
import { applyFaAppThemeToDocument } from 'app/src/scripts/appInternals/faAppThemeApplyWiring'
import { applyFaI18nLocaleFromLanguageCode } from 'app/src/scripts/appInternals/faAppInternalsLocale_manager'
import {
  FA_USER_SETTINGS_APP_THEME_DEFAULT,
  isFaUserSettingsAppTheme
} from 'app/types/faUserSettingsAppThemeRegistry'
import { isFaUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { didObjectPatchPersist } from './functions/faPersistPatchVerify'

/**
 * Manages user settings state sourced from the Electron main process via the IPC bridge.
 * Loads once on app start and handles patch-based updates with success/failure feedback.
 */
export const S_FaUserSettings = defineStore('S_FaUserSettings', () => {
  const settings: Ref<I_faUserSettings | null> = ref(null)
  const appSettingsDialogPreview: Ref<Partial<I_faUserSettings> | null> = ref(null)

  function resolveEffectiveAppTheme (): string {
    const previewTheme = appSettingsDialogPreview.value?.appTheme
    if (typeof previewTheme === 'string' && isFaUserSettingsAppTheme(previewTheme)) {
      return previewTheme
    }

    const persistedTheme = settings.value?.appTheme
    if (typeof persistedTheme === 'string' && isFaUserSettingsAppTheme(persistedTheme)) {
      return persistedTheme
    }

    return FA_USER_SETTINGS_APP_THEME_DEFAULT
  }

  function applyEffectiveAppTheme (): void {
    applyFaAppThemeToDocument(resolveEffectiveAppTheme())
  }

  function setAppSettingsDialogPreview (preview: Partial<I_faUserSettings>): void {
    appSettingsDialogPreview.value = {
      ...(appSettingsDialogPreview.value ?? {}),
      ...preview
    }
    applyEffectiveAppTheme()
  }

  function clearAppSettingsDialogPreview (): void {
    appSettingsDialogPreview.value = null
    applyEffectiveAppTheme()
  }

  async function refreshSettings (): Promise<void> {
    settings.value = await window.faContentBridgeAPIs.faUserSettings.getSettings()
    const s = settings.value
    if (s !== null && s.languageCode !== undefined && isFaUserSettingsLanguageCode(s.languageCode)) {
      applyFaI18nLocaleFromLanguageCode(s.languageCode)
    }
    applyEffectiveAppTheme()
  }

  async function persistSettingsPatch (
    updateObject: Partial<I_faUserSettings>
  ): Promise<I_faUserSettings> {
    const setResult = await ResultAsync.fromPromise(
      window.faContentBridgeAPIs.faUserSettings.setSettings(updateObject),
      (error): unknown => error
    )
    if (setResult.isErr()) {
      const error = setResult.error
      console.error('[S_FaUserSettings] setSettings failed', error)
      throw error instanceof Error ? error : new Error(String(error))
    }

    const retrievedSettings = await window.faContentBridgeAPIs.faUserSettings.getSettings()
    settings.value = retrievedSettings

    const saveSucceeded = didObjectPatchPersist(updateObject, retrievedSettings)
    if (!saveSucceeded) {
      console.error(`[S_FaUserSettings] ${i18n.global.t('globalFunctionality.faUserSettings.saveMismatchLog')}`, {
        updateObject,
        retrievedSettings
      })
      throw new Error(i18n.global.t('globalFunctionality.faUserSettings.saveError'))
    }

    if (updateObject.languageCode !== undefined) {
      applyFaI18nLocaleFromLanguageCode(updateObject.languageCode)
    }

    applyEffectiveAppTheme()

    return retrievedSettings
  }

  async function updateSettings (updateObject: Partial<I_faUserSettings>): Promise<void> {
    await persistSettingsPatch(updateObject)
    Notify.create({
      group: false,
      type: 'positive',
      message: i18n.global.t('globalFunctionality.faUserSettings.saveSuccess')
    })
  }

  async function patchSettingsSilently (updateObject: Partial<I_faUserSettings>): Promise<void> {
    await persistSettingsPatch(updateObject)
  }

  return {
    appSettingsDialogPreview: readonly(appSettingsDialogPreview),
    clearAppSettingsDialogPreview,
    patchSettingsSilently,
    settings,
    refreshSettings,
    setAppSettingsDialogPreview,
    updateSettings
  }
})
