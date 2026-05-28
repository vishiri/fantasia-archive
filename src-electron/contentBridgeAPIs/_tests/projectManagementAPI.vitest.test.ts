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

test('projectManagementAPI resolveRecentProjectMruHeadForOpen invokes IPC', async () => {
  invokeMock.mockResolvedValueOnce({
    entry: {
      filePath: 'D:\\r.faproject',
      name: 'Recent'
    },
    outcome: 'ready'
  })
  const r = await projectManagementAPI.resolveRecentProjectMruHeadForOpen()
  expect(r).toEqual({
    entry: {
      filePath: 'D:\\r.faproject',
      name: 'Recent'
    },
    outcome: 'ready'
  })
  expect(invokeMock).toHaveBeenCalledWith(
    FA_PROJECT_MANAGEMENT_IPC.resolveRecentProjectMruHeadForOpenAsync
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

test('projectManagementAPI getProjectNoteboard invokes IPC', async () => {
  const snapshot = {
    frame: null,
    schemaVersion: 1 as const,
    text: 'x'
  }

  invokeMock.mockResolvedValueOnce(snapshot)
  const r = await projectManagementAPI.getProjectNoteboard()
  expect(r).toEqual(snapshot)
  expect(invokeMock).toHaveBeenCalledWith(FA_PROJECT_MANAGEMENT_IPC.getProjectNoteboardAsync)
})

test('projectManagementAPI setProjectNoteboard invokes IPC with cloned patch', async () => {
  invokeMock.mockResolvedValueOnce(true)
  const patch = { text: 'y' }
  const persisted = await projectManagementAPI.setProjectNoteboard(patch)
  expect(persisted).toBe(true)
  expect(invokeMock).toHaveBeenCalledWith(
    FA_PROJECT_MANAGEMENT_IPC.setProjectNoteboardPatchAsync,
    { text: 'y' }
  )
  expect(patch.text).toBe('y')
})

test('projectManagementAPI getProjectStyling invokes IPC', async () => {
  const snapshot = {
    css: 'p{}',
    frame: null,
    schemaVersion: 1 as const
  }

  invokeMock.mockResolvedValueOnce(snapshot)
  const r = await projectManagementAPI.getProjectStyling()
  expect(r).toEqual(snapshot)
  expect(invokeMock).toHaveBeenCalledWith(FA_PROJECT_MANAGEMENT_IPC.getProjectStylingAsync)
})

test('projectManagementAPI setProjectStyling invokes IPC with cloned patch', async () => {
  invokeMock.mockResolvedValueOnce(true)
  const patch = { css: 'z{}' }
  const persisted = await projectManagementAPI.setProjectStyling(patch)
  expect(persisted).toBe(true)
  expect(invokeMock).toHaveBeenCalledWith(
    FA_PROJECT_MANAGEMENT_IPC.setProjectStylingPatchAsync,
    { css: 'z{}' }
  )
  expect(patch.css).toBe('z{}')
})

test('projectManagementAPI getProjectSettings invokes IPC', async () => {
  const snapshot = {
    projectName: 'Alpha',
    schemaVersion: 1 as const
  }

  invokeMock.mockResolvedValueOnce(snapshot)
  const r = await projectManagementAPI.getProjectSettings()
  expect(r).toEqual(snapshot)
  expect(invokeMock).toHaveBeenCalledWith(FA_PROJECT_MANAGEMENT_IPC.getProjectSettingsAsync)
})

test('projectManagementAPI setProjectSettings invokes IPC with cloned patch', async () => {
  invokeMock.mockResolvedValueOnce(true)
  const patch = { projectName: 'Renamed' }
  const persisted = await projectManagementAPI.setProjectSettings(patch)
  expect(persisted).toBe(true)
  expect(invokeMock).toHaveBeenCalledWith(
    FA_PROJECT_MANAGEMENT_IPC.setProjectSettingsPatchAsync,
    { projectName: 'Renamed' }
  )
  expect(patch.projectName).toBe('Renamed')
})
