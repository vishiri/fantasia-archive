import { beforeEach, expect, test, vi } from 'vitest'

const resolvePathMocks = vi.hoisted(() => ({
  browserWindowStub: { tag: 'bw' as const },
  existsSync: vi.fn(),
  mainWindowExports: {
    appWindow: undefined as { tag: 'bw' } | undefined
  },
  showOpenDialog: vi.fn(),
  takeE2eOpen: vi.fn((): string | null => null),
  windowDialogState: { attachWindow: true as boolean }
}))

vi.mock('node:fs', () => {
  return {
    default: {
      existsSync: (...args: unknown[]) => resolvePathMocks.existsSync(...args)
    },
    existsSync: (...args: unknown[]) => resolvePathMocks.existsSync(...args)
  }
})

vi.mock('electron', () => {
  return {
    app: {
      getPath: vi.fn((name: string) => {
        if (name === 'downloads') {
          return 'D:\\dl'
        }
        return 'D:\\ud'
      })
    },
    dialog: {
      showOpenDialog: resolvePathMocks.showOpenDialog
    }
  }
})

vi.mock('app/src-electron/mainScripts/ipcManagement/registerFaWindowControlIpc', () => {
  return {
    windowFromIpcEvent: (): typeof resolvePathMocks.browserWindowStub | null | undefined => {
      if (!resolvePathMocks.windowDialogState.attachWindow) {
        return undefined
      }
      return resolvePathMocks.browserWindowStub
    }
  }
})

vi.mock('app/src-electron/mainScripts/windowManagement/mainWindowCreation', () => {
  return resolvePathMocks.mainWindowExports
})

vi.mock('../faProjectManagementE2ePathOverride', () => {
  return {
    takeNextE2eProjectOpenPath: resolvePathMocks.takeE2eOpen
  }
})

import { resolveFaProjectOpenTargetPath } from '../faProjectOpenResolveTargetPath'

beforeEach(() => {
  resolvePathMocks.windowDialogState.attachWindow = true
  resolvePathMocks.mainWindowExports.appWindow = undefined
  resolvePathMocks.takeE2eOpen.mockReset()
  resolvePathMocks.takeE2eOpen.mockReturnValue(null)
  resolvePathMocks.existsSync.mockReset()
  resolvePathMocks.existsSync.mockReturnValue(true)
  resolvePathMocks.showOpenDialog.mockReset()
  resolvePathMocks.showOpenDialog.mockResolvedValue({
    canceled: false,
    filePaths: ['D:\\picked.faproject']
  })
})

test('Test that E2E staged path wins and skips dialog', async () => {
  resolvePathMocks.takeE2eOpen.mockReturnValueOnce('D:\\e2e.faproject')
  const r = await resolveFaProjectOpenTargetPath({} as never, {})
  expect(r).toMatchObject({
    filePath: 'D:\\e2e.faproject',
    ipcExplicitPath: false
  })
  expect(resolvePathMocks.showOpenDialog).not.toHaveBeenCalled()
})

test('Test that E2E path errors when relative', async () => {
  resolvePathMocks.takeE2eOpen.mockReturnValueOnce('relative.faproject')
  const r = await resolveFaProjectOpenTargetPath({} as never, {})
  expect(r).toMatchObject({ errorName: 'FileError' })
  expect('errorMessage' in r && r.errorMessage).toMatch(/absolute/)
})

test('Test that explicit ipc path returns ipcExplicitPath true', async () => {
  const r = await resolveFaProjectOpenTargetPath({} as never, {
    filePath: 'D:\\ipc.faproject'
  })
  expect(r).toEqual({
    filePath: 'D:\\ipc.faproject',
    ipcExplicitPath: true
  })
})

test('Test that explicit ipc path errors trigger ipcExplicitPathFailed', async () => {
  resolvePathMocks.existsSync.mockReturnValueOnce(false)
  const r = await resolveFaProjectOpenTargetPath({} as never, {
    filePath: 'D:\\missing.faproject'
  })
  expect('ipcExplicitPathFailed' in r && r.ipcExplicitPathFailed).toBe(true)
})

test('Test that dialog cancel returns canceled', async () => {
  resolvePathMocks.showOpenDialog.mockResolvedValueOnce({
    canceled: true,
    filePaths: []
  })
  const r = await resolveFaProjectOpenTargetPath({} as never, {})
  expect('canceled' in r && r.canceled).toBe(true)
})

test('Test that dialog uses appWindow when ipc sender has no window', async () => {
  resolvePathMocks.windowDialogState.attachWindow = false
  resolvePathMocks.mainWindowExports.appWindow = resolvePathMocks.browserWindowStub
  await resolveFaProjectOpenTargetPath({} as never, {})
  expect(resolvePathMocks.showOpenDialog).toHaveBeenCalledWith(
    resolvePathMocks.browserWindowStub,
    expect.any(Object)
  )
})

test('Test that dialog uses one-argument showOpenDialog when no window is available', async () => {
  resolvePathMocks.windowDialogState.attachWindow = false
  resolvePathMocks.mainWindowExports.appWindow = undefined
  await resolveFaProjectOpenTargetPath({} as never, {})
  expect(resolvePathMocks.showOpenDialog).toHaveBeenCalledTimes(1)
  expect(resolvePathMocks.showOpenDialog.mock.calls[0].length).toBe(1)
})
