import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { isFantasiaStorybookCanvas } from 'app/src/scripts/appInternals/appInternals_manager'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'

import { createUseComponentTestingLayout } from './functions/createUseComponentTestingLayout'

export const useComponentTestingLayout = createUseComponentTestingLayout({
  getMode: () => process.env.MODE,
  hasFaKeybindsBridge: () => window.faContentBridgeAPIs?.faKeybinds !== undefined,
  hasFaUserSettingsBridge: () => {
    return window.faContentBridgeAPIs?.faUserSettings !== undefined
  },
  isFantasiaStorybookCanvas,
  onMounted,
  refreshKeybinds: () => S_FaKeybinds().refreshKeybinds(),
  refreshUserSettings: () => S_FaUserSettings().refreshSettings(),
  useRoute
})
