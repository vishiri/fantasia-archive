import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'

export function createPropagateFaProjectSettingsToAppConsumers (deps: {
  patchActiveProjectDisplayName: (projectName: string) => void
  refreshRecentProjects: () => Promise<void>
}): {
    propagateFaProjectSettingsToAppConsumers: (root: I_faProjectSettingsRoot) => void
  } {
  const propagateFaProjectSettingsToAppConsumers = (root: I_faProjectSettingsRoot): void => {
    deps.patchActiveProjectDisplayName(root.projectName)
    void deps.refreshRecentProjects()
  }

  return {
    propagateFaProjectSettingsToAppConsumers
  }
}
