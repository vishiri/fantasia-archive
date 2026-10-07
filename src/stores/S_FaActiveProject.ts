import type { ComputedRef, Ref } from 'vue'

import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'

import { i18n } from 'app/i18n/externalFileLoader'

import type { I_faActiveProject } from 'app/types/I_faActiveProjectDomain'

import { navigateToWorkspaceRouteForActiveProject } from 'app/src/scripts/appInternals/faAppRouterSession_manager'
import type { T_faActiveProjectOpenFlowOutcome } from 'app/types/I_faActiveProjectOpenFlow'
import {
  finalizeFaActiveProjectOpenResult,
  tryReuseFaActiveProjectKnownPath
} from 'app/src/scripts/projectManagement/projectManagement_manager'
import {
  buildFaActiveProjectFromBridgeProject,
  coerceFaActiveProjectCreateUserOutcome,
  coerceFaActiveProjectOpenUserOutcome,
  patchFaActiveProjectDisplayName
} from './functions/faActiveProjectSnapshot'

/**
 * Session-only state for the database project currently loaded in the renderer.
 * Startup default is no project; call sites set or clear when open/close flows exist.
 */
type T_faProjectReplacementRequest =
  | { kind: 'create', projectName: string }
  | { kind: 'openDialog' }
  | { kind: 'openKnownPath', filePath: string }

type T_faProjectReplacementOutcome = T_faActiveProjectOpenFlowOutcome | 'created'

type T_faProjectReplacementWaiter = {
  reject: (error: unknown) => void
  request: T_faProjectReplacementRequest
  resolve: (outcome: T_faProjectReplacementOutcome) => void
}

export const S_FaActiveProject = defineStore('S_FaActiveProject', () => {
  const activeProject: Ref<I_faActiveProject | null> = ref(null)
  let latestReplacementWaiter: T_faProjectReplacementWaiter | null = null
  let projectContentEpoch = 0
  let replacementFlight: Promise<void> | null = null

  const hasActiveProject: ComputedRef<boolean> = computed(() => {
    return activeProject.value !== null
  })

  function bumpProjectContentEpoch (): void {
    projectContentEpoch += 1
  }

  function readProjectContentEpoch (): number {
    return projectContentEpoch
  }

  function isProjectReplacementInFlight (): boolean {
    return replacementFlight !== null
  }

  function commitActiveProjectSnapshot (next: I_faActiveProject): void {
    bumpProjectContentEpoch()
    activeProject.value = next
    void navigateToWorkspaceRouteForActiveProject()
  }

  function reuseActiveProjectSession (next: I_faActiveProject): void {
    activeProject.value = next
    void navigateToWorkspaceRouteForActiveProject()
  }

  const openFlowHandlers = {
    commitActiveProjectSnapshot,
    reuseActiveProjectSession
  }

  function setActiveProject (next: I_faActiveProject): void {
    commitActiveProjectSnapshot(next)
  }

  function clearActiveProject (): void {
    bumpProjectContentEpoch()
    activeProject.value = null
  }

  function patchActiveProjectDisplayName (name: string): void {
    activeProject.value = patchFaActiveProjectDisplayName(activeProject.value, name)
  }

  async function persistProjectScopedStateBeforeReplacement (): Promise<void> {
    const openedDocuments = await import('./S_FaOpenedDocuments')
    const hierarchyTree = await import('./S_FaProjectHierarchyTree')
    const sidebar = await import('./S_FaProjectSidebar')
    await openedDocuments.S_FaOpenedDocuments().flushPersistSnapshotBeforeProjectReplacement()
    await hierarchyTree.S_FaProjectHierarchyTree().flushUiStatePersistBeforeProjectReplacement()
    await sidebar.S_FaProjectSidebar().persistSidebarWidthBeforeProjectReplacement()
    const replacementHooks = await import('app/src/scripts/floatingWindows/faProjectReplacementPersistHooksWiring')
    await replacementHooks.runFaProjectReplacementPersistHooks()
  }

  function requireProjectManagementApi (): NonNullable<
    Window['faContentBridgeAPIs']
  >['projectManagement'] {
    const api = window.faContentBridgeAPIs?.projectManagement
    if (api === undefined) {
      throw new Error(i18n.global.t('globalFunctionality.faProjectSession.bridgeUnavailable'))
    }
    return api
  }

  function ensureProjectReplacementFlight (): void {
    if (replacementFlight !== null) {
      return
    }
    replacementFlight = drainProjectReplacements().finally(() => {
      replacementFlight = null
      if (latestReplacementWaiter !== null) {
        ensureProjectReplacementFlight()
      }
    })
  }

  function enqueueProjectReplacement (
    request: T_faProjectReplacementRequest
  ): Promise<T_faProjectReplacementOutcome> {
    return new Promise((resolve, reject) => {
      if (latestReplacementWaiter !== null) {
        latestReplacementWaiter.resolve('superseded')
      }
      latestReplacementWaiter = {
        reject,
        request,
        resolve
      }
      ensureProjectReplacementFlight()
    })
  }

  async function runCreateProjectReplacement (
    api: NonNullable<Window['faContentBridgeAPIs']>['projectManagement'],
    projectName: string
  ): Promise<T_faProjectReplacementOutcome> {
    const result = await api.createProject({ projectName })
    if (latestReplacementWaiter !== null) {
      return 'superseded'
    }
    if (result.outcome === 'canceled') {
      return 'canceled'
    }
    if (result.outcome === 'error') {
      throw new Error(
        result.errorMessage ?? i18n.global.t('globalFunctionality.faProjectSession.createErrorFallback')
      )
    }
    const createdProject = result.project
    if (createdProject === undefined) {
      throw new Error('Project creation returned no project snapshot.')
    }
    commitActiveProjectSnapshot(buildFaActiveProjectFromBridgeProject(createdProject))
    return 'created'
  }

  async function runOpenProjectReplacement (
    api: NonNullable<Window['faContentBridgeAPIs']>['projectManagement'],
    request: T_faProjectReplacementRequest
  ): Promise<T_faProjectReplacementOutcome> {
    const result = request.kind === 'openKnownPath'
      ? await api.openProject({ filePath: request.filePath })
      : await api.openProject()
    if (latestReplacementWaiter !== null) {
      return 'superseded'
    }
    return await finalizeFaActiveProjectOpenResult(result, openFlowHandlers)
  }

  async function drainProjectReplacements (): Promise<void> {
    const api = requireProjectManagementApi()
    try {
      await persistProjectScopedStateBeforeReplacement()
    } catch (error) {
      const pending = latestReplacementWaiter
      latestReplacementWaiter = null
      pending?.reject(error)
      return
    }
    while (latestReplacementWaiter !== null) {
      const current = latestReplacementWaiter
      latestReplacementWaiter = null
      try {
        const outcome = current.request.kind === 'create'
          ? await runCreateProjectReplacement(api, current.request.projectName)
          : await runOpenProjectReplacement(api, current.request)
        if (latestReplacementWaiter !== null) {
          current.resolve('superseded')
          continue
        }
        current.resolve(outcome)
      } catch (error) {
        current.reject(error)
      }
    }
  }

  async function createProjectFromUserInput (
    projectName: string
  ): Promise<'created' | 'canceled' | 'superseded'> {
    requireProjectManagementApi()
    const outcome = await enqueueProjectReplacement({
      kind: 'create',
      projectName
    })
    const createOutcome = coerceFaActiveProjectCreateUserOutcome(outcome)
    return createOutcome
  }

  async function openProjectFromUserDialog (): Promise<T_faActiveProjectOpenFlowOutcome> {
    requireProjectManagementApi()
    const outcome = await enqueueProjectReplacement({ kind: 'openDialog' })
    const dialogOutcome = coerceFaActiveProjectOpenUserOutcome(outcome)
    return dialogOutcome
  }

  async function openProjectFromKnownPath (
    filePath: string
  ): Promise<T_faActiveProjectOpenFlowOutcome> {
    if (replacementFlight === null) {
      const reused = tryReuseFaActiveProjectKnownPath(
        activeProject.value,
        filePath,
        reuseActiveProjectSession
      )
      if (reused !== null) {
        return reused
      }
    }
    requireProjectManagementApi()
    const outcome = await enqueueProjectReplacement({
      kind: 'openKnownPath',
      filePath
    })
    const knownPathOutcome = coerceFaActiveProjectOpenUserOutcome(outcome)
    return knownPathOutcome
  }

  const publishedActiveProject = readonly(activeProject)
  return {
    activeProject: publishedActiveProject,
    clearActiveProject,
    createProjectFromUserInput,
    hasActiveProject,
    isProjectReplacementInFlight,
    openProjectFromKnownPath,
    openProjectFromUserDialog,
    patchActiveProjectDisplayName,
    readProjectContentEpoch,
    setActiveProject
  }
})
