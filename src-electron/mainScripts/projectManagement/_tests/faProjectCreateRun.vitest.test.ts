import { ZodError } from 'zod'
import { beforeEach, expect, test, vi } from 'vitest'

const {
  showSaveDialogMock,
  applyMigrationsMock,
  quickCheckMock,
  discardBackupMock,
  openDbMock,
  replaceMock,
  restoreBackupMock,
  unlinkMock,
  promoteMock,
  takeE2ePathMock,
  readProjectUuidMock,
  browserWindowStub,
  windowDialogState,
  mainWindowExports
} = vi.hoisted(() => {
  const browserWindowStubInner = { tag: 'browser-window-stub' as const }
  return {
    applyMigrationsMock: vi.fn(),
    browserWindowStub: browserWindowStubInner,
    mainWindowExports: {
      appWindow: undefined as typeof browserWindowStubInner | undefined
    },
    openDbMock: vi.fn(function () {
      return {
        close: vi.fn(),
        pragma: vi.fn()
      }
    }),
    discardBackupMock: vi.fn(),
    promoteMock: vi.fn(),
    restoreBackupMock: vi.fn(),
    quickCheckMock: vi.fn(),
    readProjectUuidMock: vi.fn(() => '22222222-2222-4222-8222-222222222222'),
    replaceMock: vi.fn(),
    showSaveDialogMock: vi.fn(),
    takeE2ePathMock: vi.fn((): string | null => null),
    unlinkMock: vi.fn(),
    windowDialogState: {
      attachWindow: true as boolean | 'ipc-null'
    }
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
      showSaveDialog: showSaveDialogMock
    }
  }
})

vi.mock('app/src-electron/mainScripts/ipcManagement/registerFaWindowControlIpc', () => {
  return {
    windowFromIpcEvent: (): typeof browserWindowStub | null | undefined => {
      if (windowDialogState.attachWindow === false) {
        return undefined
      }
      if (windowDialogState.attachWindow === 'ipc-null') {
        return null
      }
      return browserWindowStub
    }
  }
})

vi.mock('app/src-electron/mainScripts/windowManagement/windowManagement_manager', () => {
  return mainWindowExports
})

vi.mock('../faProjectActiveDatabaseWiring', () => {
  return {
    discardFaProjectCreateBackupFile: discardBackupMock,
    faProjectCreateStagingFilePath: (filePath: string) => `${filePath}.creating`,
    openFaProjectDatabase: openDbMock,
    promoteFaProjectCreateStagingFile: promoteMock,
    replaceFaProjectActiveDatabase: replaceMock,
    restoreFaProjectCreateBackupFile: restoreBackupMock,
    unlinkFaProjectFileIfExists: unlinkMock
  }
})

vi.mock('../faProjectDbMigrateWiring', () => {
  return {
    applyFaProjectMigrations: applyMigrationsMock
  }
})

vi.mock('../faProjectDbMigrateMetaWiring', () => {
  return {
    assertFaProjectDatabaseQuickCheck: quickCheckMock,
    readFaProjectStoredProjectUuid: readProjectUuidMock
  }
})

vi.mock('../projectManagementSharedE2ePathWiring', () => {
  return {
    installFaProjectManagementE2ePathOverrideGlobals: vi.fn(),
    takeNextE2eProjectCreatePath: takeE2ePathMock,
    takeNextE2eProjectOpenPath: vi.fn((): string | null => null)
  }
})

const recordRecentForCreateMock = vi.hoisted(() => vi.fn())

vi.mock('../faRecentProjectListRuntimeWiring', () => {
  return {
    recordRecentProjectEntry: recordRecentForCreateMock
  }
})

import * as faProjectCreateInputModule from 'app/src-electron/shared/faProjectCreateInputSchema'

import { runFaProjectCreateFromIpc } from '../faProjectCreateRunWiring'

beforeEach(() => {
  windowDialogState.attachWindow = true
  mainWindowExports.appWindow = undefined
  showSaveDialogMock.mockReset()
  applyMigrationsMock.mockReset()
  quickCheckMock.mockReset()
  openDbMock.mockReset()
  openDbMock.mockImplementation(function () {
    return {
      close: vi.fn(),
      pragma: vi.fn()
    }
  })
  replaceMock.mockReset()
  unlinkMock.mockReset()
  promoteMock.mockReset()
  discardBackupMock.mockReset()
  restoreBackupMock.mockReset()
  takeE2ePathMock.mockReset()
  takeE2ePathMock.mockReturnValue(null)
  recordRecentForCreateMock.mockReset()
  readProjectUuidMock.mockReset()
  readProjectUuidMock.mockReturnValue('22222222-2222-4222-8222-222222222222')
  showSaveDialogMock.mockResolvedValue({
    canceled: false,
    filePath: 'D:\\dl\\proj.faproject'
  })
  openDbMock.mockReturnValue({
    close: vi.fn(),
    pragma: vi.fn()
  })
})

test('runFaProjectCreateFromIpc returns canceled when save dialog cancels', async () => {
  showSaveDialogMock.mockResolvedValueOnce({
    canceled: true,
    filePath: undefined
  })
  const r = await runFaProjectCreateFromIpc({} as never, { projectName: 'A' })
  expect(r.outcome).toBe('canceled')
  expect(replaceMock).not.toHaveBeenCalled()
})

test('runFaProjectCreateFromIpc returns canceled when save dialog omits file path', async () => {
  showSaveDialogMock.mockResolvedValueOnce({
    canceled: false,
    filePath: undefined
  })
  const r = await runFaProjectCreateFromIpc({} as never, { projectName: 'A' })
  expect(r.outcome).toBe('canceled')
})

test('runFaProjectCreateFromIpc returns error when save dialog returns an empty path', async () => {
  showSaveDialogMock.mockResolvedValueOnce({
    canceled: false,
    filePath: ''
  })
  const r = await runFaProjectCreateFromIpc({} as never, { projectName: 'A' })
  expect(r.outcome).toBe('error')
})

test('runFaProjectCreateFromIpc creates project when save path chosen', async () => {
  const r = await runFaProjectCreateFromIpc({} as never, { projectName: 'Realm' })
  expect(r.outcome).toBe('created')
  expect(unlinkMock).toHaveBeenCalledWith('D:\\dl\\proj.faproject.creating')
  expect(promoteMock).toHaveBeenCalledWith(
    'D:\\dl\\proj.faproject.creating',
    'D:\\dl\\proj.faproject'
  )
  expect(openDbMock).toHaveBeenCalledTimes(2)
  expect(replaceMock).toHaveBeenCalledOnce()
  expect(discardBackupMock).toHaveBeenCalledWith('D:\\dl\\proj.faproject')
  expect(restoreBackupMock).not.toHaveBeenCalled()
  expect(applyMigrationsMock).toHaveBeenCalled()
  expect(quickCheckMock).toHaveBeenCalled()
  expect(r.project?.name).toBe('Realm')
  expect(r.project?.id).toBe('22222222-2222-4222-8222-222222222222')
  expect(recordRecentForCreateMock).toHaveBeenCalledWith({
    filePath: 'D:\\dl\\proj.faproject',
    name: 'Realm'
  })
})

test('runFaProjectCreateFromIpc passes browser window reference into showSaveDialog', async () => {
  await runFaProjectCreateFromIpc({} as never, { projectName: 'Win' })
  expect(showSaveDialogMock).toHaveBeenCalledWith(
    browserWindowStub,
    expect.objectContaining({
      title: 'Create Fantasia Archive project'
    })
  )
})

test('runFaProjectCreateFromIpc calls showSaveDialog without window when none is available', async () => {
  windowDialogState.attachWindow = false
  await runFaProjectCreateFromIpc({} as never, { projectName: 'NoWin' })
  expect(showSaveDialogMock).toHaveBeenCalledWith(
    expect.objectContaining({
      title: 'Create Fantasia Archive project'
    })
  )
})

test('runFaProjectCreateFromIpc falls back to appWindow when ipc window is null', async () => {
  windowDialogState.attachWindow = 'ipc-null'
  mainWindowExports.appWindow = browserWindowStub
  await runFaProjectCreateFromIpc({} as never, { projectName: 'NullIpc' })
  expect(showSaveDialogMock).toHaveBeenCalledWith(
    browserWindowStub,
    expect.objectContaining({
      title: 'Create Fantasia Archive project'
    })
  )
})

test('runFaProjectCreateFromIpc falls back to appWindow when ipc window is missing', async () => {
  windowDialogState.attachWindow = false
  mainWindowExports.appWindow = browserWindowStub
  await runFaProjectCreateFromIpc({} as never, { projectName: 'Fallback' })
  expect(showSaveDialogMock).toHaveBeenCalledWith(
    browserWindowStub,
    expect.objectContaining({
      title: 'Create Fantasia Archive project'
    })
  )
})

test('runFaProjectCreateFromIpc uses E2E override path when set', async () => {
  takeE2ePathMock.mockReturnValueOnce('D:\\e2e\\out.faproject')
  const r = await runFaProjectCreateFromIpc({} as never, { projectName: 'E2E' })
  expect(showSaveDialogMock).not.toHaveBeenCalled()
  expect(r.outcome).toBe('created')
})

test('runFaProjectCreateFromIpc returns error when payload is not a plain object', async () => {
  const r = await runFaProjectCreateFromIpc({} as never, null as never)
  expect(r.outcome).toBe('error')
  expect(r.errorName).toBe('TypeError')
})

test('runFaProjectCreateFromIpc returns zod error for empty trimmed name', async () => {
  const r = await runFaProjectCreateFromIpc({} as never, { projectName: '   ' })
  expect(r.outcome).toBe('error')
  expect(r.errorName).toBe('ZodError')
})

test('runFaProjectCreateFromIpc returns canceled when save dialog reports cancel with path', async () => {
  showSaveDialogMock.mockResolvedValueOnce({
    canceled: true,
    filePath: 'D:\\dl\\kept.faproject'
  })
  const r = await runFaProjectCreateFromIpc({} as never, { projectName: 'A' })
  expect(r.outcome).toBe('canceled')
})

test('runFaProjectCreateFromIpc passes through Error instances from parseFaProjectCreateInput', async () => {
  const spy = vi
    .spyOn(faProjectCreateInputModule, 'parseFaProjectCreateInput')
    .mockImplementationOnce(() => {
      throw new Error('parse-boom')
    })
  const r = await runFaProjectCreateFromIpc({} as never, { projectName: 'A' })
  spy.mockRestore()
  expect(r.outcome).toBe('error')
  expect(r.errorMessage).toBe('parse-boom')
})

test('runFaProjectCreateFromIpc maps non-Error parse failures', async () => {
  const spy = vi
    .spyOn(faProjectCreateInputModule, 'parseFaProjectCreateInput')
    .mockImplementationOnce(() => {
      // eslint-disable-next-line no-throw-literal -- intentional non-Error rejection shape for IPC parse guard
      throw false
    })
  const r = await runFaProjectCreateFromIpc({} as never, { projectName: 'A' })
  spy.mockRestore()
  expect(r.outcome).toBe('error')
  expect(r.errorName).toBe('Error')
  expect(r.errorMessage).toBe('false')
})

test('runFaProjectCreateFromIpc maps non-Error failures during database setup', async () => {
  applyMigrationsMock.mockImplementationOnce(() => {
    // eslint-disable-next-line no-throw-literal -- intentional non-Error rejection shape for create rollback guard
    throw 42
  })
  const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  const r = await runFaProjectCreateFromIpc({} as never, { projectName: 'A' })
  logSpy.mockRestore()
  expect(r.outcome).toBe('error')
  expect(r.errorMessage).toBe('42')
})

test('runFaProjectCreateFromIpc returns error when save path is not absolute', async () => {
  showSaveDialogMock.mockResolvedValueOnce({
    canceled: false,
    filePath: 'relative-only.faproject'
  })
  const r = await runFaProjectCreateFromIpc({} as never, { projectName: 'A' })
  expect(r.outcome).toBe('error')
})

test('runFaProjectCreateFromIpc ignores undefined E2E override and uses save dialog', async () => {
  takeE2ePathMock.mockReturnValueOnce(undefined as never)
  const r = await runFaProjectCreateFromIpc({} as never, { projectName: 'Undef' })
  expect(showSaveDialogMock).toHaveBeenCalled()
  expect(r.outcome).toBe('created')
})

test('runFaProjectCreateFromIpc returns error when E2E path is not a valid project file', async () => {
  takeE2ePathMock.mockReturnValueOnce('relative.faproject')
  const r = await runFaProjectCreateFromIpc({} as never, { projectName: 'A' })
  expect(r.outcome).toBe('error')
})

test('runFaProjectCreateFromIpc uses default zod message when issues list is empty', async () => {
  const spy = vi
    .spyOn(faProjectCreateInputModule, 'parseFaProjectCreateInput')
    .mockImplementationOnce(() => {
      throw new ZodError([])
    })
  const r = await runFaProjectCreateFromIpc({} as never, { projectName: 'A' })
  spy.mockRestore()
  expect(r.outcome).toBe('error')
  expect(r.errorMessage).toBe('invalid project create input')
})

test('runFaProjectCreateFromIpc returns error when migrations fail', async () => {
  applyMigrationsMock.mockImplementationOnce(() => {
    throw new Error('migrate-fail')
  })
  const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  const r = await runFaProjectCreateFromIpc({} as never, { projectName: 'A' })
  logSpy.mockRestore()
  expect(r.outcome).toBe('error')
  expect(promoteMock).not.toHaveBeenCalled()
  expect(unlinkMock).not.toHaveBeenCalledWith('D:\\dl\\proj.faproject')
  expect(unlinkMock).toHaveBeenCalledWith('D:\\dl\\proj.faproject.creating')
})

test('runFaProjectCreateFromIpc restores the previous file when reopening the promoted project fails', async () => {
  openDbMock.mockImplementationOnce(function () {
    return {
      close: vi.fn(),
      pragma: vi.fn()
    }
  })
  openDbMock.mockImplementationOnce(function () {
    throw new Error('reopen-fail')
  })
  const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  const r = await runFaProjectCreateFromIpc({} as never, { projectName: 'A' })
  logSpy.mockRestore()
  expect(r.outcome).toBe('error')
  expect(promoteMock).toHaveBeenCalledOnce()
  expect(replaceMock).not.toHaveBeenCalled()
  expect(restoreBackupMock).toHaveBeenCalledWith('D:\\dl\\proj.faproject')
  expect(discardBackupMock).not.toHaveBeenCalled()
})

test('runFaProjectCreateFromIpc returns error when openFaProjectDatabase fails', async () => {
  openDbMock.mockImplementationOnce(function () {
    throw new Error('open-fail')
  })
  const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  const r = await runFaProjectCreateFromIpc({} as never, { projectName: 'A' })
  logSpy.mockRestore()
  expect(r.outcome).toBe('error')
})

test('runFaProjectCreateFromIpc returns error when quick_check fails', async () => {
  quickCheckMock.mockImplementationOnce(() => {
    throw new Error('qc-fail')
  })
  const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  const r = await runFaProjectCreateFromIpc({} as never, { projectName: 'A' })
  logSpy.mockRestore()
  expect(r.outcome).toBe('error')
})

test('runFaProjectCreateFromIpc tolerates unlink failures during rollback', async () => {
  let pass = 0
  unlinkMock.mockImplementation(function () {
    pass += 1
    if (pass === 2) {
      throw new Error('unlink-boom')
    }
  })
  applyMigrationsMock.mockImplementationOnce(() => {
    throw new Error('migrate-fail')
  })
  const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  const r = await runFaProjectCreateFromIpc({} as never, { projectName: 'A' })
  logSpy.mockRestore()
  expect(r.outcome).toBe('error')
})

test('runFaProjectCreateFromIpc tolerates db.close failures during rollback', async () => {
  const boomClose = vi.fn(() => {
    throw new Error('close-fail')
  })
  openDbMock.mockReturnValueOnce({
    close: boomClose,
    pragma: vi.fn()
  } as never)
  applyMigrationsMock.mockImplementationOnce(() => {
    throw new Error('m1')
  })
  const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  const r = await runFaProjectCreateFromIpc({} as never, { projectName: 'A' })
  logSpy.mockRestore()
  expect(r.outcome).toBe('error')
  expect(boomClose).toHaveBeenCalled()
})

test('runFaProjectCreateFromIpc tolerates discard backup failure after a successful create', async () => {
  discardBackupMock.mockImplementationOnce(() => {
    throw new Error('discard-boom')
  })
  const r = await runFaProjectCreateFromIpc({} as never, { projectName: 'A' })
  expect(r.outcome).toBe('created')
  expect(discardBackupMock).toHaveBeenCalledWith('D:\\dl\\proj.faproject')
})

test('runFaProjectCreateFromIpc tolerates restore backup failure when reopen fails', async () => {
  openDbMock.mockImplementationOnce(function () {
    return {
      close: vi.fn(),
      pragma: vi.fn()
    }
  })
  openDbMock.mockImplementationOnce(function () {
    throw new Error('reopen-fail')
  })
  restoreBackupMock.mockImplementationOnce(() => {
    throw new Error('restore-boom')
  })
  const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  const r = await runFaProjectCreateFromIpc({} as never, { projectName: 'A' })
  logSpy.mockRestore()
  expect(r.outcome).toBe('error')
  expect(restoreBackupMock).toHaveBeenCalledWith('D:\\dl\\proj.faproject')
})
