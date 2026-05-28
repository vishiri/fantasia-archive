import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaRecentProjects } from 'app/src/stores/S_FaRecentProjects'
import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'

/**
 * Updates every renderer consumer that mirrors persisted project settings after a successful save.
 */
export function propagateFaProjectSettingsToAppConsumers (root: I_faProjectSettingsRoot): void {
  S_FaActiveProject().patchActiveProjectDisplayName(root.projectName)
  void S_FaRecentProjects().refreshRecentProjects()
}
