import type {
  T_faWelcomeScreenAutoLoadInvocation,
  T_faWelcomeScreenAutoLoadTarget
} from 'app/types/I_faWelcomeScreenAutoLoad'

type T_faWelcomeScreenAutoLoadProjectDeps = {
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
  isProjectReplacementInFlight: () => boolean
  markWelcomeScreenAutoLoadMruHeadFailed: () => void
  navigateToWorkspaceRouteForActiveProject: () => Promise<void>
  notifyWelcomeScreenRecentProjectFileMissing: (displayName: string) => void
  refreshRecentProjects: () => Promise<void>
  runFaActionAwait: (
    id: 'loadExistingProject',
    payload: { filePath: string, resumeActiveSession: boolean }
  ) => Promise<boolean>
}

function welcomeAutoLoadSupersededByUserProject (
  deps: T_faWelcomeScreenAutoLoadProjectDeps,
  targetFilePath: string
): boolean {
  if (deps.isProjectReplacementInFlight()) {
    return true
  }
  const livePath = deps.getActiveProjectFilePath()
  if (livePath === undefined || livePath.length === 0) {
    return false
  }
  return livePath !== targetFilePath
}

async function resolveFaWelcomeScreenAutoLoadTarget (
  deps: T_faWelcomeScreenAutoLoadProjectDeps
): Promise<T_faWelcomeScreenAutoLoadTarget> {
  const activeSessionPath = deps.getActiveProjectFilePath()
  if (activeSessionPath !== undefined && activeSessionPath.length > 0) {
    const filePath = activeSessionPath
    return {
      filePath,
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
    const displayName = headResolve.attemptedEntry.name
    const filePath = headResolve.attemptedEntry.filePath
    return {
      displayName,
      filePath,
      kind: 'mruHeadMissing'
    }
  }

  const filePath = headResolve.entry.filePath
  return {
    filePath,
    kind: 'mruHead'
  }
}

async function openFaWelcomeScreenAutoLoadProject (
  deps: T_faWelcomeScreenAutoLoadProjectDeps,
  options?: {
    invocation?: T_faWelcomeScreenAutoLoadInvocation
  }
): Promise<boolean> {
  const invocation = options?.invocation ?? 'user'

  if (invocation === 'automatic' && deps.hasWelcomeScreenAutoLoadMruHeadFailed()) {
    return false
  }

  const target = await resolveFaWelcomeScreenAutoLoadTarget(deps)
  if (target.kind === 'none') {
    return false
  }
  if (target.kind === 'mruHeadMissing') {
    deps.markWelcomeScreenAutoLoadMruHeadFailed()
    deps.notifyWelcomeScreenRecentProjectFileMissing(target.displayName)
    await deps.refreshRecentProjects()
    return false
  }

  const superseded = welcomeAutoLoadSupersededByUserProject(deps, target.filePath)
  if (superseded) {
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

export function createFaWelcomeScreenAutoLoadProject (
  deps: T_faWelcomeScreenAutoLoadProjectDeps
): {
    openWelcomeScreenAutoLoadProject: (options?: {
      invocation?: T_faWelcomeScreenAutoLoadInvocation
    }) => Promise<boolean>
    resolveWelcomeScreenAutoLoadTarget: () => Promise<T_faWelcomeScreenAutoLoadTarget>
  } {
  const resolveWelcomeScreenAutoLoadTarget = (): Promise<T_faWelcomeScreenAutoLoadTarget> => {
    return resolveFaWelcomeScreenAutoLoadTarget(deps)
  }
  const openWelcomeScreenAutoLoadProject = (options?: {
    invocation?: T_faWelcomeScreenAutoLoadInvocation
  }): Promise<boolean> => {
    return openFaWelcomeScreenAutoLoadProject(deps, options)
  }

  return {
    openWelcomeScreenAutoLoadProject,
    resolveWelcomeScreenAutoLoadTarget
  }
}
