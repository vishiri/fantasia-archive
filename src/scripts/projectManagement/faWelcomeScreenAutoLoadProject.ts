import { navigateToWorkspaceRouteForActiveProject } from 'app/src/scripts/appInternals/faAppRouterSession'
import { runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun'
import { notifyWelcomeScreenRecentProjectFileMissing } from 'app/src/scripts/projectManagement/faWelcomeScreenRecentProjectNotify'
import {
  hasWelcomeScreenAutoLoadMruHeadFailed,
  markWelcomeScreenAutoLoadMruHeadFailed
} from 'app/src/scripts/projectManagement/faWelcomeScreenAutoLoadSession'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaRecentProjects } from 'app/src/stores/S_FaRecentProjects'

export type T_faWelcomeScreenAutoLoadInvocation = 'automatic' | 'user'

export type T_faWelcomeScreenAutoLoadTarget =
  | {
    kind: 'none'
  }
  | {
    filePath: string
    kind: 'activeSession'
  }
  | {
    filePath: string
    kind: 'mruHead'
  }
  | {
    displayName: string
    filePath: string
    kind: 'mruHeadMissing'
  }

/**
 * Resolves the project path for welcome skip/resume auto-load (active session, else MRU head only — never the second recent row).
 */
export async function resolveWelcomeScreenAutoLoadTarget (): Promise<T_faWelcomeScreenAutoLoadTarget> {
  const activeSessionPath = S_FaActiveProject().activeProject?.filePath
  if (activeSessionPath !== undefined && activeSessionPath.length > 0) {
    return {
      filePath: activeSessionPath,
      kind: 'activeSession'
    }
  }

  const projectManagementBridge = window.faContentBridgeAPIs?.projectManagement
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

/**
 * Auto-opens the welcome-screen target project; surfaces an error and stays on splash when the MRU head file is missing.
 */
export async function openWelcomeScreenAutoLoadProject (
  options?: {
    invocation?: T_faWelcomeScreenAutoLoadInvocation
  }
): Promise<boolean> {
  const invocation = options?.invocation ?? 'user'

  if (invocation === 'automatic' && hasWelcomeScreenAutoLoadMruHeadFailed()) {
    return false
  }

  const target = await resolveWelcomeScreenAutoLoadTarget()
  if (target.kind === 'none') {
    return false
  }
  if (target.kind === 'mruHeadMissing') {
    markWelcomeScreenAutoLoadMruHeadFailed()
    notifyWelcomeScreenRecentProjectFileMissing(target.displayName)
    await S_FaRecentProjects().refreshRecentProjects()
    return false
  }

  const loaded = await runFaActionAwait('loadExistingProject', {
    filePath: target.filePath,
    resumeActiveSession: true
  })
  if (loaded !== true) {
    return false
  }

  await navigateToWorkspaceRouteForActiveProject()
  return true
}
