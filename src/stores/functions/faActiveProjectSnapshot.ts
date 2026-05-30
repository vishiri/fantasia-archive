import type { I_faActiveProject } from 'app/types/I_faActiveProjectDomain'

/**
 * Returns a copy of the active project with an updated display name, or null when no project is loaded.
 */
export function patchFaActiveProjectDisplayName (
  current: I_faActiveProject | null,
  name: string
): I_faActiveProject | null {
  if (current === null) {
    return null
  }
  return {
    ...current,
    name
  }
}

/**
 * Maps a project-management bridge creation payload into the session snapshot shape.
 */
export function buildFaActiveProjectFromBridgeProject (project: {
  filePath: string
  id: string
  name: string
}): I_faActiveProject {
  return {
    filePath: project.filePath,
    id: project.id,
    name: project.name
  }
}
