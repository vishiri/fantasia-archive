import { openWelcomeScreenAutoLoadProject } from 'app/src/scripts/projectManagement/faWelcomeScreenAutoLoadProject_manager'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'

import { createFaAppStartupSkipWelcomeScreen } from './functions/createFaAppStartupSkipWelcomeScreen'

const faAppStartupSkipWelcomeScreenApi = createFaAppStartupSkipWelcomeScreen({
  getFaUserSettingsStore: () => S_FaUserSettings(),
  getProjectManagementBridge: () => window.faContentBridgeAPIs?.projectManagement,
  getUserSettingsBridge: () => window.faContentBridgeAPIs?.faUserSettings,
  openWelcomeScreenAutoLoadProject
})

export const runSkipWelcomeScreenRedirect =
  faAppStartupSkipWelcomeScreenApi.runSkipWelcomeScreenRedirect

export const tryRunSkipWelcomeScreenOnLaunch =
  faAppStartupSkipWelcomeScreenApi.tryRunSkipWelcomeScreenOnLaunch
