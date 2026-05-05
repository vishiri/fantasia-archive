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
