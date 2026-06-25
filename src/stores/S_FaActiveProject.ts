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
  patchFaActiveProjectDisplayName
} from './functions/faActiveProjectSnapshot'

/**
 * Session-only state for the database project currently loaded in the renderer.
 * Startup default is no project; call sites set or clear when open/close flows exist.
 */
export const S_FaActiveProject = defineStore('S_FaActiveProject', () => {
  const activeProject: Ref<I_faActiveProject | null> = ref(null)
  let openGeneration = 0

  const hasActiveProject: ComputedRef<boolean> = computed(() => {
    return activeProject.value !== null
  })

  function commitActiveProjectSnapshot (next: I_faActiveProject): void {
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
    activeProject.value = null
  }

  function patchActiveProjectDisplayName (name: string): void {
    activeProject.value = patchFaActiveProjectDisplayName(activeProject.value, name)
  }

  async function createProjectFromUserInput (projectName: string): Promise<'created' | 'canceled'> {
    const api = window.faContentBridgeAPIs?.projectManagement
    if (api === undefined) {
      throw new Error(i18n.global.t('globalFunctionality.faProjectSession.bridgeUnavailable'))
    }
    const result = await api.createProject({ projectName })
    if (result.outcome === 'canceled') {
      return 'canceled'
    }
    if (result.outcome === 'error') {
      throw new Error(result.errorMessage ?? i18n.global.t('globalFunctionality.faProjectSession.createErrorFallback'))
    }
    const p = result.project
    if (p === undefined) {
      throw new Error('Project creation returned no project snapshot.')
    }
    commitActiveProjectSnapshot(buildFaActiveProjectFromBridgeProject(p))
    return 'created'
  }

  async function openProjectFromUserDialog (): Promise<T_faActiveProjectOpenFlowOutcome> {
    const generation = ++openGeneration
    const api = window.faContentBridgeAPIs?.projectManagement
    if (api === undefined) {
      throw new Error(i18n.global.t('globalFunctionality.faProjectSession.bridgeUnavailable'))
    }
    const result = await api.openProject()
    if (generation !== openGeneration) {
      return 'superseded'
    }
    return await finalizeFaActiveProjectOpenResult(result, openFlowHandlers)
  }

  async function openProjectFromKnownPath (
    filePath: string
  ): Promise<T_faActiveProjectOpenFlowOutcome> {
    const generation = ++openGeneration
    const reused = tryReuseFaActiveProjectKnownPath(
      activeProject.value,
      filePath,
      reuseActiveProjectSession
    )
    if (reused !== null) {
      return reused
    }

    const api = window.faContentBridgeAPIs?.projectManagement
    if (api === undefined) {
      throw new Error(i18n.global.t('globalFunctionality.faProjectSession.bridgeUnavailable'))
    }
    const result = await api.openProject({ filePath })
    if (generation !== openGeneration) {
      return 'superseded'
    }
    return await finalizeFaActiveProjectOpenResult(result, openFlowHandlers)
  }

  return {
    activeProject: readonly(activeProject),
    clearActiveProject,
    createProjectFromUserInput,
    hasActiveProject,
    openProjectFromKnownPath,
    openProjectFromUserDialog,
    patchActiveProjectDisplayName,
    setActiveProject
  }
})
