import type { I_ref } from 'app/types/I_vueCompositionShims'
import type { StoreGeneric } from 'app/types/I_vuePiniaInjected'

type T_createMainLayoutWorkspaceSidebarDeps = {
  S_FaActiveProject: () => StoreGeneric & {
    activeProject: { id: string } | null
    hasActiveProject: boolean
  }
  S_FaProjectSidebar: () => StoreGeneric & {
    persistSidebarWidth: (widthPx: number) => Promise<boolean>
    refreshProjectSidebar: () => Promise<boolean>
    resetToDefault: () => void
    widthPx: number
  }
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
  watch: (
    source: () => string | null,
    effect: (projectId: string | null) => void | Promise<void>
  ) => void
}

export function createMainLayoutWorkspaceSidebar (
  deps: T_createMainLayoutWorkspaceSidebarDeps
): () => {
    onSidebarSplitterWidthUpdate: (widthPx: number) => void
    sidebarMinWidthPx: number
    sidebarWidthModel: I_ref<number>
  } {
  return function useMainLayoutWorkspaceSidebar () {
    const sidebarWidthModel = deps.ref(deps.sidebarDefaultWidthPx)
    const sidebarMinWidthPx = deps.sidebarMinWidthPx
    let suppressSidebarWidthPersist = false

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

    deps.watch(
      () => deps.S_FaActiveProject().activeProject?.id ?? null,
      async (projectId) => {
        scheduleSidebarWidthPersist.flush()
        if (projectId === null) {
          deps.S_FaProjectSidebar().resetToDefault()
          suppressSidebarWidthPersist = true
          sidebarWidthModel.value = deps.sidebarDefaultWidthPx
          void deps.nextTick(() => {
            suppressSidebarWidthPersist = false
          })
          return
        }
        await deps.S_FaProjectSidebar().refreshProjectSidebar()
        syncSidebarWidthFromStore()
      }
    )

    return {
      onSidebarSplitterWidthUpdate,
      sidebarMinWidthPx,
      sidebarWidthModel
    }
  }
}
