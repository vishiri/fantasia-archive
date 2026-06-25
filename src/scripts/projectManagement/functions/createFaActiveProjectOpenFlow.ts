import type { I_faActiveProject } from 'app/types/I_faActiveProjectDomain'
import type {
  T_faActiveProjectOpenFlowHandlers,
  T_faActiveProjectOpenFlowOutcome
} from 'app/types/I_faActiveProjectOpenFlow'
import type { I_faProjectOpenResult } from 'app/types/I_faProjectManagementDomain'

export function createFaActiveProjectOpenFlow (deps: {
  FaProjectOpenFailedError: new (
    message: string,
    attemptedFilePath?: string,
    notifyType?: 'negative' | 'warning'
  ) => Error
  faActiveProjectFilePathsMatch: (activePath: string, filePath: string) => boolean
  translateOpenErrorFallback: () => string
}): {
    finalizeFaActiveProjectOpenResult: (
      result: I_faProjectOpenResult,
      handlers: T_faActiveProjectOpenFlowHandlers
    ) => Promise<T_faActiveProjectOpenFlowOutcome>
    tryReuseFaActiveProjectKnownPath: (
      activeProject: I_faActiveProject | null,
      filePath: string,
      reuseActiveProjectSession: (next: I_faActiveProject) => void
    ) => T_faActiveProjectOpenFlowOutcome | null
  } {
  async function finalizeFaActiveProjectOpenResult (
    result: I_faProjectOpenResult,
    handlers: T_faActiveProjectOpenFlowHandlers
  ): Promise<T_faActiveProjectOpenFlowOutcome> {
    if (result.outcome === 'canceled') {
      return 'canceled'
    }
    if (result.outcome === 'error') {
      const localized = result.errorMessage ?? deps.translateOpenErrorFallback()
      throw new deps.FaProjectOpenFailedError(
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

  function tryReuseFaActiveProjectKnownPath (
    activeProject: I_faActiveProject | null,
    filePath: string,
    reuseActiveProjectSession: (next: I_faActiveProject) => void
  ): T_faActiveProjectOpenFlowOutcome | null {
    if (activeProject === null) {
      return null
    }
    if (!deps.faActiveProjectFilePathsMatch(activeProject.filePath, filePath)) {
      return null
    }
    reuseActiveProjectSession(activeProject)
    return 'reused'
  }

  return {
    finalizeFaActiveProjectOpenResult,
    tryReuseFaActiveProjectKnownPath
  }
}
