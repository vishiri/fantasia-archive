import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import type { I_faActiveProject } from 'app/types/I_faActiveProjectDomain'

import { S_FaActiveProject } from '../S_FaActiveProject'

let store: ReturnType<typeof S_FaActiveProject>

const createProjectMock = vi.fn()

beforeEach(() => {
  setActivePinia(createPinia())
  createProjectMock.mockReset()
  createProjectMock.mockResolvedValue({ outcome: 'canceled' as const })
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectManagement: {
        createProject: createProjectMock
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
test('Test that setActiveProject assigns activeProject and sets hasActiveProject true', () => {
  const payload: I_faActiveProject = {
    filePath: 'C:\\p\\a.faproject',
    id: 'proj-1',
    name: 'My world'
  }

  store.setActiveProject(payload)

  expect(store.activeProject).toEqual(payload)
  expect(store.hasActiveProject).toBe(true)
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
