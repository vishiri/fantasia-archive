import type { Decorator } from '@storybook/vue3-vite'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'

const STORYBOOK_WORKSPACE_HOME_ACTIVE_PROJECT = {
  filePath: 'C:\\Storybook\\Aurelion Citadel.faproject',
  id: 'storybook-aurelion-citadel',
  name: 'Aurelion Citadel'
}

function patchStorybookWorkspaceHomePreviewStores (hideTooltipsProject: boolean): void {
  S_FaActiveProject().$patch({
    activeProject: STORYBOOK_WORKSPACE_HOME_ACTIVE_PROJECT
  })
  S_FaUserSettings().$patch({
    settings: {
      ...FA_USER_SETTINGS_DEFAULTS,
      hidePlushes: false,
      hideTooltipsProject
    }
  })
}

/**
 * Seeds Pinia for /home previews: active project session and visible project-overview tips.
 */
export const withStorybookWorkspaceHomePreview: Decorator = (story) => {
  patchStorybookWorkspaceHomePreviewStores(false)
  return story()
}

/**
 * Same active project as workspace home, with Hide tips on project overview enabled.
 */
export const withStorybookWorkspaceHomePreviewTipsHidden: Decorator = (story) => {
  patchStorybookWorkspaceHomePreviewStores(true)
  return story()
}
