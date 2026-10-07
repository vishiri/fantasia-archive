import type { I_faActiveProject } from 'app/types/I_faActiveProjectDomain'
import type { T_faActiveProjectOpenFlowOutcome } from 'app/types/I_faActiveProjectOpenFlow'

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
  const {
    filePath,
    id,
    name
  } = project
  return {
    filePath,
    id,
    name
  }
}

type T_faActiveProjectReplacementOutcome = T_faActiveProjectOpenFlowOutcome | 'created'

/**
 * Create replacement can only finish as created, canceled, or superseded.
 * Open outcomes collapse to canceled so the create caller stays on its return type.
 */
export function coerceFaActiveProjectCreateUserOutcome (
  outcome: T_faActiveProjectReplacementOutcome
): 'created' | 'canceled' | 'superseded' {
  if (outcome === 'opened' || outcome === 'reused') {
    return 'canceled'
  }
  return outcome
}

/**
 * Open replacement can only finish as an open-flow outcome.
 * A created outcome collapses to canceled.
 */
export function coerceFaActiveProjectOpenUserOutcome (
  outcome: T_faActiveProjectReplacementOutcome
): T_faActiveProjectOpenFlowOutcome {
  if (outcome === 'created') {
    return 'canceled'
  }
  return outcome
}
