import { defineStore } from 'pinia'
import { readonly, ref, watch } from 'vue'

import type { Ref } from 'vue'

import type { I_faProjectWorld } from 'app/types/I_faProjectWorldDomain'
import type { I_faProjectWorkspaceWorldListItem } from 'app/types/I_faProjectWorkspaceWorldsDomain'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import { ResultAsync } from 'neverthrow'

import { resolveFaProjectWorldDisplayName } from 'app/src/scripts/projectWorlds/faProjectWorldDisplayName_manager'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import { mapFaProjectWorldsToWorkspaceListItems } from 'app/src/stores/functions/mapFaProjectWorldsToWorkspaceListItems'

/**
 * Workspace sidebar world name list (sorted by project sort_order from listWorlds IPC).
 */
export const S_FaProjectWorkspaceWorlds = defineStore('S_FaProjectWorkspaceWorlds', () => {
  const worldsRaw: Ref<I_faProjectWorld[]> = ref([])
  const worldListItems: Ref<I_faProjectWorkspaceWorldListItem[]> = ref([])

  function resolveLanguageCode (): T_faUserSettingsLanguageCode {
    return S_FaUserSettings().settings?.languageCode ?? 'en-US'
  }

  function applyMappedList (): void {
    const languageCode = resolveLanguageCode()
    worldListItems.value = mapFaProjectWorldsToWorkspaceListItems(
      worldsRaw.value,
      (world) => resolveFaProjectWorldDisplayName(world.displayNameTranslations, languageCode)
    )
  }

  function clearWorkspaceWorlds (): void {
    worldsRaw.value = []
    worldListItems.value = []
  }

  async function refreshWorkspaceWorlds (): Promise<void> {
    if (!S_FaActiveProject().hasActiveProject) {
      clearWorkspaceWorlds()
      return
    }

    const api = window.faContentBridgeAPIs?.projectContent
    if (typeof api?.listWorlds !== 'function') {
      clearWorkspaceWorlds()
      return
    }

    const readResult = await ResultAsync.fromPromise(
      api.listWorlds(),
      (error): unknown => error
    )
    if (readResult.isErr()) {
      console.error('[S_FaProjectWorkspaceWorlds] listWorlds failed', readResult.error)
      clearWorkspaceWorlds()
      return
    }

    worldsRaw.value = readResult.value.items
    applyMappedList()
  }

  watch(
    () => S_FaUserSettings().settings?.languageCode,
    () => {
      if (worldsRaw.value.length === 0) {
        return
      }
      applyMappedList()
    }
  )

  return {
    refreshWorkspaceWorlds,
    worldListItems: readonly(worldListItems)
  }
})
