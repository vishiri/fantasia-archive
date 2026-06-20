import { afterEach, beforeEach, expect, test } from 'vitest'

import {
  FA_E2E_GLOBAL_PENDING_PROJECT_CREATE_PATH,
  FA_E2E_GLOBAL_PENDING_PROJECT_OPEN_PATH,
  FA_E2E_GLOBAL_SET_NEXT_PROJECT_CREATE_PATH,
  FA_E2E_GLOBAL_SET_NEXT_PROJECT_OPEN_PATH
} from '../functions/faProjectManagementE2ePathOverride'
import {
  installFaProjectManagementE2ePathOverrideGlobals,
  takeNextE2eProjectCreatePath,
  takeNextE2eProjectOpenPath
} from '../projectManagement_manager'
import { createProjectManagementE2ePathRuntime } from '../projectManagementE2ePathRuntime'

beforeEach(() => {
  delete process.env.TEST_ENV
  const g = globalThis as Record<string, unknown>
  delete g[FA_E2E_GLOBAL_SET_NEXT_PROJECT_CREATE_PATH]
  delete g[FA_E2E_GLOBAL_SET_NEXT_PROJECT_OPEN_PATH]
  delete g[FA_E2E_GLOBAL_PENDING_PROJECT_CREATE_PATH]
  delete g[FA_E2E_GLOBAL_PENDING_PROJECT_OPEN_PATH]
})

afterEach(() => {
  delete process.env.TEST_ENV
  const g = globalThis as Record<string, unknown>
  delete g[FA_E2E_GLOBAL_SET_NEXT_PROJECT_CREATE_PATH]
  delete g[FA_E2E_GLOBAL_SET_NEXT_PROJECT_OPEN_PATH]
  delete g[FA_E2E_GLOBAL_PENDING_PROJECT_CREATE_PATH]
  delete g[FA_E2E_GLOBAL_PENDING_PROJECT_OPEN_PATH]
})

test('takeNextE2eProjectCreatePath returns null outside e2e', () => {
  expect(takeNextE2eProjectCreatePath()).toBeNull()
})

test('installFaProjectManagementE2ePathOverrideGlobals is a no-op outside e2e', () => {
  process.env.TEST_ENV = 'components'
  installFaProjectManagementE2ePathOverrideGlobals()
  expect(takeNextE2eProjectCreatePath()).toBeNull()
  expect(takeNextE2eProjectOpenPath()).toBeNull()
})

test('e2e path override round-trips through global setter', () => {
  process.env.TEST_ENV = 'e2e'
  installFaProjectManagementE2ePathOverrideGlobals()
  const setter = (globalThis as Record<string, unknown>)[FA_E2E_GLOBAL_SET_NEXT_PROJECT_CREATE_PATH]
  expect(typeof setter).toBe('function')
  ;(setter as (p: string) => void)('D:\\e2e\\x.faproject')
  expect(takeNextE2eProjectCreatePath()).toBe('D:\\e2e\\x.faproject')
  expect(takeNextE2eProjectCreatePath()).toBeNull()
})

test('takeNextE2eProjectCreatePath ignores empty pending path', () => {
  process.env.TEST_ENV = 'e2e'
  installFaProjectManagementE2ePathOverrideGlobals()
  const setter = (globalThis as Record<string, unknown>)[FA_E2E_GLOBAL_SET_NEXT_PROJECT_CREATE_PATH] as (
    p: string
  ) => void
  setter('')
  expect(takeNextE2eProjectCreatePath()).toBeNull()
})

test('takeNextE2eProjectOpenPath returns null outside e2e', () => {
  expect(takeNextE2eProjectOpenPath()).toBeNull()
})

test('e2e open path override round-trips through global setter', () => {
  process.env.TEST_ENV = 'e2e'
  installFaProjectManagementE2ePathOverrideGlobals()
  const setter = (globalThis as Record<string, unknown>)[FA_E2E_GLOBAL_SET_NEXT_PROJECT_OPEN_PATH]
  expect(typeof setter).toBe('function')
  ;(setter as (p: string) => void)('D:\\e2e\\open.faproject')
  expect(takeNextE2eProjectOpenPath()).toBe('D:\\e2e\\open.faproject')
  expect(takeNextE2eProjectOpenPath()).toBeNull()
})

test('takeNextE2eProjectOpenPath ignores empty pending path', () => {
  process.env.TEST_ENV = 'e2e'
  installFaProjectManagementE2ePathOverrideGlobals()
  const setter = (globalThis as Record<string, unknown>)[FA_E2E_GLOBAL_SET_NEXT_PROJECT_OPEN_PATH] as (
    p: string
  ) => void
  setter('')
  expect(takeNextE2eProjectOpenPath()).toBeNull()
})

test('install clears pending open path when leaving e2e mode', () => {
  process.env.TEST_ENV = 'e2e'
  installFaProjectManagementE2ePathOverrideGlobals()
  const setter = (globalThis as Record<string, unknown>)[FA_E2E_GLOBAL_SET_NEXT_PROJECT_OPEN_PATH] as (
    p: string
  ) => void
  setter('D:\\e2e\\z.faproject')
  process.env.TEST_ENV = 'components'
  installFaProjectManagementE2ePathOverrideGlobals()
  expect(takeNextE2eProjectOpenPath()).toBeNull()
})

test('install clears pending create path when leaving e2e mode', () => {
  process.env.TEST_ENV = 'e2e'
  installFaProjectManagementE2ePathOverrideGlobals()
  const setter = (globalThis as Record<string, unknown>)[FA_E2E_GLOBAL_SET_NEXT_PROJECT_CREATE_PATH] as (
    p: string
  ) => void
  setter('D:\\e2e\\y.faproject')
  process.env.TEST_ENV = 'components'
  installFaProjectManagementE2ePathOverrideGlobals()
  expect(takeNextE2eProjectCreatePath()).toBeNull()
})

test('e2e pending create path round-trips across separate runtime instances', () => {
  process.env.TEST_ENV = 'e2e'
  const runtimeA = createProjectManagementE2ePathRuntime({
    getTestEnv: () => process.env.TEST_ENV
  })
  runtimeA.installFaProjectManagementE2ePathOverrideGlobals()
  const setter = (globalThis as Record<string, unknown>)[FA_E2E_GLOBAL_SET_NEXT_PROJECT_CREATE_PATH] as (
    p: string
  ) => void
  setter('D:\\e2e\\bundle-split.faproject')
  const runtimeB = createProjectManagementE2ePathRuntime({
    getTestEnv: () => process.env.TEST_ENV
  })
  expect(runtimeB.takeNextE2eProjectCreatePath()).toBe('D:\\e2e\\bundle-split.faproject')
})
