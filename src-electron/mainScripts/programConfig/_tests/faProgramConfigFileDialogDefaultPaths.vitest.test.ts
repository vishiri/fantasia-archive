import path from 'node:path'

import { afterEach, expect, test, vi } from 'vitest'

import {
  getFaProgramConfigExportSaveDefaultPath,
  getFaProgramConfigImportOpenDefaultPath
} from '../faProgramConfigFileDialogDefaultPaths'

const appGetPathMock = vi.hoisted(() => vi.fn())

vi.mock('electron', () => ({
  app: { getPath: appGetPathMock }
}))

const originalTestEnv = process.env.TEST_ENV

afterEach(() => {
  if (originalTestEnv === undefined) {
    delete process.env.TEST_ENV
  } else {
    process.env.TEST_ENV = originalTestEnv
  }
  vi.unstubAllEnvs()
  appGetPathMock.mockReset()
})

test('Non-e2e uses Downloads for default export and import folder', () => {
  vi.stubEnv('TEST_ENV', 'components')
  appGetPathMock.mockImplementation((name: string) => (name === 'downloads' ? 'C:\\D' : 'C:\\U'))
  expect(getFaProgramConfigExportSaveDefaultPath()).toBe(path.join('C:\\D', 'faConfigExport.faconfig'))
  expect(getFaProgramConfigImportOpenDefaultPath()).toBe('C:\\D')
})

test('E2E uses userData for default export path and import folder', () => {
  vi.stubEnv('TEST_ENV', 'e2e')
  appGetPathMock.mockImplementation((name: string) => (name === 'userData' ? 'C:\\E2E\\ud' : 'C:\\x'))
  expect(getFaProgramConfigExportSaveDefaultPath()).toBe(path.join('C:\\E2E\\ud', 'faConfigExport.faconfig'))
  expect(getFaProgramConfigImportOpenDefaultPath()).toBe('C:\\E2E\\ud')
})
