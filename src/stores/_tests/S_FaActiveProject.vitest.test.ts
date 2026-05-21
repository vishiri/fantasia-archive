import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import type { I_faActiveProject } from 'app/types/I_faActiveProjectDomain'
import { registerFaAppRouterSession } from 'app/src/scripts/appInternals/faAppRouterSession'

import { S_FaActiveProject } from '../S_FaActiveProject'

const routerPushMock = vi.fn()
let faVitestRouterPath = '/'

let store: ReturnType<typeof S_FaActiveProject>

const createProjectMock = vi.fn()
const openProjectMock = vi.fn()

beforeEach(() => {
  setActivePinia(createPinia())
  routerPushMock.mockReset()
  faVitestRouterPath = '/'
  registerFaAppRouterSession({
    getCurrentPath (): string {
      return faVitestRouterPath
    },
    push (payload): void {
      faVitestRouterPath = payload.path
      routerPushMock(payload)
    }
  })
  createProjectMock.mockReset()
  createProjectMock.mockResolvedValue({ outcome: 'canceled' as const })
  openProjectMock.mockReset()
  openProjectMock.mockResolvedValue({ outcome: 'canceled' as const })
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectManagement: {
        createProject: createProjectMock,
        openProject: openProjectMock
      }
    }
  } as unknown as Window & typeof globalThis)
  store = S_FaActiveProject()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

/**
 * S_FaActiveProject
 * Default session state has no loaded project.
 */
test('Test that S_FaActiveProject starts with null activeProject and hasActiveProject false', () => {
  expect(store.activeProject).toBeNull()
  expect(store.hasActiveProject).toBe(false)
})

/**
 * S_FaActiveProject / setActiveProject
 * Persists the open project snapshot for the session.
 */
test('Test that setActiveProject assigns activeProject and sets hasActiveProject true', async () => {
  const payload: I_faActiveProject = {
    filePath: 'C:\\p\\a.faproject',
    id: 'proj-1',
    name: 'My world'
  }

  store.setActiveProject(payload)
  await flushPromises()

  expect(store.activeProject).toEqual(payload)
  expect(store.hasActiveProject).toBe(true)
  expect(routerPushMock).toHaveBeenCalledWith({ path: '/home' })
})

/**
 * S_FaActiveProject / setActiveProject
 * Replaces a previously active project.
 */
test('Test that setActiveProject replaces an existing active project', () => {
  store.setActiveProject({
    filePath: 'C:\\first.faproject',
    id: 'first',
    name: 'First'
  })

  const second: I_faActiveProject = {
    filePath: 'C:\\second.faproject',
    id: 'second',
    name: 'Second'
  }

  store.setActiveProject(second)

  expect(store.activeProject).toEqual(second)
})

/**
 * S_FaActiveProject / clearActiveProject
 * Returns to the no-project session state.
 */
test('Test that clearActiveProject clears activeProject and hasActiveProject', () => {
  store.setActiveProject({
    filePath: 'C:\\clear.faproject',
    id: 'proj-clear',
    name: 'Temp'
  })

  expect(store.hasActiveProject).toBe(true)

  store.clearActiveProject()

  expect(store.activeProject).toBeNull()
  expect(store.hasActiveProject).toBe(false)
})

/**
 * S_FaActiveProject / createProjectFromUserInput
 * Hydrates store from bridge success.
 */
test('Test that createProjectFromUserInput sets activeProject on success', async () => {
  createProjectMock.mockResolvedValueOnce({
    outcome: 'created' as const,
    project: {
      filePath: 'C:\\z.faproject',
      id: 'id-z',
      name: 'Zed'
    }
  })
  const r = await store.createProjectFromUserInput(' Zed ')
  expect(r).toBe('created')
  expect(store.activeProject).toEqual({
    filePath: 'C:\\z.faproject',
    id: 'id-z',
    name: 'Zed'
  })
  expect(createProjectMock).toHaveBeenCalledWith({ projectName: ' Zed ' })
})

test('Test that createProjectFromUserInput navigates to workspace from a catch-all route', async () => {
  faVitestRouterPath = '/not-found-route'
  routerPushMock.mockReset()
  createProjectMock.mockResolvedValueOnce({
    outcome: 'created' as const,
    project: {
      filePath: 'C:\\404.faproject',
      id: 'id-404',
      name: 'From 404'
    }
  })
  await store.createProjectFromUserInput('From 404')
  await flushPromises()
  expect(routerPushMock).toHaveBeenCalledWith({ path: '/home' })
})

test('Test that createProjectFromUserInput does not navigate away from component testing route', async () => {
  faVitestRouterPath = '/componentTesting/FantasiaMascotImage'
  routerPushMock.mockReset()
  createProjectMock.mockResolvedValueOnce({
    outcome: 'created' as const,
    project: {
      filePath: 'C:\\harness.faproject',
      id: 'id-h',
      name: 'Harness'
    }
  })
  await store.createProjectFromUserInput('Harness')
  await flushPromises()
  expect(routerPushMock).not.toHaveBeenCalled()
})

/**
 * S_FaActiveProject / createProjectFromUserInput
 * Returns canceled without changing store.
 */
test('Test that createProjectFromUserInput returns canceled when bridge cancels', async () => {
  createProjectMock.mockResolvedValueOnce({ outcome: 'canceled' as const })
  const r = await store.createProjectFromUserInput('A')
  expect(r).toBe('canceled')
  expect(store.activeProject).toBeNull()
})

test('Test that createProjectFromUserInput throws when projectManagement bridge is unavailable', async () => {
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {}
  } as unknown as Window & typeof globalThis)
  store = S_FaActiveProject()
  await expect(store.createProjectFromUserInput('x')).rejects.toThrow(/not available/)
})

test('Test that createProjectFromUserInput throws on error outcome without message', async () => {
  createProjectMock.mockResolvedValueOnce({ outcome: 'error' as const })
  await expect(store.createProjectFromUserInput('x')).rejects.toThrow(/Failed to create project/)
})

test('Test that createProjectFromUserInput throws on error outcome with message', async () => {
  createProjectMock.mockResolvedValueOnce({
    outcome: 'error' as const,
    errorMessage: 'db failed'
  })
  await expect(store.createProjectFromUserInput('x')).rejects.toThrow(/db failed/)
})

test('Test that createProjectFromUserInput throws when created result omits project', async () => {
  createProjectMock.mockResolvedValueOnce({ outcome: 'created' as const })
  await expect(store.createProjectFromUserInput('x')).rejects.toThrow(/no project snapshot/)
})

/**
 * S_FaActiveProject / openProjectFromUserDialog
 * Hydrates store from bridge success.
 */
test('Test that openProjectFromUserDialog sets activeProject on success', async () => {
  openProjectMock.mockResolvedValueOnce({
    outcome: 'opened' as const,
    project: {
      filePath: 'C:\\o.faproject',
      id: 'id-open',
      name: 'Opened Realm'
    }
  })
  const r = await store.openProjectFromUserDialog()
  expect(r).toBe('opened')
  expect(store.activeProject).toEqual({
    filePath: 'C:\\o.faproject',
    id: 'id-open',
    name: 'Opened Realm'
  })
  expect(openProjectMock).toHaveBeenCalledOnce()
})

test('Test that openProjectFromUserDialog navigates to workspace from a catch-all route', async () => {
  faVitestRouterPath = '/bogus-path'
  routerPushMock.mockReset()
  openProjectMock.mockResolvedValueOnce({
    outcome: 'opened' as const,
    project: {
      filePath: 'C:\\open-404.faproject',
      id: 'id-o4',
      name: 'Open from 404'
    }
  })
  await store.openProjectFromUserDialog()
  await flushPromises()
  expect(routerPushMock).toHaveBeenCalledWith({ path: '/home' })
})

/**
 * S_FaActiveProject / openProjectFromUserDialog
 * Returns canceled without changing store.
 */
test('Test that openProjectFromUserDialog returns canceled when bridge cancels', async () => {
  openProjectMock.mockResolvedValueOnce({ outcome: 'canceled' as const })
  const r = await store.openProjectFromUserDialog()
  expect(r).toBe('canceled')
  expect(store.activeProject).toBeNull()
})

test('Test that openProjectFromUserDialog throws when bridge is unavailable', async () => {
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {}
  } as unknown as Window & typeof globalThis)
  store = S_FaActiveProject()
  await expect(store.openProjectFromUserDialog()).rejects.toThrow(/not available/)
})

test('Test that openProjectFromUserDialog throws on error outcome', async () => {
  openProjectMock.mockResolvedValueOnce({
    outcome: 'error' as const,
    errorMessage: 'sqlite boom'
  })
  await expect(store.openProjectFromUserDialog()).rejects.toMatchObject({
    message: expect.stringMatching(/sqlite boom/),
    name: 'FaProjectOpenFailedError',
    notifyType: 'negative'
  })
})

test('Test that openProjectFromUserDialog returns reused when main reports idempotent open', async () => {
  openProjectMock.mockResolvedValueOnce({
    idempotentReuse: true,
    outcome: 'opened' as const,
    project: {
      filePath: 'D:\\open.faproject',
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Stored Name'
    }
  })
  faVitestRouterPath = '/'
  const r = await store.openProjectFromUserDialog()
  expect(r).toBe('reused')
  expect(routerPushMock).toHaveBeenCalledWith({ path: '/home' })
  expect(store.activeProject?.name).toBe('Stored Name')
})

test('Test that openProjectFromKnownPath returns reused without IPC when filePath matches active project', async () => {
  store.setActiveProject({
    filePath: 'D:\\already.faproject',
    id: 'id-1',
    name: 'Already'
  })
  faVitestRouterPath = '/'
  const r = await store.openProjectFromKnownPath('D:\\already.faproject')
  expect(r).toBe('reused')
  expect(openProjectMock).not.toHaveBeenCalled()
  expect(routerPushMock).toHaveBeenCalledWith({ path: '/home' })
})

test('Test that openProjectFromUserDialog attaches attemptedFilePath when main reports one', async () => {
  openProjectMock.mockResolvedValueOnce({
    attemptedFilePath: 'C:\\bad.faproject',
    errorMessage: 'corrupt db',
    outcome: 'error' as const
  })
  await expect(store.openProjectFromUserDialog()).rejects.toMatchObject({
    attemptedFilePath: 'C:\\bad.faproject',
    message: 'corrupt db',
    name: 'FaProjectOpenFailedError',
    notifyType: 'negative'
  })
})

test('Test that openProjectFromUserDialog throws on error outcome without message', async () => {
  openProjectMock.mockResolvedValueOnce({ outcome: 'error' as const })
  await expect(store.openProjectFromUserDialog()).rejects.toThrow(/Failed to open project/)
})

test('Test that openProjectFromUserDialog throws when opened result omits project', async () => {
  openProjectMock.mockResolvedValueOnce({ outcome: 'opened' as const })
  await expect(store.openProjectFromUserDialog()).rejects.toThrow(/no project snapshot/)
})

/**
 * S_FaActiveProject / openProjectFromKnownPath
 * Sends absolute path through the bridge payload shape.
 */
test('Test that openProjectFromKnownPath invokes openProject with filePath', async () => {
  openProjectMock.mockResolvedValueOnce({
    outcome: 'opened' as const,
    project: {
      filePath: 'D:\\by-path.faproject',
      id: 'id-p',
      name: 'By path'
    }
  })
  const r = await store.openProjectFromKnownPath('D:\\by-path.faproject')
  expect(r).toBe('opened')
  expect(openProjectMock).toHaveBeenCalledWith({ filePath: 'D:\\by-path.faproject' })
})

test('Test that openProjectFromKnownPath throws when bridge is unavailable', async () => {
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {}
  } as unknown as Window & typeof globalThis)
  store = S_FaActiveProject()
  await expect(store.openProjectFromKnownPath('D:\\x.faproject')).rejects.toThrow(/not available/)
})
