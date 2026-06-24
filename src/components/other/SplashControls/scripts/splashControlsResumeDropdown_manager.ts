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
  ref,
  watch
} from 'vue'
import { storeToRefs } from 'pinia'

import { createSplashControlsResumeDropdown } from './functions/createSplashControlsResumeDropdown'
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
  computed,
  i18n,
  nextTick,
  onMounted,
  openWelcomeScreenAutoLoadProject,
  ref,
  resolveSplashResumeDropdownArrowElement: resolveSplashResumeDropdownArrowElementFn,
  resolveSplashResumeDropdownPrimaryElement: resolveSplashResumeDropdownPrimaryElementFn,
  runFaAction,
  splashRecentProjectRowTestLocator: splashRecentProjectRowTestLocatorFn,
  storeToRefs,
  watch
})

export const useSplashControlsResumeDropdown =
  splashControlsResumeDropdownApi.useSplashControlsResumeDropdown

export const resolveSplashResumeDropdownArrowElement = resolveSplashResumeDropdownArrowElementFn

export const splashRecentProjectRowTestLocator = splashRecentProjectRowTestLocatorFn
