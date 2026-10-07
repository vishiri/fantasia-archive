import { nextTick, ref, watch } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import { createMainLayoutWorkspaceSidebar } from '../functions/createMainLayoutWorkspaceSidebar'

const persistSidebarWidthMock = vi.fn(async (): Promise<boolean> => true)
const refreshProjectSidebarMock = vi.fn(async (): Promise<boolean> => true)
const refreshHierarchyLayoutMock = vi.fn(async (): Promise<void> => undefined)
const flushHierarchyUiStateMock = vi.fn()
const resetHierarchyTreeMock = vi.fn()
const resetToDefaultMock = vi.fn()
const setLiveWorkspaceSidebarWidthPxMock = vi.fn()
const attachWorkspaceSidebarLiveWidthSyncMock = vi.fn((): (() => void) => {
  return () => undefined
})

let activeProjectId = ref<string | null>('project-a')
let sidebarWidthPx = 375

function debounceSidebarWidthPersist<T extends (...args: never[]) => void> (
  fn: T,
  waitMs: number
): T & { cancel: () => void, flush: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined
  const debounced = ((...args: Parameters<T>) => {
    if (timer !== undefined) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      timer = undefined
      fn(...args)
    }, waitMs)
  }) as T & { cancel: () => void, flush: () => void }
  debounced.cancel = () => {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
  }
  debounced.flush = () => {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
      fn()
    }
  }
  return debounced
}

const flushOpenedDocumentsMock = vi.fn(async (): Promise<boolean> => true)
const clearOpenedDocumentsSessionMock = vi.fn(async (): Promise<void> => undefined)
const hydrateOpenedDocumentsMock = vi.fn(async (): Promise<void> => undefined)
let registeredSidebarPersist: (() => Promise<void>) | null = null

function buildUseSidebar (): ReturnType<ReturnType<typeof createMainLayoutWorkspaceSidebar>> {
  const useSidebar = createMainLayoutWorkspaceSidebar({
    S_FaActiveProject: () => ({
      activeProject: activeProjectId.value === null ? null : { id: activeProjectId.value },
      hasActiveProject: activeProjectId.value !== null
    }) as never,
    S_FaOpenedDocuments: () => ({
      clearSession: clearOpenedDocumentsSessionMock,
      flushPersistSnapshot: flushOpenedDocumentsMock,
      hydrateFromProjectDatabase: hydrateOpenedDocumentsMock
    }) as never,
    S_FaProjectHierarchyTree: () => ({
      flushUiStatePersist: flushHierarchyUiStateMock,
      refreshLayout: refreshHierarchyLayoutMock,
      resetOnProjectClose: resetHierarchyTreeMock
    }) as never,
    S_FaProjectSidebar: () => ({
      persistSidebarWidth: persistSidebarWidthMock,
      persistSidebarWidthBeforeProjectReplacement: vi.fn(async () => undefined),
      refreshProjectSidebar: refreshProjectSidebarMock,
      registerSidebarWidthPersistBeforeProjectReplacement: (persist: () => Promise<void>) => {
        registeredSidebarPersist = persist
      },
      resetToDefault: resetToDefaultMock,
      setLiveWorkspaceSidebarWidthPx: setLiveWorkspaceSidebarWidthPxMock,
      widthPx: sidebarWidthPx
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
    onMounted: (hook) => {
      mountedHooks.push(hook)
    },
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
const mountedHooks: Array<() => void> = []

beforeEach(() => {
  persistSidebarWidthMock.mockReset()
  persistSidebarWidthMock.mockResolvedValue(true)
  refreshProjectSidebarMock.mockReset()
  refreshProjectSidebarMock.mockResolvedValue(true)
  refreshHierarchyLayoutMock.mockReset()
  flushHierarchyUiStateMock.mockReset()
  resetHierarchyTreeMock.mockReset()
  resetToDefaultMock.mockReset()
  setLiveWorkspaceSidebarWidthPxMock.mockReset()
  attachWorkspaceSidebarLiveWidthSyncMock.mockReset()
  attachWorkspaceSidebarLiveWidthSyncMock.mockImplementation(() => {
    return () => undefined
  })
  registeredSidebarPersist = null
  activeProjectId = ref<string | null>('project-a')
  sidebarWidthPx = 375
  unmountedHooks.length = 0
  mountedHooks.length = 0
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

test('Test that project replacement persist waits for an in-flight sidebar width write', async () => {
  let resolvePersist: ((value: boolean) => void) | undefined
  let persistCalls = 0
  persistSidebarWidthMock.mockImplementation(() => {
    persistCalls += 1
    if (persistCalls === 1) {
      return new Promise<boolean>((resolve) => {
        resolvePersist = resolve
      })
    }
    return Promise.resolve(true)
  })
  const api = buildUseSidebar()
  api.onSidebarSplitterWidthUpdate(500)
  await vi.advanceTimersByTimeAsync(150)
  expect(persistSidebarWidthMock).toHaveBeenCalledTimes(1)

  api.onSidebarSplitterWidthUpdate(640)
  const persistBeforeReplacement = registeredSidebarPersist
  if (persistBeforeReplacement === null) {
    throw new Error('missing sidebar replacement persist')
  }
  let replacementDone = false
  const replacement = persistBeforeReplacement().then(() => {
    replacementDone = true
  })
  await Promise.resolve()
  expect(replacementDone).toBe(false)
  expect(persistSidebarWidthMock).toHaveBeenCalledTimes(1)

  const finishPersist = resolvePersist
  if (finishPersist === undefined) {
    throw new Error('missing sidebar persist resolver')
  }
  finishPersist(true)
  await replacement

  expect(replacementDone).toBe(true)
  expect(persistSidebarWidthMock).toHaveBeenCalledTimes(2)
  expect(persistSidebarWidthMock).toHaveBeenLastCalledWith(640, {
    ignoreReplacementFlight: true
  })
  vi.useRealTimers()
})

test('Test that project replacement persist writes sidebar width and cancels the debounce', async () => {
  const api = buildUseSidebar()

  api.onSidebarSplitterWidthUpdate(500)
  expect(registeredSidebarPersist).not.toBeNull()
  await registeredSidebarPersist?.()
  expect(persistSidebarWidthMock).toHaveBeenCalledWith(500, {
    ignoreReplacementFlight: true
  })

  await vi.advanceTimersByTimeAsync(150)
  expect(persistSidebarWidthMock).toHaveBeenCalledTimes(1)
  vi.useRealTimers()
})

/**
 * createMainLayoutWorkspaceSidebar
 * QSplitter can emit undefined on a separator click without a pan delta; persist must not run.
 */
test('Test that splitter width updates skip persist when QSplitter emits a non-finite width', async () => {
  const api = buildUseSidebar()

  api.onSidebarSplitterWidthUpdate(Number.NaN)
  api.onSidebarSplitterWidthUpdate(undefined as unknown as number)

  await vi.advanceTimersByTimeAsync(150)

  expect(persistSidebarWidthMock).not.toHaveBeenCalled()
  expect(api.sidebarWidthModel.value).toBe(375)
  vi.useRealTimers()
})

/**
 * createMainLayoutWorkspaceSidebar
 * Debounced persist reads the live model; a non-finite value must not reach the store.
 */
test('Test that scheduled persist skips IPC when the sidebar model is no longer finite', async () => {
  const api = buildUseSidebar()

  api.sidebarWidthModel.value = 500
  api.onSidebarSplitterWidthUpdate(500)
  api.sidebarWidthModel.value = Number.NaN

  await vi.advanceTimersByTimeAsync(150)

  expect(persistSidebarWidthMock).not.toHaveBeenCalled()
  vi.useRealTimers()
})

test('Test that splitter width updates skip persist when no active project is loaded', async () => {
  activeProjectId.value = null

  const api = buildUseSidebar()

  api.sidebarWidthModel.value = 500
  api.onSidebarSplitterWidthUpdate(500)

  await vi.advanceTimersByTimeAsync(150)

  expect(persistSidebarWidthMock).not.toHaveBeenCalled()
  vi.useRealTimers()
})

test('Test that project hydrate does not snap a sidebar width dragged during refresh', async () => {
  const api = buildUseSidebar()
  let releaseRefresh: (() => void) | undefined
  refreshProjectSidebarMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      releaseRefresh = () => {
        resolve(true)
      }
    })
  })
  activeProjectId.value = 'project-b'
  await nextTick()
  expect(refreshProjectSidebarMock).toHaveBeenCalledTimes(1)
  api.onSidebarSplitterWidthUpdate(640)
  sidebarWidthPx = 400
  const finishRefresh = releaseRefresh
  if (finishRefresh === undefined) {
    throw new Error('missing sidebar refresh resolver')
  }
  finishRefresh()
  await nextTick()
  await Promise.resolve()
  expect(hydrateOpenedDocumentsMock).toHaveBeenCalledTimes(1)
  expect(api.sidebarWidthModel.value).toBe(640)
  vi.useRealTimers()
})

test('Test that a stale sidebar hydrate stops after the active project changes', async () => {
  buildUseSidebar()
  let releaseFirstRefresh: (() => void) | undefined
  refreshProjectSidebarMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      releaseFirstRefresh = () => {
        resolve(true)
      }
    })
  })
  activeProjectId.value = 'project-b'
  await nextTick()
  activeProjectId.value = 'project-c'
  await nextTick()
  await Promise.resolve()
  await Promise.resolve()
  expect(hydrateOpenedDocumentsMock).toHaveBeenCalledTimes(1)
  expect(refreshHierarchyLayoutMock).toHaveBeenCalledTimes(1)

  const finishFirstRefresh = releaseFirstRefresh
  if (finishFirstRefresh === undefined) {
    throw new Error('missing sidebar refresh resolver')
  }
  finishFirstRefresh()
  await nextTick()
  await Promise.resolve()
  await Promise.resolve()

  expect(hydrateOpenedDocumentsMock).toHaveBeenCalledTimes(1)
  expect(refreshHierarchyLayoutMock).toHaveBeenCalledTimes(1)
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

test('Test that a mounted sidebar copies the stored width for an already open project', async () => {
  sidebarWidthPx = 480
  refreshHierarchyLayoutMock.mockClear()
  hydrateOpenedDocumentsMock.mockClear()
  const api = buildUseSidebar()
  mountedHooks.forEach((hook) => {
    hook()
  })
  await nextTick()
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
  expect(refreshProjectSidebarMock).toHaveBeenCalledTimes(1)
  expect(refreshHierarchyLayoutMock).toHaveBeenCalledTimes(1)
  expect(hydrateOpenedDocumentsMock).toHaveBeenCalledTimes(1)
  expect(api.sidebarWidthModel.value).toBe(480)
  vi.useRealTimers()
})

test('Test that a mounted sidebar hydrate stops after the active project changes', async () => {
  refreshHierarchyLayoutMock.mockClear()
  hydrateOpenedDocumentsMock.mockClear()
  buildUseSidebar()
  let releaseFirstRefresh: (() => void) | undefined
  refreshProjectSidebarMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      releaseFirstRefresh = () => {
        resolve(true)
      }
    })
  })
  mountedHooks.forEach((hook) => {
    hook()
  })
  await Promise.resolve()
  activeProjectId.value = 'project-b'
  await nextTick()
  await Promise.resolve()
  const finishFirstRefresh = releaseFirstRefresh
  if (finishFirstRefresh === undefined) {
    throw new Error('missing sidebar refresh resolver')
  }
  finishFirstRefresh()
  await nextTick()
  await Promise.resolve()
  await Promise.resolve()
  expect(refreshHierarchyLayoutMock).toHaveBeenCalledTimes(1)
  expect(hydrateOpenedDocumentsMock).toHaveBeenCalledTimes(1)
  vi.useRealTimers()
})
