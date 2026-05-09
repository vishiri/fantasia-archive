import type { ComputedRef, Ref } from 'vue'

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { I_faActiveProject } from 'app/types/I_faActiveProjectDomain'
import type { I_faProjectOpenResult } from 'app/types/I_faProjectManagementDomain'
import { FA_PROJECT_OPEN_ERROR_NAME_ALREADY_ACTIVE } from 'app/types/I_faProjectManagementDomain'

import { i18n } from 'app/i18n/externalFileLoader'
import { FaProjectOpenFailedError } from 'app/src/scripts/actionManager/faProjectOpenFailedError'

/**
 * Session-only state for the database project currently loaded in the renderer.
 * Startup default is no project; call sites set or clear when open/close flows exist.
 */
export const S_FaActiveProject = defineStore('S_FaActiveProject', () => {
  const activeProject: Ref<I_faActiveProject | null> = ref(null)

  const hasActiveProject: ComputedRef<boolean> = computed(() => {
    return activeProject.value !== null
  })

  function setActiveProject (next: I_faActiveProject): void {
    activeProject.value = next
  }

  function clearActiveProject (): void {
    activeProject.value = null
  }

  async function createProjectFromUserInput (projectName: string): Promise<'created' | 'canceled'> {
    const api = window.faContentBridgeAPIs?.projectManagement
    if (api === undefined) {
      throw new Error('Project management is not available in this environment.')
    }
    const result = await api.createProject({ projectName })
    if (result.outcome === 'canceled') {
      return 'canceled'
    }
    if (result.outcome === 'error') {
      throw new Error(result.errorMessage ?? 'Failed to create project.')
    }
    const p = result.project
    if (p === undefined) {
      throw new Error('Project creation returned no project snapshot.')
    }
    activeProject.value = {
      filePath: p.filePath,
      id: p.id,
      name: p.name
    }
    return 'created'
  }

  async function finalizeOpenResult (result: I_faProjectOpenResult): Promise<'opened' | 'canceled'> {
    if (result.outcome === 'canceled') {
      return 'canceled'
    }
    if (result.outcome === 'error') {
      const isAlreadyActive = result.errorName === FA_PROJECT_OPEN_ERROR_NAME_ALREADY_ACTIVE
      const localized = isAlreadyActive
        ? i18n.global.t('globalFunctionality.faProjectSession.openRejectedAlreadyActive')
        : (result.errorMessage ?? 'Failed to open project.')
      throw new FaProjectOpenFailedError(
        localized,
        result.attemptedFilePath,
        isAlreadyActive ? 'warning' : 'negative'
      )
    }
    const p = result.project
    if (p === undefined) {
      throw new Error('Project open returned no project snapshot.')
    }
    activeProject.value = {
      filePath: p.filePath,
      id: p.id,
      name: p.name
    }
    return 'opened'
  }

  async function openProjectFromUserDialog (): Promise<'opened' | 'canceled'> {
    const api = window.faContentBridgeAPIs?.projectManagement
    if (api === undefined) {
      throw new Error('Project management is not available in this environment.')
    }
    const result = await api.openProject()
    return await finalizeOpenResult(result)
  }

  async function openProjectFromKnownPath (filePath: string): Promise<'opened' | 'canceled'> {
    const api = window.faContentBridgeAPIs?.projectManagement
    if (api === undefined) {
      throw new Error('Project management is not available in this environment.')
    }
    const result = await api.openProject({ filePath })
    return await finalizeOpenResult(result)
  }

  return {
    activeProject,
    clearActiveProject,
    createProjectFromUserInput,
    hasActiveProject,
    openProjectFromKnownPath,
    openProjectFromUserDialog,
    setActiveProject
  }
})
