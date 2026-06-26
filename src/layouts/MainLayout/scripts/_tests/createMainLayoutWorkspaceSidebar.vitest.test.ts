import { ref } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import { createMainLayoutWorkspaceSidebar } from '../functions/createMainLayoutWorkspaceSidebar'

const persistSidebarWidthMock = vi.fn(async (): Promise<boolean> => true)
const refreshProjectSidebarMock = vi.fn(async (): Promise<boolean> => true)
const resetToDefaultMock = vi.fn()

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

beforeEach(() => {
  persistSidebarWidthMock.mockReset()
  persistSidebarWidthMock.mockResolvedValue(true)
  refreshProjectSidebarMock.mockReset()
  refreshProjectSidebarMock.mockResolvedValue(true)
  resetToDefaultMock.mockReset()
  activeProjectId = 'project-a'
  sidebarWidthPx = 375
  vi.useFakeTimers()
})

test('Test that splitter width updates persist ceiled width through the sidebar store', async () => {
  const unmountedHooks: Array<() => void> = []

  const useSidebar = createMainLayoutWorkspaceSidebar({
    S_FaActiveProject: () => ({
      activeProject: activeProjectId === null ? null : { id: activeProjectId },
      hasActiveProject: activeProjectId !== null
    }) as never,
    S_FaProjectSidebar: () => ({
      persistSidebarWidth: persistSidebarWidthMock,
      refreshProjectSidebar: refreshProjectSidebarMock,
      resetToDefault: resetToDefaultMock,
      widthPx: sidebarWidthPx
    }) as never,
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
    watch: () => undefined
  })

  const api = useSidebar()

  api.sidebarWidthModel.value = 512.4
  api.onSidebarSplitterWidthUpdate(512.4)

  await vi.advanceTimersByTimeAsync(150)

  expect(persistSidebarWidthMock).toHaveBeenCalledWith(513)

  unmountedHooks.forEach((hook) => {
    hook()
  })
  vi.useRealTimers()
})

test('Test that splitter width updates skip persist when no active project is loaded', async () => {
  activeProjectId = null

  const useSidebar = createMainLayoutWorkspaceSidebar({
    S_FaActiveProject: () => ({
      activeProject: null,
      hasActiveProject: false
    }) as never,
    S_FaProjectSidebar: () => ({
      persistSidebarWidth: persistSidebarWidthMock,
      refreshProjectSidebar: refreshProjectSidebarMock,
      resetToDefault: resetToDefaultMock,
      widthPx: sidebarWidthPx
    }) as never,
    debounceSidebarWidthPersist,
    nextTick: async (fn) => {
      await Promise.resolve()
      fn?.()
    },
    onMounted: () => undefined,
    onUnmounted: () => undefined,
    ref,
    sidebarDefaultWidthPx: 375,
    sidebarMinWidthPx: 375,
    sidebarWidthPersistDebounceMs: 150,
    watch: () => undefined
  })

  const api = useSidebar()

  api.sidebarWidthModel.value = 500
  api.onSidebarSplitterWidthUpdate(500)

  await vi.advanceTimersByTimeAsync(150)

  expect(persistSidebarWidthMock).not.toHaveBeenCalled()
  vi.useRealTimers()
})
