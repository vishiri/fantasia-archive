import { beforeEach, expect, test, vi } from 'vitest'

const { invokeMock } = vi.hoisted(() => {
  return {
    invokeMock: vi.fn()
  }
})

vi.mock('electron', () => {
  return {
    ipcRenderer: {
      invoke: invokeMock
    }
  }
})

import { FA_PROJECT_MANAGEMENT_IPC } from 'app/src-electron/electron-ipc-bridge'

import { projectManagementAPI } from '../projectManagementAPI'

beforeEach(() => {
  invokeMock.mockReset()
})

test('projectManagementAPI createProject invokes IPC with cloned payload', async () => {
  invokeMock.mockResolvedValueOnce({
    outcome: 'created',
    project: {
      filePath: 'C:\\x.faproject',
      id: 'id-1',
      name: 'N'
    }
  })
  const input = { projectName: '  Hello  ' }
  const r = await projectManagementAPI.createProject(input)
  expect(r.outcome).toBe('created')
  expect(invokeMock).toHaveBeenCalledWith(
    FA_PROJECT_MANAGEMENT_IPC.createProjectAsync,
    { projectName: '  Hello  ' }
  )
  expect(input.projectName).toBe('  Hello  ')
})

test('projectManagementAPI openProject invokes IPC with empty payload object', async () => {
  invokeMock.mockResolvedValueOnce({
    outcome: 'opened',
    project: {
      filePath: 'C:\\y.faproject',
      id: 'id-o',
      name: 'Opened'
    }
  })
  const r = await projectManagementAPI.openProject()
  expect(r.outcome).toBe('opened')
  expect(invokeMock).toHaveBeenCalledWith(
    FA_PROJECT_MANAGEMENT_IPC.openProjectAsync,
    {}
  )
})

test('projectManagementAPI getRecentProjects invokes IPC', async () => {
  invokeMock.mockResolvedValueOnce([
    {
      filePath: 'D:\\r.faproject',
      name: 'Recent'
    }
  ])
  const r = await projectManagementAPI.getRecentProjects()
  expect(r).toEqual([{
    filePath: 'D:\\r.faproject',
    name: 'Recent'
  }])
  expect(invokeMock).toHaveBeenCalledWith(FA_PROJECT_MANAGEMENT_IPC.getRecentProjectsAsync)
})

test('projectManagementAPI openProject clones optional filePath payload', async () => {
  invokeMock.mockResolvedValueOnce({ outcome: 'canceled' })
  const input = { filePath: 'D:\\z.faproject' }
  await projectManagementAPI.openProject(input)
  expect(invokeMock).toHaveBeenCalledWith(
    FA_PROJECT_MANAGEMENT_IPC.openProjectAsync,
    { filePath: 'D:\\z.faproject' }
  )
  expect(input.filePath).toBe('D:\\z.faproject')
})
