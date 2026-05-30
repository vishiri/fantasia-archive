import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaRecentProjects } from 'app/src/stores/S_FaRecentProjects'

import { createPropagateFaProjectSettingsToAppConsumers } from './functions/createPropagateFaProjectSettingsToAppConsumers'

const propagateFaProjectSettingsToAppConsumersApi =
  createPropagateFaProjectSettingsToAppConsumers({
    patchActiveProjectDisplayName: (projectName) => {
      S_FaActiveProject().patchActiveProjectDisplayName(projectName)
    },
    refreshRecentProjects: () => S_FaRecentProjects().refreshRecentProjects()
  })

export const propagateFaProjectSettingsToAppConsumers =
  propagateFaProjectSettingsToAppConsumersApi.propagateFaProjectSettingsToAppConsumers
