import { afterEach, expect, test, vi } from 'vitest'

import {
  FA_E2E_GLOBAL_SET_NEXT_EXPORT_PATH,
  FA_E2E_GLOBAL_SET_NEXT_IMPORT_PATH,
  installFaAppConfigE2ePathOverrideGlobals,
  stageFaAppConfigE2eExportPath,
  stageFaAppConfigE2eImportPath,
  takeNextE2eAppConfigImportPath,
  takeNextE2eAppConfigExportPath
} from '../faAppConfigE2ePathOverrideWiring'

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
  installFaAppConfigE2ePathOverrideGlobals()
  const g = globalThis as { [k: string]: unknown }
  expect(g[FA_E2E_GLOBAL_SET_NEXT_EXPORT_PATH]).toBeUndefined()
  expect(takeNextE2eAppConfigExportPath()).toBeNull()
  expect(takeNextE2eAppConfigImportPath()).toBeNull()
})

test('E2E exports: globals register and take returns then clears the path', () => {
  vi.stubEnv('TEST_ENV', 'e2e')
  installFaAppConfigE2ePathOverrideGlobals()
  const g = globalThis as {
    [FA_E2E_GLOBAL_SET_NEXT_EXPORT_PATH]?: (p: string) => void
  }
  g[FA_E2E_GLOBAL_SET_NEXT_EXPORT_PATH]?.('C:\\tmp\\a.faconfig')
  expect(takeNextE2eAppConfigExportPath()).toBe('C:\\tmp\\a.faconfig')
  expect(takeNextE2eAppConfigExportPath()).toBeNull()
})

test('E2E import path take clears pending value', () => {
  vi.stubEnv('TEST_ENV', 'e2e')
  installFaAppConfigE2ePathOverrideGlobals()
  const g = globalThis as {
    [FA_E2E_GLOBAL_SET_NEXT_IMPORT_PATH]?: (p: string) => void
  }
  g[FA_E2E_GLOBAL_SET_NEXT_IMPORT_PATH]?.('C:\\tmp\\b.faconfig')
  expect(takeNextE2eAppConfigImportPath()).toBe('C:\\tmp\\b.faconfig')
  expect(takeNextE2eAppConfigImportPath()).toBeNull()
})

test('E2E take ignores empty string after set', () => {
  vi.stubEnv('TEST_ENV', 'e2e')
  installFaAppConfigE2ePathOverrideGlobals()
  const g = globalThis as {
    [FA_E2E_GLOBAL_SET_NEXT_EXPORT_PATH]?: (p: string) => void
  }
  g[FA_E2E_GLOBAL_SET_NEXT_EXPORT_PATH]?.('')
  expect(takeNextE2eAppConfigExportPath()).toBeNull()
})

test('stageFaAppConfigE2eExportPath returns false outside e2e', () => {
  vi.stubEnv('TEST_ENV', 'components')
  expect(stageFaAppConfigE2eExportPath('C:\\tmp\\a.faconfig')).toBe(false)
})

test('stageFaAppConfigE2eExportPath stages export path in e2e', () => {
  vi.stubEnv('TEST_ENV', 'e2e')
  expect(stageFaAppConfigE2eExportPath('C:\\tmp\\a.faconfig')).toBe(true)
  expect(takeNextE2eAppConfigExportPath()).toBe('C:\\tmp\\a.faconfig')
})

test('stageFaAppConfigE2eImportPath rejects invalid payloads in e2e', () => {
  vi.stubEnv('TEST_ENV', 'e2e')
  expect(stageFaAppConfigE2eImportPath(null)).toBe(false)
  expect(stageFaAppConfigE2eImportPath('   ')).toBe(false)
})

test('stageFaAppConfigE2eImportPath stages import path in e2e', () => {
  vi.stubEnv('TEST_ENV', 'e2e')
  expect(stageFaAppConfigE2eImportPath('C:\\tmp\\b.faconfig')).toBe(true)
  expect(takeNextE2eAppConfigImportPath()).toBe('C:\\tmp\\b.faconfig')
})
