import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  watch
} from 'vue'
import { useRoute } from 'vue-router'
import {
  FA_APP_SHELL_DRAWER_TRANSITION_MS,
  FA_APP_SHELL_PAGE_TRANSITION_BINDINGS
} from 'app/src/scripts/appRouting/appRouting_manager'
import {
  createFaKeybindKeydownHandler,
  getFaKeybindKeydownContext
} from 'app/src/scripts/keybinds/keybinds_manager'
import { isFantasiaStorybookCanvas } from 'app/src/scripts/appInternals/appInternals_manager'
import { hydrateFromBridgeOrReport } from 'app/src/scripts/stores/stores_manager'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'
import { S_FaAppNoteboard } from 'app/src/stores/S_FaAppNoteboard'
import { S_FaProjectNoteboard } from 'app/src/stores/S_FaProjectNoteboard'
import { S_FaProjectStyling } from 'app/src/stores/S_FaProjectStyling'
import { S_FaAppStyling } from 'app/src/stores/S_FaAppStyling'
import { S_FaRecentProjects } from 'app/src/stores/S_FaRecentProjects'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import { awaitWelcomeScreenAutoLoadBootCompletion } from 'app/src/scripts/projectManagement/projectManagement_manager'

import { createMainLayout } from './functions/createMainLayout'
import { createMainLayoutDrawerRail } from './functions/createMainLayoutDrawerRail'
import { resolveMainLayoutOutletKey } from './functions/mainLayoutOutletKey'
import {
  resolveMainLayoutRouteClass,
  resolveMainLayoutShowWorkspaceDrawer
} from './functions/mainLayoutWorkspaceShell'

const mainLayoutApi = createMainLayout({
  awaitWelcomeScreenAutoLoadBootCompletion,
  FA_APP_SHELL_DRAWER_TRANSITION_MS,
  FA_APP_SHELL_PAGE_TRANSITION_BINDINGS,
  S_FaAppNoteboard,
  S_FaAppStyling,
  S_FaKeybinds,
  S_FaProjectNoteboard,
  S_FaProjectStyling,
  S_FaRecentProjects,
  S_FaUserSettings,
  computed,
  createMainLayoutDrawerRail,
  createFaKeybindKeydownHandler,
  getFaKeybindKeydownContext,
  hydrateFromBridgeOrReport,
  isFantasiaStorybookCanvas,
  onMounted,
  onUnmounted,
  ref,
  resolveMainLayoutOutletKey,
  resolveMainLayoutRouteClass,
  resolveMainLayoutShowWorkspaceDrawer,
  useRoute,
  watch: watch as (
    source: { value: boolean },
    effect: (show: boolean) => void,
    options?: { immediate?: boolean }
  ) => void
})

export const useAppShellLayoutDrawerRail = mainLayoutApi.useAppShellLayoutDrawerRail

export const useMainLayout = mainLayoutApi.useMainLayout
