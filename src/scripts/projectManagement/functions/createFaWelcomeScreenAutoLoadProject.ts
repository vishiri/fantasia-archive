import type {
  T_faWelcomeScreenAutoLoadInvocation,
  T_faWelcomeScreenAutoLoadTarget
} from 'app/types/I_faWelcomeScreenAutoLoad'

export function createFaWelcomeScreenAutoLoadProject (deps: {
  getActiveProjectFilePath: () => string | undefined
  getProjectManagementBridge: () => {
    resolveRecentProjectMruHeadForOpen: () => Promise<{
      outcome: 'empty'
    } | {
      attemptedEntry: { filePath: string, name: string }
      outcome: 'missing'
    } | {
      entry: { filePath: string }
      outcome: 'ready'
    }>
  } | undefined
  hasWelcomeScreenAutoLoadMruHeadFailed: () => boolean
  markWelcomeScreenAutoLoadMruHeadFailed: () => void
  navigateToWorkspaceRouteForActiveProject: () => Promise<void>
  notifyWelcomeScreenRecentProjectFileMissing: (displayName: string) => void
  refreshRecentProjects: () => Promise<void>
  runFaActionAwait: (
    id: 'loadExistingProject',
    payload: { filePath: string, resumeActiveSession: boolean }
  ) => Promise<boolean>
}): {
    openWelcomeScreenAutoLoadProject: (options?: {
      invocation?: T_faWelcomeScreenAutoLoadInvocation
    }) => Promise<boolean>
    resolveWelcomeScreenAutoLoadTarget: () => Promise<T_faWelcomeScreenAutoLoadTarget>
  } {
  async function resolveWelcomeScreenAutoLoadTarget (): Promise<T_faWelcomeScreenAutoLoadTarget> {
    const activeSessionPath = deps.getActiveProjectFilePath()
    if (activeSessionPath !== undefined && activeSessionPath.length > 0) {
      return {
        filePath: activeSessionPath,
        kind: 'activeSession'
      }
    }

    const projectManagementBridge = deps.getProjectManagementBridge()
    if (projectManagementBridge?.resolveRecentProjectMruHeadForOpen === undefined) {
      return { kind: 'none' }
    }

    const headResolve = await projectManagementBridge.resolveRecentProjectMruHeadForOpen()
    if (headResolve.outcome === 'empty') {
      return { kind: 'none' }
    }
    if (headResolve.outcome === 'missing') {
      return {
        displayName: headResolve.attemptedEntry.name,
        filePath: headResolve.attemptedEntry.filePath,
        kind: 'mruHeadMissing'
      }
    }

    return {
      filePath: headResolve.entry.filePath,
      kind: 'mruHead'
    }
  }

  async function openWelcomeScreenAutoLoadProject (
    options?: {
      invocation?: T_faWelcomeScreenAutoLoadInvocation
    }
  ): Promise<boolean> {
    const invocation = options?.invocation ?? 'user'

    if (invocation === 'automatic' && deps.hasWelcomeScreenAutoLoadMruHeadFailed()) {
      return false
    }

    const target = await resolveWelcomeScreenAutoLoadTarget()
    if (target.kind === 'none') {
      return false
    }
    if (target.kind === 'mruHeadMissing') {
      deps.markWelcomeScreenAutoLoadMruHeadFailed()
      deps.notifyWelcomeScreenRecentProjectFileMissing(target.displayName)
      await deps.refreshRecentProjects()
      return false
    }

    const loaded = await deps.runFaActionAwait('loadExistingProject', {
      filePath: target.filePath,
      resumeActiveSession: true
    })
    if (loaded !== true) {
      return false
    }

    await deps.navigateToWorkspaceRouteForActiveProject()
    return true
  }

  return {
    openWelcomeScreenAutoLoadProject,
    resolveWelcomeScreenAutoLoadTarget
  }
}
