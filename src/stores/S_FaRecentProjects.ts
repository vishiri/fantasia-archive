import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { ref } from 'vue'

import { faRecentProjectListStructuralNormalize } from 'app/src-electron/shared/faRecentProjectListStructural'
import type { I_faRecentProjectEntry } from 'app/types/I_faRecentProjectsDomain'

/**
 * MRU project list for menus; main persists; this store is a defensive cache after IPC.
 */
export const S_FaRecentProjects = defineStore('S_FaRecentProjects', () => {
  const entries: Ref<I_faRecentProjectEntry[]> = ref([])

  async function refreshRecentProjects (): Promise<void> {
    const api = window.faContentBridgeAPIs?.projectManagement
    if (api === undefined) {
      entries.value = []
      return
    }
    const rows = await api.getRecentProjects()
    entries.value = faRecentProjectListStructuralNormalize(rows)
  }

  return {
    entries,
    refreshRecentProjects
  }
})
