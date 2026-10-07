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
}, 30_000)

test('Test that setLiveWorkspaceSidebarWidthPx mirrors panel width without persisting', () => {
  store.setLiveWorkspaceSidebarWidthPx(512.4)
  expect(store.liveWidthPx).toBe(512.4)
  expect(setProjectSidebarMock).not.toHaveBeenCalled()
})

test('Test that persistSidebarWidth still writes after setLiveWorkspaceSidebarWidthPx changed the live width', async () => {
  getProjectSidebarMock.mockResolvedValueOnce({
    schemaVersion: 1,
    widthPx: 375
  })
  await store.refreshProjectSidebar()
  store.setLiveWorkspaceSidebarWidthPx(512.4)
  expect(store.liveWidthPx).toBe(512.4)
  const ok = await store.persistSidebarWidth(513)
  expect(ok).toBe(true)
  expect(setProjectSidebarMock).toHaveBeenCalledWith({ widthPx: 513 })
  expect(store.liveWidthPx).toBe(513)
})

test('Test that refreshProjectSidebar mirrors widthPx from the bridge', async () => {
  Object.assign(window.faContentBridgeAPIs, { projectManagement: undefined as never })
  const ok = await store.refreshProjectSidebar()
  expect(ok).toBe(false)
})

test('Test that refreshProjectSidebar ignores a read from an older project', async () => {
  let resolveSidebar: ((value: I_faProjectSidebarRoot) => void) | undefined
  getProjectSidebarMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveSidebar = resolve
    })
  })
  const pending = store.refreshProjectSidebar()
  await vi.waitUntil(() => getProjectSidebarMock.mock.calls.length === 1)
  const { S_FaActiveProject } = await import('../S_FaActiveProject')
  S_FaActiveProject().clearActiveProject()
  const finishSidebar = resolveSidebar
  if (finishSidebar === undefined) {
    throw new Error('missing sidebar resolver')
  }
  finishSidebar({
    schemaVersion: 1,
    widthPx: 600
  })
  await expect(pending).resolves.toBe(false)
  expect(store.widthPx).toBe(375)
  expect(store.liveWidthPx).toBe(375)
})

test('Test that refreshProjectSidebar mirrors widthPx from the bridge', async () => {
  getProjectSidebarMock.mockResolvedValueOnce({
    schemaVersion: 1,
    widthPx: 512
  })
  const ok = await store.refreshProjectSidebar()
  expect(ok).toBe(true)
  expect(store.widthPx).toBe(512)
  expect(store.liveWidthPx).toBe(512)
})

test('Test that refreshProjectSidebar keeps a sidebar width dragged during the read', async () => {
  let resolveSidebar: ((value: I_faProjectSidebarRoot) => void) | undefined
  getProjectSidebarMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveSidebar = resolve
    })
  })
  const pending = store.refreshProjectSidebar()
  await vi.waitUntil(() => getProjectSidebarMock.mock.calls.length === 1)
  store.setLiveWorkspaceSidebarWidthPx(800)
  const finishSidebar = resolveSidebar
  if (finishSidebar === undefined) {
    throw new Error('missing sidebar resolver')
  }
  finishSidebar({
    schemaVersion: 1,
    widthPx: 400
  })
  await expect(pending).resolves.toBe(true)
  expect(store.liveWidthPx).toBe(800)
  expect(store.widthPx).toBe(375)
})

test('Test that a refresh started first does not replace a later sidebar save', async () => {
  let releaseFirstGet: ((root: I_faProjectSidebarRoot) => void) | undefined
  const firstGet = new Promise<I_faProjectSidebarRoot>((resolve) => {
    releaseFirstGet = resolve
  })
  getProjectSidebarMock.mockImplementationOnce(() => firstGet)

  const refreshPromise = store.refreshProjectSidebar()
  await vi.waitUntil(() => getProjectSidebarMock.mock.calls.length === 1)
  const persistPromise = store.persistSidebarWidth(640)
  const finishFirstGet = releaseFirstGet
  if (finishFirstGet === undefined) {
    throw new Error('missing sidebar read resolver')
  }
  finishFirstGet({
    schemaVersion: 1,
    widthPx: 400
  })
  const refreshed = await refreshPromise
  const ok = await persistPromise

  expect(refreshed).toBe(true)
  expect(ok).toBe(true)
  expect(store.widthPx).toBe(640)
  expect(setProjectSidebarMock).toHaveBeenCalledWith({ widthPx: 640 })
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

/**
 * persistSidebarWidth
 * Non-finite width must not mutate store state or invoke IPC (JSON.stringify turns NaN into null).
 */
test('Test that persistSidebarWidth skips IPC when widthPx is not finite', async () => {
  const ok = await store.persistSidebarWidth(Number.NaN)
  expect(ok).toBe(false)
  expect(setProjectSidebarMock).not.toHaveBeenCalled()
  expect(store.widthPx).toBe(375)
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

test('Test that a sidebar width save does not write while a project open is in flight', async () => {
  const { S_FaActiveProject } = await import('../S_FaActiveProject')
  vi.spyOn(S_FaActiveProject(), 'isProjectReplacementInFlight').mockReturnValue(true)
  const ok = await store.persistSidebarWidth(640)
  expect(ok).toBe(false)
  expect(setProjectSidebarMock).not.toHaveBeenCalled()
  expect(store.widthPx).toBe(375)
})

test('Test that the pre-open sidebar flush still writes during a project open', async () => {
  const { S_FaActiveProject } = await import('../S_FaActiveProject')
  vi.spyOn(S_FaActiveProject(), 'isProjectReplacementInFlight').mockReturnValue(true)
  const ok = await store.persistSidebarWidth(640, { ignoreReplacementFlight: true })
  expect(ok).toBe(true)
  expect(setProjectSidebarMock).toHaveBeenCalledWith({ widthPx: 640 })
  expect(store.widthPx).toBe(640)
})

test('Test that a sidebar width save does not write after the project changes', async () => {
  let releaseRefresh: ((root: I_faProjectSidebarRoot) => void) | undefined
  getProjectSidebarMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      releaseRefresh = resolve
    })
  })
  const refreshPromise = store.refreshProjectSidebar()
  await vi.waitUntil(() => getProjectSidebarMock.mock.calls.length === 1)
  const { S_FaActiveProject } = await import('../S_FaActiveProject')
  const persistPromise = store.persistSidebarWidth(640)
  S_FaActiveProject().clearActiveProject()
  const finishRefresh = releaseRefresh
  if (finishRefresh === undefined) {
    throw new Error('missing sidebar refresh resolver')
  }
  finishRefresh({
    schemaVersion: 1,
    widthPx: 400
  })
  await expect(persistPromise).resolves.toBe(false)
  await expect(refreshPromise).resolves.toBe(false)
  expect(setProjectSidebarMock).not.toHaveBeenCalled()
  expect(store.widthPx).toBe(375)
})

test('Test that persistSidebarWidth does not treat a switched project width as already saved', async () => {
  let releaseWrite: ((saved: boolean) => void) | undefined
  setProjectSidebarMock.mockImplementationOnce(() => {
    return new Promise<boolean>((resolve) => {
      releaseWrite = resolve
    })
  })
  const pending = store.persistSidebarWidth(640)
  await vi.waitUntil(() => setProjectSidebarMock.mock.calls.length === 1)
  const { S_FaActiveProject } = await import('../S_FaActiveProject')
  S_FaActiveProject().clearActiveProject()
  const finishWrite = releaseWrite
  if (finishWrite === undefined) {
    throw new Error('missing sidebar write resolver')
  }
  finishWrite(true)
  await expect(pending).resolves.toBe(false)
  const again = await store.persistSidebarWidth(640)
  expect(again).toBe(true)
  expect(setProjectSidebarMock).toHaveBeenCalledTimes(2)
})

test('Test that persistSidebarWidth rejects when the in-flight check throws', async () => {
  const { S_FaActiveProject } = await import('../S_FaActiveProject')
  vi.spyOn(S_FaActiveProject(), 'isProjectReplacementInFlight').mockImplementation(() => {
    throw new Error('flight-boom')
  })
  await expect(store.persistSidebarWidth(640)).rejects.toThrow('flight-boom')
})

test('Test that persistSidebarWidthBeforeProjectReplacement runs the registered hook', async () => {
  const persist = vi.fn(async () => undefined)
  store.registerSidebarWidthPersistBeforeProjectReplacement(persist)
  await store.persistSidebarWidthBeforeProjectReplacement()
  expect(persist).toHaveBeenCalledOnce()
})
