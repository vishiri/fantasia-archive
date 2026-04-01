import { vi, expect, test, afterEach } from 'vitest'

vi.mock('app-root-path', () => {
  return {
    default: '/mocked/app/root'
  }
})

import { extraEnvVariablesAPI } from '../extraEnvVariablesAPI'

afterEach(() => {
  vi.unstubAllEnvs()
})

/**
 * extraEnvVariablesAPI
 * ELECTRON_MAIN_FILEPATH uses app-root-path (mocked) and expected suffix.
 */
test('Test if extraEnvVariablesAPI is returning correct value - ELECTRON_MAIN_FILEPATH', () => {
  expect(extraEnvVariablesAPI.ELECTRON_MAIN_FILEPATH).toBeTypeOf('string')
  expect(extraEnvVariablesAPI.ELECTRON_MAIN_FILEPATH).toBe(
    '/mocked/app/root/dist/electron/UnPackaged/electron-main.js'
  )
})

/**
 * extraEnvVariablesAPI
 * FA_FRONTEND_RENDER_TIMER default.
 */
test('Test if extraEnvVariablesAPI FA_FRONTEND_RENDER_TIMER is 3000', () => {
  expect(extraEnvVariablesAPI.FA_FRONTEND_RENDER_TIMER).toBe(3000)
})

/**
 * extraEnvVariablesAPI
 * TEST_ENV and COMPONENT_NAME are false when env vars are unset after re-import.
 */
test('Test if extraEnvVariablesAPI omits optional env when not set on re-import', async () => {
  vi.resetModules()
  vi.unstubAllEnvs()
  const { extraEnvVariablesAPI: api } = await import('../extraEnvVariablesAPI')
  expect(api.TEST_ENV).toBe(false)
  expect(api.COMPONENT_NAME).toBe(false)
  expect(api.COMPONENT_PROPS).toBe(false)
})

/**
 * extraEnvVariablesAPI
 * TEST_ENV and COMPONENT_NAME reflect process.env after resetModules + stub.
 */
test('Test if extraEnvVariablesAPI reads TEST_ENV and COMPONENT_NAME when set', async () => {
  vi.resetModules()
  vi.stubEnv('TEST_ENV', 'components')
  vi.stubEnv('COMPONENT_NAME', 'MyComponent')
  const { extraEnvVariablesAPI: api } = await import('../extraEnvVariablesAPI')
  expect(api.TEST_ENV).toBe('components')
  expect(api.COMPONENT_NAME).toBe('MyComponent')
  expect(api.COMPONENT_PROPS).toBe(false)
})

/**
 * extraEnvVariablesAPI
 * COMPONENT_PROPS parses valid JSON from env.
 */
test('Test if extraEnvVariablesAPI parses COMPONENT_PROPS when JSON is valid', async () => {
  vi.resetModules()
  vi.stubEnv('COMPONENT_PROPS', '{"a":1,"b":"two"}')
  const { extraEnvVariablesAPI: api } = await import('../extraEnvVariablesAPI')
  expect(api.COMPONENT_PROPS).toEqual({ a: 1, b: 'two' })
})

/**
 * extraEnvVariablesAPI
 * Invalid COMPONENT_PROPS causes JSON.parse to throw at import time.
 */
test('Test if extraEnvVariablesAPI import throws when COMPONENT_PROPS JSON is invalid', async () => {
  vi.resetModules()
  vi.stubEnv('COMPONENT_PROPS', 'not-valid-json{')
  await expect(import('../extraEnvVariablesAPI')).rejects.toThrow()
})
