import { computed } from 'vue'

import { isFantasiaStorybookCanvas } from 'app/src/scripts/appInternals/appInternals_manager'

import { createUseApp } from './app/functions/createUseApp'
import { resolveMountUserCssInjector } from './app/functions/appMountUserCssInjector'

export const useApp = createUseApp({
  computed,
  getMode: () => process.env.MODE,
  isFantasiaStorybookCanvas,
  resolveMountUserCssInjector
})
