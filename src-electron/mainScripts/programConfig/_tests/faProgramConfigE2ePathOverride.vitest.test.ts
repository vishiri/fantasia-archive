import { afterEach, expect, test, vi } from 'vitest'

import {
  FA_E2E_GLOBAL_SET_NEXT_EXPORT_PATH,
  FA_E2E_GLOBAL_SET_NEXT_IMPORT_PATH,
  installFaProgramConfigE2ePathOverrideGlobals,
  takeNextE2eProgramConfigImportPath,
  takeNextE2eProgramConfigExportPath
} from '../faProgramConfigE2ePathOverride'

const originalTestEnv = process.env.TEST_ENV

afterEach(() => {
  if (originalTestEnv === undefined) {
    delete process.env.TEST_ENV
  } else {
    process.env.TEST_ENV = originalTestEnv
  }
  vi.unstubAllEnvs()
  const g = globalThis as {
    [FA_E2E_GLOBAL_SET_NEXT_EXPORT_PATH]?: unknown
    [FA_E2E_GLOBAL_SET_NEXT_IMPORT_PATH]?: unknown
  }
  delete g[FA_E2E_GLOBAL_SET_NEXT_EXPORT_PATH]
  delete g[FA_E2E_GLOBAL_SET_NEXT_IMPORT_PATH]
})

test('When TEST_ENV is not e2e, take paths are always null and globals do not set handlers', () => {
  vi.stubEnv('TEST_ENV', 'components')
  installFaProgramConfigE2ePathOverrideGlobals()
  const g = globalThis as { [k: string]: unknown }
  expect(g[FA_E2E_GLOBAL_SET_NEXT_EXPORT_PATH]).toBeUndefined()
  expect(takeNextE2eProgramConfigExportPath()).toBeNull()
  expect(takeNextE2eProgramConfigImportPath()).toBeNull()
})

test('E2E exports: globals register and take returns then clears the path', () => {
  vi.stubEnv('TEST_ENV', 'e2e')
  installFaProgramConfigE2ePathOverrideGlobals()
  const g = globalThis as {
    [FA_E2E_GLOBAL_SET_NEXT_EXPORT_PATH]?: (p: string) => void
  }
  g[FA_E2E_GLOBAL_SET_NEXT_EXPORT_PATH]?.('C:\\tmp\\a.faconfig')
  expect(takeNextE2eProgramConfigExportPath()).toBe('C:\\tmp\\a.faconfig')
  expect(takeNextE2eProgramConfigExportPath()).toBeNull()
})

test('E2E import path take clears pending value', () => {
  vi.stubEnv('TEST_ENV', 'e2e')
  installFaProgramConfigE2ePathOverrideGlobals()
  const g = globalThis as {
    [FA_E2E_GLOBAL_SET_NEXT_IMPORT_PATH]?: (p: string) => void
  }
  g[FA_E2E_GLOBAL_SET_NEXT_IMPORT_PATH]?.('C:\\tmp\\b.faconfig')
  expect(takeNextE2eProgramConfigImportPath()).toBe('C:\\tmp\\b.faconfig')
  expect(takeNextE2eProgramConfigImportPath()).toBeNull()
})

test('E2E take ignores empty string after set', () => {
  vi.stubEnv('TEST_ENV', 'e2e')
  installFaProgramConfigE2ePathOverrideGlobals()
  const g = globalThis as {
    [FA_E2E_GLOBAL_SET_NEXT_EXPORT_PATH]?: (p: string) => void
  }
  g[FA_E2E_GLOBAL_SET_NEXT_EXPORT_PATH]?.('')
  expect(takeNextE2eProgramConfigExportPath()).toBeNull()
})
