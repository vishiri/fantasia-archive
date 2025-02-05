import { vi, expect, test } from 'vitest'
import { extraEnvVariablesAPI } from '../extraEnvVariablesAPI'

/*
Nothing else to test here, rest is trivial assignment
*/

/**
 * extraEnvVariablesAPI
 * ELECTRON_MAIN_FILEPATH
 */
test('Test if extraEnvVariablesAPI is returning correct value - ELECTRON_MAIN_FILEPATH', async () => {
  vi.mock('appRoot', () => { return '' })
  expect(extraEnvVariablesAPI.ELECTRON_MAIN_FILEPATH).toBeTypeOf('string')
  expect(extraEnvVariablesAPI.ELECTRON_MAIN_FILEPATH).toContain('/dist/electron/UnPackaged/electron-main.js')
})
