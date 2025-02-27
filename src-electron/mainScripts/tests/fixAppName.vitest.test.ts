import { test, expect, vi } from 'vitest'
import { determineAppName } from '../fixAppName'
import packageJSON from '../../../package.json' assert {type: 'json'}

/**
 * determineAppName
 * Debugging on
 */
test('Test determing of the app name with debugging on', () => {
  vi.stubEnv('DEBUGGING', 'DEBUGGING')
  expect(determineAppName()).toBe(`${packageJSON.name}-dev`)
})

/**
 * determineAppName
 * Debugging off
 */
test('Test determing of the app name with debugging off', () => {
  vi.stubEnv('DEBUGGING', undefined)
  expect(determineAppName()).toBe(packageJSON.name)
})

/**
 * fixAppName
 * We cannot test this function as it requires Electron to be running.
 */
test.skip('Test fixing app name properly')
