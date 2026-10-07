import type { I_ref } from 'app/types/I_vueCompositionShims'
import type { T_mainLayoutWorkspaceSidebarDeps } from 'app/types/I_mainLayoutWorkspaceSidebar'

function readMainLayoutActiveProjectId (
  deps: T_mainLayoutWorkspaceSidebarDeps
): string | null {
  return deps.S_FaActiveProject().activeProject?.id ?? null
}

async function hydrateMainLayoutWorkspaceProjectSession (input: {
  deps: T_mainLayoutWorkspaceSidebarDeps
  projectId: string
  sidebarWidthAtHydrateStart: number
  sidebarWidthModel: I_ref<number>
  syncSidebarWidthFromStore: () => void
}): Promise<void> {
  await input.deps.S_FaProjectSidebar().refreshProjectSidebar()
  if (readMainLayoutActiveProjectId(input.deps) !== input.projectId) {
    return
  }
  await input.deps.S_FaProjectHierarchyTree().refreshLayout()
  if (readMainLayoutActiveProjectId(input.deps) !== input.projectId) {
    return
  }
  await input.deps.S_FaOpenedDocuments().hydrateFromProjectDatabase()
  if (readMainLayoutActiveProjectId(input.deps) !== input.projectId) {
    return
  }
  if (input.sidebarWidthModel.value === input.sidebarWidthAtHydrateStart) {
    input.syncSidebarWidthFromStore()
  }
}

function bindMainLayoutWorkspaceProjectSession (input: {
  deps: T_mainLayoutWorkspaceSidebarDeps
  scheduleSidebarWidthPersist: { cancel: () => void }
  sidebarWidthModel: I_ref<number>
  setSuppressSidebarWidthPersist: (suppress: boolean) => void
  syncSidebarWidthFromStore: () => void
}): void {
  input.deps.onMounted(() => {
    const projectId = readMainLayoutActiveProjectId(input.deps)
    if (projectId === null) {
      return
    }
    void hydrateMainLayoutWorkspaceProjectSession({
      deps: input.deps,
      projectId,
      sidebarWidthAtHydrateStart: input.sidebarWidthModel.value,
      sidebarWidthModel: input.sidebarWidthModel,
      syncSidebarWidthFromStore: input.syncSidebarWidthFromStore
    })
  })

  input.deps.watch(
    () => input.deps.S_FaActiveProject().activeProject?.id ?? null,
    async (projectId) => {
      input.scheduleSidebarWidthPersist.cancel()
      if (projectId === null) {
        input.deps.S_FaProjectSidebar().resetToDefault()
        input.deps.S_FaProjectHierarchyTree().flushUiStatePersist()
        input.deps.S_FaProjectHierarchyTree().resetOnProjectClose()
        void input.deps.S_FaOpenedDocuments().flushPersistSnapshot()
        void input.deps.S_FaOpenedDocuments().clearSession()
        input.setSuppressSidebarWidthPersist(true)
        input.sidebarWidthModel.value = input.deps.sidebarDefaultWidthPx
        void input.deps.nextTick(() => {
          input.setSuppressSidebarWidthPersist(false)
        })
        return
      }
      await hydrateMainLayoutWorkspaceProjectSession({
        deps: input.deps,
        projectId,
        sidebarWidthAtHydrateStart: input.sidebarWidthModel.value,
        sidebarWidthModel: input.sidebarWidthModel,
        syncSidebarWidthFromStore: input.syncSidebarWidthFromStore
      })
    }
  )
}

function createPersistSidebarWidthAfterDrag (input: {
  hasActiveProject: () => boolean
  persistSidebarWidth: (
    widthPx: number,
    options?: { ignoreReplacementFlight?: true }
  ) => Promise<boolean>
  sidebarMinWidthPx: number
  sidebarWidthModel: I_ref<number>
}): (options?: { ignoreReplacementFlight?: true }) => Promise<void> {
  let sidebarWidthPersistInFlight: Promise<void> | null = null

  async function writeSidebarWidthAfterDrag (options?: {
    ignoreReplacementFlight?: true
  }): Promise<void> {
    if (!input.hasActiveProject()) {
      return
    }
    if (!Number.isFinite(input.sidebarWidthModel.value)) {
      return
    }
    const ceiled = Math.max(input.sidebarMinWidthPx, Math.ceil(input.sidebarWidthModel.value))
    input.sidebarWidthModel.value = ceiled
    if (options?.ignoreReplacementFlight === true) {
      await input.persistSidebarWidth(ceiled, { ignoreReplacementFlight: true })
      return
    }
    await input.persistSidebarWidth(ceiled)
  }

  return async function persistSidebarWidthAfterDrag (options?: {
    ignoreReplacementFlight?: true
  }): Promise<void> {
    const pendingPersist = sidebarWidthPersistInFlight
    if (pendingPersist !== null) {
      await pendingPersist
    }
    const write = writeSidebarWidthAfterDrag(options)
    sidebarWidthPersistInFlight = write
    try {
      await write
    } finally {
      if (sidebarWidthPersistInFlight === write) {
        sidebarWidthPersistInFlight = null
      }
    }
  }
}

export function createMainLayoutWorkspaceSidebar (
  deps: T_mainLayoutWorkspaceSidebarDeps
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

    const persistSidebarWidthAfterDrag = createPersistSidebarWidthAfterDrag({
      hasActiveProject: () => deps.S_FaActiveProject().hasActiveProject,
      persistSidebarWidth: (widthPx, options) => {
        if (options === undefined) {
          return deps.S_FaProjectSidebar().persistSidebarWidth(widthPx)
        }
        return deps.S_FaProjectSidebar().persistSidebarWidth(widthPx, options)
      },
      sidebarMinWidthPx,
      sidebarWidthModel
    })

    const scheduleSidebarWidthPersist = deps.debounceSidebarWidthPersist(() => {
      void persistSidebarWidthAfterDrag()
    }, deps.sidebarWidthPersistDebounceMs)

    async function persistScheduledSidebarWidthBeforeProjectReplacement (): Promise<void> {
      scheduleSidebarWidthPersist.cancel()
      await persistSidebarWidthAfterDrag({ ignoreReplacementFlight: true })
    }

    deps.S_FaProjectSidebar().registerSidebarWidthPersistBeforeProjectReplacement(
      persistScheduledSidebarWidthBeforeProjectReplacement
    )

    /**
     * Applies a QSplitter width emit. Ignores non-finite values from a separator click without pan.
     */
    function onSidebarSplitterWidthUpdate (widthPx: number): void {
      if (!Number.isFinite(widthPx)) {
        return
      }
      sidebarWidthModel.value = widthPx
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

    bindMainLayoutWorkspaceProjectSession({
      deps,
      scheduleSidebarWidthPersist,
      sidebarWidthModel,
      setSuppressSidebarWidthPersist: (suppress) => {
        suppressSidebarWidthPersist = suppress
      },
      syncSidebarWidthFromStore
    })

    return {
      onSidebarSplitterWidthUpdate,
      sidebarMinWidthPx,
      sidebarWidthModel,
      workspaceSidebarPanelRef
    }
  }
}
