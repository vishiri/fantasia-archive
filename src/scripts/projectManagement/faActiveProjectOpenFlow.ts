import type { I_faActiveProject } from 'app/types/I_faActiveProjectDomain'
import type { I_faProjectOpenResult } from 'app/types/I_faProjectManagementDomain'

import { FaProjectOpenFailedError } from 'app/src/scripts/actionManager/faProjectOpenFailedError'
import { faActiveProjectFilePathsMatch } from 'app/src/scripts/projectManagement/faActiveProjectFilePathsMatch'

export type T_faActiveProjectOpenFlowOutcome = 'opened' | 'canceled' | 'reused'

export type T_faActiveProjectOpenFlowHandlers = {
  commitActiveProjectSnapshot: (next: I_faActiveProject) => void
  reuseActiveProjectSession: (next: I_faActiveProject) => void
}

/**
 * Applies IPC open results to session state; reused opens navigate without a load toast.
 */
export async function finalizeFaActiveProjectOpenResult (
  result: I_faProjectOpenResult,
  handlers: T_faActiveProjectOpenFlowHandlers
): Promise<T_faActiveProjectOpenFlowOutcome> {
  if (result.outcome === 'canceled') {
    return 'canceled'
  }
  if (result.outcome === 'error') {
    const localized = result.errorMessage ?? 'Failed to open project.'
    throw new FaProjectOpenFailedError(
      localized,
      result.attemptedFilePath,
      'negative'
    )
  }
  const p = result.project
  if (p === undefined) {
    throw new Error('Project open returned no project snapshot.')
  }
  if (result.idempotentReuse === true) {
    handlers.reuseActiveProjectSession({
      filePath: p.filePath,
      id: p.id,
      name: p.name
    })
    return 'reused'
  }
  handlers.commitActiveProjectSnapshot({
    filePath: p.filePath,
    id: p.id,
    name: p.name
  })
  return 'opened'
}

/**
 * Skips IPC when the requested path is already the active session file.
 */
export function tryReuseFaActiveProjectKnownPath (
  activeProject: I_faActiveProject | null,
  filePath: string,
  reuseActiveProjectSession: (next: I_faActiveProject) => void
): T_faActiveProjectOpenFlowOutcome | null {
  if (activeProject === null) {
    return null
  }
  if (!faActiveProjectFilePathsMatch(activeProject.filePath, filePath)) {
    return null
  }
  reuseActiveProjectSession(activeProject)
  return 'reused'
}
