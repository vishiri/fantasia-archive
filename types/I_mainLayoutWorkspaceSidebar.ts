import type { I_ref } from 'app/types/I_vueCompositionShims'
import type { StoreGeneric } from 'app/types/I_vuePiniaInjected'

/**
 * Injected deps for the workspace sidebar width model and project-session hydrate.
 */
export type T_mainLayoutWorkspaceSidebarDeps = {
  S_FaActiveProject: () => StoreGeneric & {
    activeProject: { id: string } | null
    hasActiveProject: boolean
  }
  S_FaProjectHierarchyTree: () => StoreGeneric & {
    flushUiStatePersist: () => void
    refreshLayout: () => Promise<void>
    resetOnProjectClose: () => void
  }
  S_FaProjectSidebar: () => StoreGeneric & {
    persistSidebarWidth: (
      widthPx: number,
      options?: { ignoreReplacementFlight?: true }
    ) => Promise<boolean>
    persistSidebarWidthBeforeProjectReplacement: () => Promise<void>
    refreshProjectSidebar: () => Promise<boolean>
    registerSidebarWidthPersistBeforeProjectReplacement: (
      persist: () => Promise<void>
    ) => void
    resetToDefault: () => void
    setLiveWorkspaceSidebarWidthPx: (widthPx: number) => void
    widthPx: number
  }
  S_FaOpenedDocuments: () => StoreGeneric & {
    clearSession: () => Promise<void>
    flushPersistSnapshot: () => Promise<boolean>
    hydrateFromProjectDatabase: () => Promise<void>
  }
  attachWorkspaceSidebarLiveWidthSync: (input: {
    onWidthPx: (widthPx: number) => void
    panelElement: HTMLElement
  }) => () => void
  bindWorkspaceSidebarLiveWidthSync: (input: {
    attachWorkspaceSidebarLiveWidthSync: (options: {
      onWidthPx: (widthPx: number) => void
      panelElement: HTMLElement
    }) => () => void
    onUnmounted: (hook: () => void) => void
    ref: <T>(value: T) => I_ref<T>
    setLiveWorkspaceSidebarWidthPx: (widthPx: number) => void
    watch: (
      source: () => HTMLElement | null,
      effect: (panelElement: HTMLElement | null) => void
    ) => void
  }) => I_ref<HTMLElement | null>
  debounceSidebarWidthPersist: <T extends (...args: never[]) => void>(
    fn: T,
    waitMs: number
  ) => T & { cancel: () => void, flush: () => void }
  nextTick: (fn?: () => void) => Promise<void>
  onMounted: (hook: () => void) => void
  onUnmounted: (hook: () => void) => void
  ref: <T>(value: T) => I_ref<T>
  sidebarDefaultWidthPx: number
  sidebarMinWidthPx: number
  sidebarWidthPersistDebounceMs: number
  watch: {
    (
      source: () => string | null,
      effect: (projectId: string | null) => void | Promise<void>
    ): void
    (
      source: () => HTMLElement | null,
      effect: (panelElement: HTMLElement | null) => void
    ): void
  }
}
