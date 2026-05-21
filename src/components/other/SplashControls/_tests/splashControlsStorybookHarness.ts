import { setContentBridgeScenario } from '../../../../../.storybook-workspace/.storybook/mocks/contentBridge'

import { S_FaRecentProjects } from 'src/stores/S_FaRecentProjects'

import type { I_faRecentProjectEntry } from 'app/types/I_faRecentProjectsDomain'

/**
 * MRU rows for Storybook splash resume previews (newest first).
 */
export const SPLASH_CONTROLS_STORYBOOK_RECENT_PROJECTS: I_faRecentProjectEntry[] = [
  {
    filePath: 'C:\\Users\\storybook\\Documents\\Fantasia\\Chronicles of Aethermoor.faproject',
    name: 'Chronicles of Aethermoor'
  },
  {
    filePath: 'C:\\Users\\storybook\\Documents\\Fantasia\\Harbor District Atlas.faproject',
    name: 'Harbor District Atlas'
  }
]

/**
 * Wires projectManagement.getRecentProjects so SplashControlsResumeDropdown refresh keeps MRU rows.
 */
export function configureSplashControlsStorybookRecentProjects (
  entries: readonly I_faRecentProjectEntry[]
): void {
  const rows = [...entries]

  setContentBridgeScenario('default')
  Object.assign(window.faContentBridgeAPIs.projectManagement, {
    getRecentProjects: async () => rows
  })

  S_FaRecentProjects().$patch({
    entries: rows
  })
}
