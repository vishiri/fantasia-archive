import { afterEach, beforeEach, expect, test } from 'vitest'

import {
  FA_E2E_GLOBAL_SET_NEXT_PROJECT_CREATE_PATH,
  installFaProjectManagementE2ePathOverrideGlobals,
  takeNextE2eProjectCreatePath
} from '../faProjectManagementE2ePathOverride'

beforeEach(() => {
  delete process.env.TEST_ENV
  delete (globalThis as Record<string, unknown>)[FA_E2E_GLOBAL_SET_NEXT_PROJECT_CREATE_PATH]
})

afterEach(() => {
  delete process.env.TEST_ENV
  delete (globalThis as Record<string, unknown>)[FA_E2E_GLOBAL_SET_NEXT_PROJECT_CREATE_PATH]
})

test('takeNextE2eProjectCreatePath returns null outside e2e', () => {
  expect(takeNextE2eProjectCreatePath()).toBeNull()
})

test('installFaProjectManagementE2ePathOverrideGlobals is a no-op outside e2e', () => {
  process.env.TEST_ENV = 'components'
  installFaProjectManagementE2ePathOverrideGlobals()
  expect(takeNextE2eProjectCreatePath()).toBeNull()
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

test('install clears pending path when leaving e2e mode', () => {
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
