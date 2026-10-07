import { getActivePinia } from 'pinia'

export async function readProjectHierarchyTreeTagPersistEpoch (): Promise<number | undefined> {
  if (getActivePinia() === undefined) {
    return undefined
  }
  const activeProject = await import('app/src/stores/S_FaActiveProject')
  return activeProject.S_FaActiveProject().readProjectContentEpoch()
}

export function projectHierarchyTreeTagPersistEpochMoved (
  epochAtStart: number | undefined,
  epochNow: number | undefined
): boolean {
  if (epochAtStart === undefined || epochNow === undefined) {
    return false
  }
  return epochNow !== epochAtStart
}

export async function projectHierarchyTreeTagPersistSuperseded (
  epochAtStart: number | undefined
): Promise<boolean> {
  if (getActivePinia() === undefined) {
    return false
  }
  const activeProjectModule = await import('app/src/stores/S_FaActiveProject')
  const activeProject = activeProjectModule.S_FaActiveProject()
  if (activeProject.isProjectReplacementInFlight()) {
    return true
  }
  return projectHierarchyTreeTagPersistEpochMoved(
    epochAtStart,
    activeProject.readProjectContentEpoch()
  )
}
