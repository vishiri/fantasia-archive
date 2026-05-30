import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import {
  hasWelcomeScreenAutoLoadBootBeenAttempted
} from 'app/src/scripts/projectManagement/functions/faWelcomeScreenAutoLoadSession'
import {
  resolveFaAppRouterCurrentPath,
  runSkipWelcomeScreenRedirect
} from 'app/src/scripts/appInternals/appInternals_manager'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'

import { createSplashPage } from './functions/createSplashPage'
import { bindSplashPageSkipWelcomeScreenLifecycle } from './functions/splashPageSkipWelcomeScreen'

const splashPageApi = createSplashPage({
  FA_USER_SETTINGS_DEFAULTS,
  S_FaUserSettings,
  bindSplashPageSkipWelcomeScreenLifecycle,
  computed,
  hasWelcomeScreenAutoLoadBootBeenAttempted,
  onMounted,
  resolveFaAppRouterCurrentPath,
  runSkipWelcomeScreenRedirect,
  storeToRefs,
  watch
})

export const useSplashPage = splashPageApi.useSplashPage
