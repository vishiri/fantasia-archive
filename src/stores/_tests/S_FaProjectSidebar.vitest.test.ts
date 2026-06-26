import { beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import type { I_faProjectSidebarRoot } from 'app/types/I_faProjectSidebarDomain'
import type * as S_FaProjectSidebarStore from '../S_FaProjectSidebar'

const defaultRoot: I_faProjectSidebarRoot = {
  schemaVersion: 1,
  widthPx: 375
}

const {
  getProjectSidebarMock,
  setProjectSidebarMock
} = vi.hoisted(() => {
  return {
    getProjectSidebarMock: vi.fn(async (): Promise<I_faProjectSidebarRoot> => ({ ...defaultRoot })),
    setProjectSidebarMock: vi.fn(async (): Promise<boolean> => true)
  }
})

let store: ReturnType<typeof S_FaProjectSidebarStore.S_FaProjectSidebar>

beforeEach(async () => {
  setActivePinia(createPinia())
  vi.resetModules()
  getProjectSidebarMock.mockReset()
  getProjectSidebarMock.mockResolvedValue({ ...defaultRoot })
  setProjectSidebarMock.mockReset()
  setProjectSidebarMock.mockResolvedValue(true)

  Object.defineProperty(globalThis, 'window', {
    value: {
      faContentBridgeAPIs: {
        projectManagement: {
          getProjectSidebar: getProjectSidebarMock,
          setProjectSidebar: setProjectSidebarMock
        }
      }
    },
    configurable: true,
    writable: true
  })

  const stores = await import('../S_FaProjectSidebar')
  store = stores.S_FaProjectSidebar()
})

test('Test that refreshProjectSidebar returns false when the bridge is missing', async () => {
  Object.assign(window.faContentBridgeAPIs, { projectManagement: undefined as never })
  const ok = await store.refreshProjectSidebar()
  expect(ok).toBe(false)
})

test('Test that refreshProjectSidebar mirrors widthPx from the bridge', async () => {
  getProjectSidebarMock.mockResolvedValueOnce({
    schemaVersion: 1,
    widthPx: 512
  })
  const ok = await store.refreshProjectSidebar()
  expect(ok).toBe(true)
  expect(store.widthPx).toBe(512)
})

test('Test that persistSidebarWidth skips IPC when the ceiled width is unchanged', async () => {
  getProjectSidebarMock.mockResolvedValueOnce({
    schemaVersion: 1,
    widthPx: 420
  })
  await store.refreshProjectSidebar()
  const ok = await store.persistSidebarWidth(420)
  expect(ok).toBe(true)
  expect(setProjectSidebarMock).not.toHaveBeenCalled()
  expect(store.widthPx).toBe(420)
})

test('Test that persistSidebarWidth upserts ceiled width when the value changed', async () => {
  getProjectSidebarMock.mockResolvedValueOnce({
    schemaVersion: 1,
    widthPx: 375
  })
  await store.refreshProjectSidebar()
  const ok = await store.persistSidebarWidth(480.4)
  expect(ok).toBe(true)
  expect(setProjectSidebarMock).toHaveBeenCalledWith({ widthPx: 481 })
  expect(store.widthPx).toBe(481)
})

test('Test that resetToDefault restores the 375px baseline', async () => {
  getProjectSidebarMock.mockResolvedValueOnce({
    schemaVersion: 1,
    widthPx: 600
  })
  await store.refreshProjectSidebar()
  store.resetToDefault()
  expect(store.widthPx).toBe(375)
})

test('Test that refreshProjectSidebar returns false when getProjectSidebar rejects', async () => {
  getProjectSidebarMock.mockRejectedValueOnce(new Error('read failed'))
  const ok = await store.refreshProjectSidebar()
  expect(ok).toBe(false)
})

test('Test that persistSidebarWidth returns false when the bridge is missing', async () => {
  Object.assign(window.faContentBridgeAPIs, { projectManagement: undefined as never })
  const ok = await store.persistSidebarWidth(500)
  expect(ok).toBe(false)
})

test('Test that persistSidebarWidth returns false when setProjectSidebar returns false', async () => {
  setProjectSidebarMock.mockResolvedValueOnce(false)
  const ok = await store.persistSidebarWidth(500)
  expect(ok).toBe(false)
})

test('Test that persistSidebarWidth returns false when setProjectSidebar rejects', async () => {
  setProjectSidebarMock.mockRejectedValueOnce(new Error('disk'))
  const ok = await store.persistSidebarWidth(500)
  expect(ok).toBe(false)
})
