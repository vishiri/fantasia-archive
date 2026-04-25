import type { Ref } from 'vue'

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Notify } from 'quasar'

import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import { i18n } from 'app/i18n/externalFileLoader'
import {
  applyFaI18nLocaleFromLanguageCode,
  isFaUserSettingsLanguageCode
} from 'app/src/scripts/appInternals/rendererAppInternals'

/**
 * Manages user settings state sourced from the Electron main process via the IPC bridge.
 * Loads once on app start and handles patch-based updates with success/failure feedback.
 */
export const S_FaUserSettings = defineStore('S_FaUserSettings', () => {
  const settings: Ref<I_faUserSettings | null> = ref(null)

  async function refreshSettings (): Promise<void> {
    settings.value = await window.faContentBridgeAPIs.faUserSettings.getSettings()
    const s = settings.value
    if (s !== null && s.languageCode !== undefined && isFaUserSettingsLanguageCode(s.languageCode)) {
      applyFaI18nLocaleFromLanguageCode(s.languageCode)
    }
  }

  async function updateSettings (updateObject: Partial<I_faUserSettings>): Promise<void> {
    try {
      await window.faContentBridgeAPIs.faUserSettings.setSettings(updateObject)
    } catch (error) {
      // Error toast handled by the action manager's unified failure reporter; only the bridge log stays here.
      console.error('[S_FaUserSettings] setSettings failed', error)
      throw error instanceof Error ? error : new Error(String(error))
    }

    const retrievedSettings = await window.faContentBridgeAPIs.faUserSettings.getSettings()
    settings.value = retrievedSettings

    const updateKeys = Object.keys(updateObject) as Array<keyof I_faUserSettings>
    const saveSucceeded = updateKeys.every((key) => retrievedSettings[key] === updateObject[key])

    if (saveSucceeded) {
      if (updateObject.languageCode !== undefined) {
        applyFaI18nLocaleFromLanguageCode(updateObject.languageCode)
      }
      Notify.create({
        group: false,
        type: 'positive',
        message: i18n.global.t('globalFunctionality.faUserSettings.saveSuccess')
      })
      return
    }

    console.error(`[S_FaUserSettings] ${i18n.global.t('globalFunctionality.faUserSettings.saveMismatchLog')}`, {
      updateObject,
      retrievedSettings
    })
    throw new Error(i18n.global.t('globalFunctionality.faUserSettings.saveError'))
  }

  return {
    settings,
    refreshSettings,
    updateSettings
  }
})
