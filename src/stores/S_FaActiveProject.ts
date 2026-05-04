import type { ComputedRef, Ref } from 'vue'

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { I_faActiveProject } from 'app/types/I_faActiveProjectDomain'

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

  return {
    activeProject,
    clearActiveProject,
    hasActiveProject,
    setActiveProject
  }
})
