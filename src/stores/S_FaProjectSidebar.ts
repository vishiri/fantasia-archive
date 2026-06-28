import { defineStore } from 'pinia'
import { ResultAsync } from 'neverthrow'
import { ref } from 'vue'

import type { Ref } from 'vue'

import type {
  I_faProjectSidebarRoot
} from 'app/types/I_faProjectSidebarDomain'
import {
  FA_PROJECT_SIDEBAR_DEFAULT_WIDTH_PX,
  FA_PROJECT_SIDEBAR_MIN_WIDTH_PX
} from 'app/types/I_faProjectSidebarDomain'

/**
 * Per-project workspace sidebar width persisted in the active project's SQLite KV row 'sidebar_width'.
 */
export const S_FaProjectSidebar = defineStore('S_FaProjectSidebar', () => {
  const widthPx: Ref<number> = ref(FA_PROJECT_SIDEBAR_DEFAULT_WIDTH_PX)
  const liveWidthPx: Ref<number> = ref(FA_PROJECT_SIDEBAR_DEFAULT_WIDTH_PX)
  let lastPersistedWidthPx = FA_PROJECT_SIDEBAR_DEFAULT_WIDTH_PX

  function resolveWorkspaceSidebarWidthPx (nextWidthPx: number): number {
    return Math.max(FA_PROJECT_SIDEBAR_MIN_WIDTH_PX, Math.ceil(nextWidthPx))
  }

  function applyRoot (next: I_faProjectSidebarRoot): void {
    widthPx.value = next.widthPx
    liveWidthPx.value = next.widthPx
    lastPersistedWidthPx = next.widthPx
  }

  function resetToDefault (): void {
    widthPx.value = FA_PROJECT_SIDEBAR_DEFAULT_WIDTH_PX
    liveWidthPx.value = FA_PROJECT_SIDEBAR_DEFAULT_WIDTH_PX
    lastPersistedWidthPx = FA_PROJECT_SIDEBAR_DEFAULT_WIDTH_PX
  }

  /**
   * @returns true when the bridge returned a root and 'applyRoot' ran; false when the API is missing or the read failed.
   */
  async function refreshProjectSidebar (): Promise<boolean> {
    const api = window.faContentBridgeAPIs?.projectManagement
    if (typeof api?.getProjectSidebar !== 'function') {
      return false
    }
    const readResult = await ResultAsync.fromPromise(
      api.getProjectSidebar(),
      (error): unknown => error
    )
    if (readResult.isErr()) {
      console.error('[S_FaProjectSidebar] getProjectSidebar failed', readResult.error)
      return false
    }
    applyRoot(readResult.value)
    return true
  }

  /**
   * Mirrors rendered sidebar panel width for live UI chrome (no SQLite write).
   */
  function setLiveWorkspaceSidebarWidthPx (nextWidthPx: number): void {
    liveWidthPx.value = Math.max(FA_PROJECT_SIDEBAR_MIN_WIDTH_PX, nextWidthPx)
  }

  /**
   * @returns false when the bridge is missing or the write failed; true when unchanged or persisted.
   */
  async function persistSidebarWidth (nextWidthPx: number): Promise<boolean> {
    const api = window.faContentBridgeAPIs?.projectManagement
    if (typeof api?.setProjectSidebar !== 'function') {
      console.warn('[S_FaProjectSidebar] setProjectSidebar unavailable — restart Electron dev to load preload')
      return false
    }
    const ceiled = resolveWorkspaceSidebarWidthPx(nextWidthPx)
    widthPx.value = ceiled
    liveWidthPx.value = ceiled
    if (ceiled === lastPersistedWidthPx) {
      return true
    }
    const writeResult = await ResultAsync.fromPromise(
      api.setProjectSidebar({ widthPx: ceiled }),
      (error): unknown => error
    )
    if (writeResult.isErr()) {
      console.error('[S_FaProjectSidebar] setProjectSidebar failed', writeResult.error)
      return false
    }
    if (!writeResult.value) {
      console.warn('[S_FaProjectSidebar] setProjectSidebar returned false')
      return false
    }
    lastPersistedWidthPx = ceiled
    return true
  }

  const applyRootOut = applyRoot
  const liveWidthPxOut = liveWidthPx
  const persistSidebarWidthOut = persistSidebarWidth
  const refreshProjectSidebarOut = refreshProjectSidebar
  const resetToDefaultOut = resetToDefault
  const setLiveWorkspaceSidebarWidthPxOut = setLiveWorkspaceSidebarWidthPx
  const widthPxOut = widthPx

  return {
    applyRoot: applyRootOut,
    liveWidthPx: liveWidthPxOut,
    persistSidebarWidth: persistSidebarWidthOut,
    refreshProjectSidebar: refreshProjectSidebarOut,
    resetToDefault: resetToDefaultOut,
    setLiveWorkspaceSidebarWidthPx: setLiveWorkspaceSidebarWidthPxOut,
    widthPx: widthPxOut
  }
})
