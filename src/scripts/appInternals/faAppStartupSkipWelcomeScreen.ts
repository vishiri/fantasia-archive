import { openWelcomeScreenAutoLoadProject } from 'app/src/scripts/projectManagement/faWelcomeScreenAutoLoadProject'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'

/**
 * Resolves skipWelcomeScreen from the Pinia snapshot when loaded, otherwise from persisted main-process settings.
 */
async function readSkipWelcomeScreenEnabled (): Promise<boolean> {
  const storeSnapshot = S_FaUserSettings().settings
  if (storeSnapshot !== null) {
    return storeSnapshot.skipWelcomeScreen === true
  }

  const userSettingsBridge = window.faContentBridgeAPIs?.faUserSettings
  if (userSettingsBridge?.getSettings === undefined) {
    return false
  }

  const persistedSettings = await userSettingsBridge.getSettings()
  return persistedSettings.skipWelcomeScreen === true
}

/**
 * When skipWelcomeScreen is enabled, opens the active session file or MRU head only and navigates to /home on success.
 */
export async function runSkipWelcomeScreenRedirect (): Promise<boolean> {
  if (!(await readSkipWelcomeScreenEnabled())) {
    return false
  }

  const projectManagementBridge = window.faContentBridgeAPIs?.projectManagement
  if (projectManagementBridge === undefined) {
    return false
  }

  return await openWelcomeScreenAutoLoadProject({
    invocation: 'automatic'
  })
}

/**
 * Cold-launch entry: same as runSkipWelcomeScreenRedirect (boot runs before the settings store may be hydrated).
 */
export async function tryRunSkipWelcomeScreenOnLaunch (): Promise<boolean> {
  return await runSkipWelcomeScreenRedirect()
}
