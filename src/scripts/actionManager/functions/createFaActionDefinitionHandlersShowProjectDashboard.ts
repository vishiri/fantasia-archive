export function createFaActionDefinitionHandlersShowProjectDashboard (deps: {
  S_FaActiveProject: () => { hasActiveProject: boolean }
  navigateToWorkspaceRouteForActiveProject: () => Promise<void>
}): {
    handleShowProjectDashboard: () => Promise<void>
  } {
  const handleShowProjectDashboard = async (): Promise<void> => {
    if (!deps.S_FaActiveProject().hasActiveProject) {
      return
    }
    await deps.navigateToWorkspaceRouteForActiveProject()
  }

  return {
    handleShowProjectDashboard
  }
}
