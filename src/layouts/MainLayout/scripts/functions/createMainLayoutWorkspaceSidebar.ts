import type { I_ref } from 'app/types/I_vueCompositionShims'
import type { StoreGeneric } from 'app/types/I_vuePiniaInjected'

type T_createMainLayoutWorkspaceSidebarDeps = {
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
    persistSidebarWidth: (widthPx: number) => Promise<boolean>
    refreshProjectSidebar: () => Promise<boolean>
    resetToDefault: () => void
    setLiveWorkspaceSidebarWidthPx: (widthPx: number) => void
    widthPx: number
  }
  S_FaProjectWorkspaceWorlds: () => StoreGeneric & {
    refreshWorkspaceWorlds: () => Promise<void>
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
  ) => T & { flush: () => void }
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

export function createMainLayoutWorkspaceSidebar (
  deps: T_createMainLayoutWorkspaceSidebarDeps
): () => {
    onSidebarSplitterWidthUpdate: (widthPx: number) => void
    sidebarMinWidthPx: number
    sidebarWidthModel: I_ref<number>
    workspaceSidebarPanelRef: I_ref<HTMLElement | null>
  } {
  return function useMainLayoutWorkspaceSidebar () {
    const sidebarWidthModel = deps.ref(deps.sidebarDefaultWidthPx)
    const sidebarMinWidthPx = deps.sidebarMinWidthPx
    let suppressSidebarWidthPersist = false

    const workspaceSidebarPanelRef = deps.bindWorkspaceSidebarLiveWidthSync({
      attachWorkspaceSidebarLiveWidthSync: deps.attachWorkspaceSidebarLiveWidthSync,
      onUnmounted: deps.onUnmounted,
      ref: deps.ref,
      setLiveWorkspaceSidebarWidthPx: (widthPx) => {
        deps.S_FaProjectSidebar().setLiveWorkspaceSidebarWidthPx(widthPx)
      },
      watch: deps.watch as (
        source: () => HTMLElement | null,
        effect: (panelElement: HTMLElement | null) => void
      ) => void
    })

    function syncSidebarWidthFromStore (): void {
      suppressSidebarWidthPersist = true
      sidebarWidthModel.value = deps.S_FaProjectSidebar().widthPx
      void deps.nextTick(() => {
        suppressSidebarWidthPersist = false
      })
    }

    async function persistSidebarWidthAfterDrag (): Promise<void> {
      if (!deps.S_FaActiveProject().hasActiveProject) {
        return
      }
      const ceiled = Math.max(sidebarMinWidthPx, Math.ceil(sidebarWidthModel.value))
      sidebarWidthModel.value = ceiled
      await deps.S_FaProjectSidebar().persistSidebarWidth(ceiled)
    }

    const scheduleSidebarWidthPersist = deps.debounceSidebarWidthPersist(() => {
      void persistSidebarWidthAfterDrag()
    }, deps.sidebarWidthPersistDebounceMs)

    function onSidebarSplitterWidthUpdate (_widthPx: number): void {
      if (suppressSidebarWidthPersist) {
        return
      }
      if (!deps.S_FaActiveProject().hasActiveProject) {
        return
      }
      scheduleSidebarWidthPersist()
    }

    deps.onUnmounted(() => {
      scheduleSidebarWidthPersist.flush()
    })

    deps.onMounted(() => {
      const projectId = deps.S_FaActiveProject().activeProject?.id ?? null
      if (projectId !== null) {
        void deps.S_FaProjectWorkspaceWorlds().refreshWorkspaceWorlds()
        void deps.S_FaProjectHierarchyTree().refreshLayout()
        void deps.S_FaOpenedDocuments().hydrateFromProjectDatabase()
      }
    })

    deps.watch(
      () => deps.S_FaActiveProject().activeProject?.id ?? null,
      async (projectId) => {
        scheduleSidebarWidthPersist.flush()
        if (projectId === null) {
          deps.S_FaProjectSidebar().resetToDefault()
          deps.S_FaProjectHierarchyTree().flushUiStatePersist()
          deps.S_FaProjectHierarchyTree().resetOnProjectClose()
          void deps.S_FaOpenedDocuments().flushPersistSnapshot()
          void deps.S_FaOpenedDocuments().clearSession()
          await deps.S_FaProjectWorkspaceWorlds().refreshWorkspaceWorlds()
          suppressSidebarWidthPersist = true
          sidebarWidthModel.value = deps.sidebarDefaultWidthPx
          void deps.nextTick(() => {
            suppressSidebarWidthPersist = false
          })
          return
        }
        await deps.S_FaProjectSidebar().refreshProjectSidebar()
        await deps.S_FaProjectWorkspaceWorlds().refreshWorkspaceWorlds()
        await deps.S_FaProjectHierarchyTree().refreshLayout()
        await deps.S_FaOpenedDocuments().hydrateFromProjectDatabase()
        syncSidebarWidthFromStore()
      }
    )

    return {
      onSidebarSplitterWidthUpdate,
      sidebarMinWidthPx,
      sidebarWidthModel,
      workspaceSidebarPanelRef
    }
  }
}
