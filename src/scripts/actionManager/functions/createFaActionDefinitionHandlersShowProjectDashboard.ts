export function createFaActionDefinitionHandlersShowProjectDashboard (deps: {
  S_FaActiveProject: () => { hasActiveProject: boolean }
  navigateToWorkspaceHomeRoute: () => Promise<void>
}): {
    handleShowProjectDashboard: () => Promise<void>
  } {
  const handleShowProjectDashboard = async (): Promise<void> => {
    if (!deps.S_FaActiveProject().hasActiveProject) {
      return
    }
    await deps.navigateToWorkspaceHomeRoute()
  }

  return {
    handleShowProjectDashboard
  }
}
