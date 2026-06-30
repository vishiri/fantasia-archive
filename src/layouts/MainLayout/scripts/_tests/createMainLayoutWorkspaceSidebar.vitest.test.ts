import { ref, watch } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import { createMainLayoutWorkspaceSidebar } from '../functions/createMainLayoutWorkspaceSidebar'

const persistSidebarWidthMock = vi.fn(async (): Promise<boolean> => true)
const refreshProjectSidebarMock = vi.fn(async (): Promise<boolean> => true)
const refreshWorkspaceWorldsMock = vi.fn(async (): Promise<void> => undefined)
const refreshHierarchyLayoutMock = vi.fn(async (): Promise<void> => undefined)
const flushHierarchyUiStateMock = vi.fn()
const resetHierarchyTreeMock = vi.fn()
const resetToDefaultMock = vi.fn()
const setLiveWorkspaceSidebarWidthPxMock = vi.fn()
const attachWorkspaceSidebarLiveWidthSyncMock = vi.fn((): (() => void) => {
  return () => undefined
})

let activeProjectId: string | null = 'project-a'
let sidebarWidthPx = 375

function debounceSidebarWidthPersist<T extends (...args: never[]) => void> (
  fn: T,
  waitMs: number
): T & { flush: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined
  const debounced = ((...args: Parameters<T>) => {
    if (timer !== undefined) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      timer = undefined
      fn(...args)
    }, waitMs)
  }) as T & { flush: () => void }
  debounced.flush = () => {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
      fn()
    }
  }
  return debounced
}

function buildUseSidebar (): ReturnType<ReturnType<typeof createMainLayoutWorkspaceSidebar>> {
  const useSidebar = createMainLayoutWorkspaceSidebar({
    S_FaActiveProject: () => ({
      activeProject: activeProjectId === null ? null : { id: activeProjectId },
      hasActiveProject: activeProjectId !== null
    }) as never,
    S_FaProjectHierarchyTree: () => ({
      flushUiStatePersist: flushHierarchyUiStateMock,
      refreshLayout: refreshHierarchyLayoutMock,
      resetOnProjectClose: resetHierarchyTreeMock
    }) as never,
    S_FaProjectSidebar: () => ({
      persistSidebarWidth: persistSidebarWidthMock,
      refreshProjectSidebar: refreshProjectSidebarMock,
      resetToDefault: resetToDefaultMock,
      setLiveWorkspaceSidebarWidthPx: setLiveWorkspaceSidebarWidthPxMock,
      widthPx: sidebarWidthPx
    }) as never,
    S_FaProjectWorkspaceWorlds: () => ({
      refreshWorkspaceWorlds: refreshWorkspaceWorldsMock
    }) as never,
    attachWorkspaceSidebarLiveWidthSync: attachWorkspaceSidebarLiveWidthSyncMock,
    bindWorkspaceSidebarLiveWidthSync: ({
      attachWorkspaceSidebarLiveWidthSync,
      onUnmounted,
      ref: refFactory,
      setLiveWorkspaceSidebarWidthPx,
      watch: watchFn
    }) => {
      const workspaceSidebarPanelRef = refFactory<HTMLElement | null>(null)
      let detachLiveWidthSync: (() => void) | undefined

      watchFn(
        () => workspaceSidebarPanelRef.value,
        (panelElement) => {
          if (detachLiveWidthSync !== undefined) {
            detachLiveWidthSync()
            detachLiveWidthSync = undefined
          }
          if (panelElement === null) {
            return
          }
          detachLiveWidthSync = attachWorkspaceSidebarLiveWidthSync({
            onWidthPx: setLiveWorkspaceSidebarWidthPx,
            panelElement
          })
        }
      )

      onUnmounted(() => {
        if (detachLiveWidthSync !== undefined) {
          detachLiveWidthSync()
        }
      })

      return workspaceSidebarPanelRef
    },
    debounceSidebarWidthPersist,
    nextTick: async (fn) => {
      await Promise.resolve()
      fn?.()
    },
    onMounted: () => undefined,
    onUnmounted: (hook) => {
      unmountedHooks.push(hook)
    },
    ref,
    sidebarDefaultWidthPx: 375,
    sidebarMinWidthPx: 375,
    sidebarWidthPersistDebounceMs: 150,
    watch: watch as never
  })

  return useSidebar()
}

const unmountedHooks: Array<() => void> = []

beforeEach(() => {
  persistSidebarWidthMock.mockReset()
  persistSidebarWidthMock.mockResolvedValue(true)
  refreshProjectSidebarMock.mockReset()
  refreshProjectSidebarMock.mockResolvedValue(true)
  refreshWorkspaceWorldsMock.mockReset()
  refreshHierarchyLayoutMock.mockReset()
  flushHierarchyUiStateMock.mockReset()
  resetHierarchyTreeMock.mockReset()
  resetToDefaultMock.mockReset()
  setLiveWorkspaceSidebarWidthPxMock.mockReset()
  attachWorkspaceSidebarLiveWidthSyncMock.mockReset()
  attachWorkspaceSidebarLiveWidthSyncMock.mockImplementation(() => {
    return () => undefined
  })
  activeProjectId = 'project-a'
  sidebarWidthPx = 375
  unmountedHooks.length = 0
  vi.useFakeTimers()
})

test('Test that splitter width updates persist ceiled width through the sidebar store', async () => {
  const api = buildUseSidebar()

  api.sidebarWidthModel.value = 512.4
  api.onSidebarSplitterWidthUpdate(512.4)

  expect(setLiveWorkspaceSidebarWidthPxMock).not.toHaveBeenCalled()
  expect(persistSidebarWidthMock).not.toHaveBeenCalled()

  await vi.advanceTimersByTimeAsync(150)

  expect(persistSidebarWidthMock).toHaveBeenCalledWith(513)

  unmountedHooks.forEach((hook) => {
    hook()
  })
  vi.useRealTimers()
})

test('Test that splitter width updates skip persist when no active project is loaded', async () => {
  activeProjectId = null

  const api = buildUseSidebar()

  api.sidebarWidthModel.value = 500
  api.onSidebarSplitterWidthUpdate(500)

  await vi.advanceTimersByTimeAsync(150)

  expect(persistSidebarWidthMock).not.toHaveBeenCalled()
  vi.useRealTimers()
})

test('Test that workspace sidebar panel ref attaches live width sync', async () => {
  const api = buildUseSidebar()
  const panelElement = document.createElement('div')

  api.workspaceSidebarPanelRef.value = panelElement
  await Promise.resolve()

  expect(attachWorkspaceSidebarLiveWidthSyncMock).toHaveBeenCalledWith({
    onWidthPx: expect.any(Function),
    panelElement
  })
})
