import type { Ref } from 'vue'

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Notify } from 'quasar'

import type { I_faUserSettings } from 'app/types/I_faUserSettings'
import { i18n } from 'app/i18n/externalFileLoader'

/**
 * Manages user settings state sourced from the Electron main process via the IPC bridge.
 * Loads once on app start and handles patch-based updates with success/failure feedback.
 */
export const S_FaUserSettings = defineStore('S_FaUserSettings', () => {
  const settings: Ref<I_faUserSettings | null> = ref(null)

  async function refreshSettings (): Promise<void> {
    settings.value = await window.faContentBridgeAPIs.faUserSettings.getSettings()
  }

  async function updateSettings (updateObject: Partial<I_faUserSettings>): Promise<void> {
    await window.faContentBridgeAPIs.faUserSettings.setSettings(updateObject)

    const retrievedSettings = await window.faContentBridgeAPIs.faUserSettings.getSettings()
    settings.value = retrievedSettings

    const updateKeys = Object.keys(updateObject) as Array<keyof I_faUserSettings>
    const saveSucceeded = updateKeys.every((key) => retrievedSettings[key] === updateObject[key])

    if (saveSucceeded) {
      Notify.create({
        group: false,
        type: 'positive',
        message: i18n.global.t('globalFunctionality.faUserSettings.saveSuccess')
      })
    } else {
      console.error(`[S_FaUserSettings] ${i18n.global.t('globalFunctionality.faUserSettings.saveMismatchLog')}`, {
        updateObject,
        retrievedSettings
      })
      Notify.create({
        group: false,
        type: 'negative',
        timeout: 0,
        message: i18n.global.t('globalFunctionality.faUserSettings.saveError')
      })
    }
  }

  return {
    settings,
    refreshSettings,
    updateSettings
  }
})
