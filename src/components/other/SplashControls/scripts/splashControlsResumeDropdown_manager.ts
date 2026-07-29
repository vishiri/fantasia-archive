import { i18n } from 'app/i18n/externalFileLoader'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun_manager'
import { openWelcomeScreenAutoLoadProject } from 'app/src/scripts/projectManagement/projectManagement_manager'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaRecentProjects } from 'app/src/stores/S_FaRecentProjects'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch
} from 'vue'
import { storeToRefs } from 'pinia'

import { createSplashControlsResumeDropdown } from './functions/createSplashControlsResumeDropdown'
import {
  createSplashResumePrimaryBusyHold,
  resolveSplashResumePrimaryLabelKey,
  SPLASH_RESUME_PRIMARY_BUSY_HOLD_MS
} from './functions/createSplashResumePrimaryBusyHold'
import {
  resolveSplashResumeDropdownArrowElement as resolveSplashResumeDropdownArrowElementFn
} from './functions/resolveSplashResumeDropdownArrowElement'
import {
  resolveSplashResumeDropdownPrimaryElement as resolveSplashResumeDropdownPrimaryElementFn
} from './functions/resolveSplashResumeDropdownPrimaryElement'
import {
  splashRecentProjectRowTestLocator as splashRecentProjectRowTestLocatorFn
} from './functions/splashRecentProjectRowTestLocator'

const splashControlsResumeDropdownApi = createSplashControlsResumeDropdown({
  FA_USER_SETTINGS_DEFAULTS,
  S_FaActiveProject,
  S_FaRecentProjects,
  S_FaUserSettings,
  clearTimeout: (id: number) => {
    globalThis.clearTimeout(id)
  },
  computed,
  createSplashResumePrimaryBusyHold,
  i18n,
  nextTick,
  onMounted,
  onUnmounted,
  openWelcomeScreenAutoLoadProject,
  ref,
  resolveSplashResumeDropdownArrowElement: resolveSplashResumeDropdownArrowElementFn,
  resolveSplashResumeDropdownPrimaryElement: resolveSplashResumeDropdownPrimaryElementFn,
  resolveSplashResumePrimaryLabelKey,
  resumePrimaryBusyHoldMs: SPLASH_RESUME_PRIMARY_BUSY_HOLD_MS,
  runFaAction,
  setTimeout: (handler: () => void, timeout: number) => {
    return globalThis.setTimeout(handler, timeout) as unknown as number
  },
  splashRecentProjectRowTestLocator: splashRecentProjectRowTestLocatorFn,
  storeToRefs,
  watch
})

export const useSplashControlsResumeDropdown =
  splashControlsResumeDropdownApi.useSplashControlsResumeDropdown

export const resolveSplashResumeDropdownArrowElement = resolveSplashResumeDropdownArrowElementFn

export const splashRecentProjectRowTestLocator = splashRecentProjectRowTestLocatorFn

export { SPLASH_RESUME_PRIMARY_BUSY_HOLD_MS }
