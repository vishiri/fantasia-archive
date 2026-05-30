import { beforeEach, expect, test, vi } from 'vitest'

const {
  showOpenDialogMock,
  applyMigrationsMock,
  quickCheckMock,
  openDbMock,
  replaceMock,
  takeE2eOpenMock,
  getActiveDbMock,
  getLastKnownPathMock,
  readProjectUuidMock,
  browserWindowStub,
  windowDialogState,
  mainWindowExports,
  existsSyncMock,
  recordRecentMock,
  removeRecentMock
} = vi.hoisted(() => {
  const browserWindowStubInner = { tag: 'browser-window-stub' as const }
  return {
    applyMigrationsMock: vi.fn(),
    browserWindowStub: browserWindowStubInner,
    existsSyncMock: vi.fn(() => true),
    getActiveDbMock: vi.fn(() => null),
    getLastKnownPathMock: vi.fn(() => 'D:\\dl\\open.faproject'),
    mainWindowExports: {
      appWindow: undefined as typeof browserWindowStubInner | undefined
    },
    openDbMock: vi.fn(function () {
      return {
        pragma: vi.fn()
      }
    }),
    quickCheckMock: vi.fn(),
    readProjectUuidMock: vi.fn(() => '11111111-1111-4111-8111-111111111111'),
    replaceMock: vi.fn(),
    showOpenDialogMock: vi.fn(),
    takeE2eOpenMock: vi.fn((): string | null => null),
    windowDialogState: {
      attachWindow: true as boolean | 'ipc-null'
    },
    recordRecentMock: vi.fn(),
    removeRecentMock: vi.fn()
  }
})

vi.mock('node:fs', () => {
  return {
    default: {
      existsSync: existsSyncMock
    },
    existsSync: existsSyncMock
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
      showOpenDialog: showOpenDialogMock
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

vi.mock('app/src-electron/mainScripts/windowManagement/mainWindowCreation', () => {
  return mainWindowExports
})

vi.mock('../faProjectActiveDatabase', () => {
  return {
    getFaProjectActiveDatabase: getActiveDbMock,
    getFaProjectLastKnownActiveProjectFilePath: getLastKnownPathMock,
    openFaProjectDatabase: openDbMock,
    replaceFaProjectActiveDatabase: replaceMock
  }
})

vi.mock('../faProjectDbMigrate', () => {
  return {
    applyFaProjectMigrations: applyMigrationsMock,
    assertFaProjectDatabaseQuickCheck: quickCheckMock,
    readFaProjectStoredDisplayName: vi.fn(() => 'Stored Name'),
    readFaProjectStoredProjectUuid: readProjectUuidMock
  }
})

vi.mock('../projectManagement_manager', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../projectManagement_manager')>()

  return {
    ...actual,
    takeNextE2eProjectOpenPath: takeE2eOpenMock
  }
})

vi.mock('../faRecentProjectListRuntime', () => {
  return {
    recordRecentProjectEntry: recordRecentMock,
    removeRecentProjectEntryByPath: removeRecentMock
  }
})

import { runFaProjectOpenFromIpc } from '../faProjectOpenRun'

beforeEach(() => {
  windowDialogState.attachWindow = true
  mainWindowExports.appWindow = undefined
  showOpenDialogMock.mockReset()
  applyMigrationsMock.mockReset()
  quickCheckMock.mockReset()
  openDbMock.mockReset()
  replaceMock.mockReset()
  takeE2eOpenMock.mockReset()
  takeE2eOpenMock.mockReturnValue(null)
  getActiveDbMock.mockReset()
  getActiveDbMock.mockReturnValue(null)
  getLastKnownPathMock.mockReset()
  getLastKnownPathMock.mockReturnValue('D:\\dl\\open.faproject')
  readProjectUuidMock.mockReset()
  readProjectUuidMock.mockReturnValue('11111111-1111-4111-8111-111111111111')
  existsSyncMock.mockReset()
  existsSyncMock.mockReturnValue(true)
  showOpenDialogMock.mockResolvedValue({
    canceled: false,
    filePaths: ['D:\\dl\\open.faproject']
  })
  openDbMock.mockReturnValue({
    pragma: vi.fn()
  })
  recordRecentMock.mockReset()
  removeRecentMock.mockReset()
})

/**
 * runFaProjectOpenFromIpc
 * Empty string selections behave like cancel.
 */
test('Test that runFaProjectOpenFromIpc returns canceled when dialog returns empty string path', async () => {
  showOpenDialogMock.mockResolvedValueOnce({
    canceled: false,
    filePaths: ['']
  })
  const r = await runFaProjectOpenFromIpc({} as never, {})
  expect(r).toEqual({ outcome: 'canceled' })
})

/**
 * runFaProjectOpenFromIpc
 * Returns canceled when the native open dialog is dismissed.
 */
test('Test that runFaProjectOpenFromIpc returns canceled when open dialog cancels', async () => {
  showOpenDialogMock.mockResolvedValueOnce({
    canceled: true,
    filePaths: []
  })
  const r = await runFaProjectOpenFromIpc({} as never, {})
  expect(r).toEqual({ outcome: 'canceled' })
})

/**
 * runFaProjectOpenFromIpc
 * Opens the DB, runs migrations and checks, replaces active handle, returns snapshot.
 */
test('Test that runFaProjectOpenFromIpc returns opened with project snapshot on success', async () => {
  const r = await runFaProjectOpenFromIpc({} as never, {})
  expect(r.outcome).toBe('opened')
  expect(r.project?.filePath).toBe('D:\\dl\\open.faproject')
  expect(r.project?.name).toBe('Stored Name')
  expect(r.project?.id).toBe('11111111-1111-4111-8111-111111111111')
  expect(openDbMock).toHaveBeenCalledOnce()
  expect(replaceMock).toHaveBeenCalledOnce()
  expect(recordRecentMock).toHaveBeenCalledWith({
    filePath: 'D:\\dl\\open.faproject',
    name: 'Stored Name'
  })
})

/**
 * runFaProjectOpenFromIpc
 * Rejects when the candidate database shares project_uuid with the active project.
 */
test('Test that runFaProjectOpenFromIpc returns idempotent opened when project uuid matches active project', async () => {
  getActiveDbMock.mockReturnValue({ tag: 'active-db' } as never)
  readProjectUuidMock.mockReturnValue('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')
  const r = await runFaProjectOpenFromIpc({} as never, {})
  expect(r.outcome).toBe('opened')
  expect(r.idempotentReuse).toBe(true)
  expect(r.project?.name).toBe('Stored Name')
  expect(replaceMock).not.toHaveBeenCalled()
  expect(recordRecentMock).toHaveBeenCalledOnce()
})

/**
 * runFaProjectOpenFromIpc
 * Opens a different project when active handle has a non-matching project_uuid.
 */
test('Test that runFaProjectOpenFromIpc opens when active project uuid differs', async () => {
  getActiveDbMock.mockReturnValueOnce({ tag: 'active-db' } as never)
  let n = 0
  readProjectUuidMock.mockImplementation((): string => {
    n += 1
    return n === 1
      ? '11111111-1111-4111-8111-111111111111'
      : '22222222-2222-4222-8222-222222222222'
  })
  const r = await runFaProjectOpenFromIpc({} as never, {})
  expect(r.outcome).toBe('opened')
  expect(r.project?.id).toBe('11111111-1111-4111-8111-111111111111')
  expect(replaceMock).toHaveBeenCalled()
})

/**
 * runFaProjectOpenFromIpc
 * E2E absolute path skips dialog when valid file exists.
 */
test('Test that runFaProjectOpenFromIpc uses E2E staged path without dialog', async () => {
  takeE2eOpenMock.mockReturnValueOnce('D:\\e2e\\staged.faproject')
  const r = await runFaProjectOpenFromIpc({} as never, {})
  expect(r.outcome).toBe('opened')
  expect(showOpenDialogMock).not.toHaveBeenCalled()
})

/**
 * runFaProjectOpenFromIpc
 * Treats empty filePaths like cancel when dialog reports success.
 */
test('Test that runFaProjectOpenFromIpc returns canceled when open dialog yields no paths', async () => {
  showOpenDialogMock.mockResolvedValueOnce({
    canceled: false,
    filePaths: []
  })
  const r = await runFaProjectOpenFromIpc({} as never, {})
  expect(r).toEqual({ outcome: 'canceled' })
})

/**
 * runFaProjectOpenFromIpc
 * Selected non-faproject absolute paths surface as FileError without opening SQLite.
 */
test('Test that runFaProjectOpenFromIpc returns error when dialog selection is not a faproject file', async () => {
  showOpenDialogMock.mockResolvedValueOnce({
    canceled: false,
    filePaths: ['D:\\dl\\notes.txt']
  })
  const r = await runFaProjectOpenFromIpc({} as never, {})
  expect(r.outcome).toBe('error')
  expect(r.errorMessage).toContain('.faproject')
})

/**
 * runFaProjectOpenFromIpc
 * Missing files selected from the dialog return a clear FileError.
 */
test('Test that runFaProjectOpenFromIpc returns error when dialog path does not exist', async () => {
  showOpenDialogMock.mockResolvedValueOnce({
    canceled: false,
    filePaths: ['D:\\dl\\missing.faproject']
  })
  existsSyncMock.mockReturnValueOnce(false)
  const r = await runFaProjectOpenFromIpc({} as never, {})
  expect(r.outcome).toBe('error')
  expect(r.errorMessage).toMatch(/does not exist/)
})

/**
 * runFaProjectOpenFromIpc
 * Uses one-argument showOpenDialog when no BrowserWindow is available.
 */
test('Test that runFaProjectOpenFromIpc calls showOpenDialog without window when ipc window is absent', async () => {
  windowDialogState.attachWindow = false
  await runFaProjectOpenFromIpc({} as never, {})
  expect(showOpenDialogMock).toHaveBeenCalledTimes(1)
  expect(showOpenDialogMock.mock.calls[0].length).toBe(1)
})

/**
 * runFaProjectOpenFromIpc
 * Falls back to the main app window when the IPC sender has no BrowserWindow.
 */
test('Test that runFaProjectOpenFromIpc uses appWindow for showOpenDialog when ipc window is absent', async () => {
  windowDialogState.attachWindow = false
  mainWindowExports.appWindow = browserWindowStub
  await runFaProjectOpenFromIpc({} as never, {})
  expect(showOpenDialogMock).toHaveBeenCalledTimes(1)
  expect(showOpenDialogMock.mock.calls[0][0]).toBe(browserWindowStub)
  expect(showOpenDialogMock.mock.calls[0][1]).toMatchObject({
    title: 'Open Fantasia Archive project'
  })
})

/**
 * runFaProjectOpenFromIpc
 * Uses parentless showOpenDialog when main window ref is null (same as undefined).
 */
test('Test that runFaProjectOpenFromIpc calls showOpenDialog without window when appWindow is null', async () => {
  windowDialogState.attachWindow = false
  mainWindowExports.appWindow = null as unknown as typeof browserWindowStub
  await runFaProjectOpenFromIpc({} as never, {})
  expect(showOpenDialogMock).toHaveBeenCalledTimes(1)
  expect(showOpenDialogMock.mock.calls[0].length).toBe(1)
})

/**
 * runFaProjectOpenFromIpc
 * Migration failures return error outcome and log to console.
 */
test('Test that runFaProjectOpenFromIpc returns error when migrations throw', async () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  applyMigrationsMock.mockImplementationOnce(() => {
    throw new Error('migrate boom')
  })
  const r = await runFaProjectOpenFromIpc({} as never, {})
  expect(r.outcome).toBe('error')
  expect(r.errorMessage).toMatch(/migrate boom/)
  expect(r.attemptedFilePath).toBe('D:\\dl\\open.faproject')
  expect(removeRecentMock).not.toHaveBeenCalled()
  expect(spy).toHaveBeenCalled()
  spy.mockRestore()
})

/**
 * runFaProjectOpenFromIpc
 * Non-Error throws stringify into error messages.
 */
test('Test that runFaProjectOpenFromIpc normalizes non-Error failures into messages', async () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  applyMigrationsMock.mockImplementationOnce(() => {
    // eslint-disable-next-line no-throw-literal -- exercises normalizeFaProjectOpenFailure for plain objects
    throw {
      note: 'not-an-error-instance'
    }
  })
  const r = await runFaProjectOpenFromIpc({} as never, {})
  expect(r.outcome).toBe('error')
  expect(r.errorMessage).toBe('{"note":"not-an-error-instance"}')
  spy.mockRestore()
})

/**
 * runFaProjectOpenFromIpc
 * String throws become Error messages via normalizeFaProjectOpenFailure.
 */
test('Test that runFaProjectOpenFromIpc maps string failures to error messages', async () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  applyMigrationsMock.mockImplementationOnce(() => {
    // eslint-disable-next-line no-throw-literal -- exercises normalizeFaProjectOpenFailure string branch
    throw 'migrate string boom'
  })
  const r = await runFaProjectOpenFromIpc({} as never, {})
  expect(r.outcome).toBe('error')
  expect(r.errorMessage).toBe('migrate string boom')
  spy.mockRestore()
})

/**
 * runFaProjectOpenFromIpc
 * Uses a fallback message when JSON.stringify cannot serialize the thrown value.
 */
test('Test that runFaProjectOpenFromIpc maps JSON stringify failures to a generic message', async () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const circular: Record<string, unknown> = {}
  circular.self = circular
  applyMigrationsMock.mockImplementationOnce(() => {
    throw circular
  })
  const r = await runFaProjectOpenFromIpc({} as never, {})
  expect(r.outcome).toBe('error')
  expect(r.errorMessage).toBe('Unexpected failure opening project')
  spy.mockRestore()
})

/**
 * runFaProjectOpenFromIpc
 * Closes the DB handle when the pipeline throws before replace adopts the connection.
 */
test('Test that runFaProjectOpenFromIpc closes abandoned db when sqlite pipeline throws before replace', async () => {
  const closeSpy = vi.fn()
  openDbMock.mockReturnValueOnce({
    close: closeSpy,
    pragma: vi.fn()
  } as never)
  applyMigrationsMock.mockImplementationOnce(() => {
    throw new Error('before replace')
  })
  await runFaProjectOpenFromIpc({} as never, {})
  expect(closeSpy).toHaveBeenCalled()
})

/**
 * runFaProjectOpenFromIpc
 * Ignores errors while closing a failed open attempt.
 */
test('Test that runFaProjectOpenFromIpc tolerates close failures during cleanup', async () => {
  openDbMock.mockReturnValueOnce({
    close: vi.fn(() => {
      throw new Error('close explode')
    }),
    pragma: vi.fn()
  } as never)
  applyMigrationsMock.mockImplementationOnce(() => {
    throw new Error('pipeline fail')
  })
  const r = await runFaProjectOpenFromIpc({} as never, {})
  expect(r.outcome).toBe('error')
})

/**
 * runFaProjectOpenFromIpc
 * E2E staged path must exist when absolute validation passes.
 */
test('Test that runFaProjectOpenFromIpc returns error when E2E path points at missing file', async () => {
  takeE2eOpenMock.mockReturnValueOnce('D:\\e2e\\missing-staged.faproject')
  existsSyncMock.mockReturnValueOnce(false)
  const r = await runFaProjectOpenFromIpc({} as never, {})
  expect(r.outcome).toBe('error')
  expect(r.errorMessage).toMatch(/does not exist/)
})

/**
 * runFaProjectOpenFromIpc
 * Rejects relative E2E paths as errors.
 */
test('Test that runFaProjectOpenFromIpc returns error when E2E path is not absolute faproject', async () => {
  takeE2eOpenMock.mockReturnValueOnce('relative-only.faproject')
  const r = await runFaProjectOpenFromIpc({} as never, {})
  expect(r.outcome).toBe('error')
  expect(r.errorMessage).toMatch(/absolute/)
})

test('Test that runFaProjectOpenFromIpc maps parse failures for invalid envelopes', async () => {
  const nullish = await runFaProjectOpenFromIpc({} as never, null as never)
  expect(nullish.outcome).toBe('error')
  expect(nullish.errorName).toBe('TypeError')
  const strict = await runFaProjectOpenFromIpc({} as never, {
    filePath: 'D:\\x.faproject',
    rogue: true
  } as never)
  expect(strict.outcome).toBe('error')
  expect(strict.errorName).toBe('ZodError')
})

test('Test that runFaProjectOpenFromIpc opens explicit ipc path without dialog', async () => {
  const r = await runFaProjectOpenFromIpc({} as never, {
    filePath: 'D:\\ipc\\direct.faproject'
  })
  expect(showOpenDialogMock).not.toHaveBeenCalled()
  expect(r.outcome).toBe('opened')
  expect(recordRecentMock).toHaveBeenCalled()
})

test('Test that runFaProjectOpenFromIpc prunes MRU on explicit ipc bad suffix', async () => {
  const r = await runFaProjectOpenFromIpc({} as never, { filePath: 'D:\\bad.txt' })
  expect(r.outcome).toBe('error')
  expect(removeRecentMock).toHaveBeenCalledWith('D:\\bad.txt')
})

test('Test that runFaProjectOpenFromIpc prunes MRU when explicit ipc open fails after resolve', async () => {
  applyMigrationsMock.mockImplementationOnce(() => {
    throw new Error('boom ipc path')
  })
  const r = await runFaProjectOpenFromIpc({} as never, {
    filePath: 'D:\\ipc\\direct.faproject'
  })
  expect(r.outcome).toBe('error')
  expect(removeRecentMock).toHaveBeenCalledWith('D:\\ipc\\direct.faproject')
})

test('Test that runFaProjectOpenFromIpc idempotent-opens and touches MRU on explicit path for active project', async () => {
  getActiveDbMock.mockReturnValue({ tag: 'active-db' } as never)
  readProjectUuidMock.mockReturnValue('11111111-1111-4111-8111-111111111111')
  const r = await runFaProjectOpenFromIpc({} as never, {
    filePath: 'D:\\ipc\\same.faproject'
  })
  expect(r.outcome).toBe('opened')
  expect(r.idempotentReuse).toBe(true)
  expect(removeRecentMock).not.toHaveBeenCalled()
  expect(recordRecentMock).toHaveBeenCalledOnce()
})

test('Test that ipc parse failure stringifies non-Error throws', async () => {
  const schema = await import('app/src-electron/shared/faProjectOpenInputSchema')
  const spy = vi.spyOn(schema, 'parseFaProjectOpenInput').mockImplementation((): never => {
    // eslint-disable-next-line no-throw-literal -- exercises ipcParseFailureResult non-Error branch
    throw 42
  })
  const r = await runFaProjectOpenFromIpc({} as never, {})
  expect(r.outcome).toBe('error')
  expect(r.errorMessage).toBe('42')
  spy.mockRestore()
})

test('Test that ipc parse failure uses default text for empty Zod issues', async () => {
  const { ZodError } = await import('zod')
  const schema = await import('app/src-electron/shared/faProjectOpenInputSchema')
  const spy = vi.spyOn(schema, 'parseFaProjectOpenInput').mockImplementation((): never => {
    throw new ZodError([])
  })
  const r = await runFaProjectOpenFromIpc({} as never, {})
  expect(r.outcome).toBe('error')
  expect(r.errorMessage).toBe('invalid project open input')
  spy.mockRestore()
})

test('Test that ipc parse failure forwards other Error instances', async () => {
  const schema = await import('app/src-electron/shared/faProjectOpenInputSchema')
  const spy = vi.spyOn(schema, 'parseFaProjectOpenInput').mockImplementation((): never => {
    throw new Error('plain ipc failure')
  })
  const r = await runFaProjectOpenFromIpc({} as never, {})
  expect(r.outcome).toBe('error')
  expect(r.errorMessage).toBe('plain ipc failure')
  expect(r.errorName).toBe('Error')
  spy.mockRestore()
})
