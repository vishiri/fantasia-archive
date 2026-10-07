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
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'

/**
 * Per-project workspace sidebar width persisted in the active project's SQLite KV row 'sidebar_width'.
 */
export const S_FaProjectSidebar = defineStore('S_FaProjectSidebar', () => {
  const widthPx: Ref<number> = ref(FA_PROJECT_SIDEBAR_DEFAULT_WIDTH_PX)
  const liveWidthPx: Ref<number> = ref(FA_PROJECT_SIDEBAR_DEFAULT_WIDTH_PX)
  let lastPersistedWidthPx = FA_PROJECT_SIDEBAR_DEFAULT_WIDTH_PX
  let persistSidebarWidthBeforeProjectReplacementHook: (() => Promise<void>) | null = null
  let projectSidebarIoTail: Promise<void> = Promise.resolve()

  function enqueueProjectSidebarIo<T> (work: () => Promise<T>): Promise<T> {
    const run = projectSidebarIoTail.then(work)
    projectSidebarIoTail = run.then(
      () => undefined,
      () => undefined
    )
    return run
  }

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
  async function loadProjectSidebarFromBridge (): Promise<boolean> {
    const api = window.faContentBridgeAPIs?.projectManagement
    if (typeof api?.getProjectSidebar !== 'function') {
      return false
    }
    const epochAtStart = S_FaActiveProject().readProjectContentEpoch()
    const liveWidthAtReadStart = liveWidthPx.value
    const readResult = await ResultAsync.fromPromise(
      api.getProjectSidebar(),
      (error): unknown => error
    )
    if (S_FaActiveProject().readProjectContentEpoch() !== epochAtStart) {
      return false
    }
    if (readResult.isErr()) {
      console.error('[S_FaProjectSidebar] getProjectSidebar failed', readResult.error)
      return false
    }
    if (liveWidthPx.value !== liveWidthAtReadStart) {
      return true
    }
    applyRoot(readResult.value)
    return true
  }

  async function refreshProjectSidebar (): Promise<boolean> {
    return await enqueueProjectSidebarIo(loadProjectSidebarFromBridge)
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
  function sidebarEpochMoved (epochAtStart: number): boolean {
    return S_FaActiveProject().readProjectContentEpoch() !== epochAtStart
  }

  function sidebarPersistSkipped (
    epochAtStart: number,
    ignoreReplacementFlight: boolean
  ): boolean {
    if (!ignoreReplacementFlight && S_FaActiveProject().isProjectReplacementInFlight()) {
      return true
    }
    return sidebarEpochMoved(epochAtStart)
  }

  async function writeSidebarWidth (
    nextWidthPx: number,
    epochAtStart: number,
    ignoreReplacementFlight: boolean
  ): Promise<boolean> {
    if (!Number.isFinite(nextWidthPx)) {
      return false
    }
    if (sidebarPersistSkipped(epochAtStart, ignoreReplacementFlight)) {
      return false
    }
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
    if (sidebarPersistSkipped(epochAtStart, ignoreReplacementFlight)) {
      return false
    }
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

  async function persistSidebarWidth (
    nextWidthPx: number,
    options?: { ignoreReplacementFlight?: true }
  ): Promise<boolean> {
    const epochAtStart = S_FaActiveProject().readProjectContentEpoch()
    const ignoreReplacementFlight = options?.ignoreReplacementFlight === true
    return await enqueueProjectSidebarIo(() => {
      return writeSidebarWidth(nextWidthPx, epochAtStart, ignoreReplacementFlight)
    })
  }

  function registerSidebarWidthPersistBeforeProjectReplacement (
    persist: () => Promise<void>
  ): void {
    persistSidebarWidthBeforeProjectReplacementHook = persist
  }

  async function persistSidebarWidthBeforeProjectReplacement (): Promise<void> {
    if (persistSidebarWidthBeforeProjectReplacementHook === null) {
      return
    }
    await persistSidebarWidthBeforeProjectReplacementHook()
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
    persistSidebarWidthBeforeProjectReplacement,
    registerSidebarWidthPersistBeforeProjectReplacement,
    refreshProjectSidebar: refreshProjectSidebarOut,
    resetToDefault: resetToDefaultOut,
    setLiveWorkspaceSidebarWidthPx: setLiveWorkspaceSidebarWidthPxOut,
    widthPx: widthPxOut
  }
})
