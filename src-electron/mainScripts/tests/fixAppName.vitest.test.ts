import { test, expect, vi, beforeEach, afterEach } from 'vitest'
import { determineAppName, fixAppName } from '../fixAppName'
import packageJSON from '../../../package.json' assert {type: 'json'}
import path from 'path'

const { appMock } = vi.hoisted(() => {
  return {
    appMock: {
      setName: vi.fn(),
      getPath: vi.fn(() => 'C:/Users/test/AppData/Roaming'),
      setPath: vi.fn()
    }
  }
})

vi.mock('electron', () => {
  return {
    app: appMock
  }
})

beforeEach(() => {
  appMock.setName.mockReset()
  appMock.getPath.mockClear()
  appMock.setPath.mockReset()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

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
 * Test app name and userData path assignment.
 */
test('Test fixing app name properly', () => {
  vi.stubEnv('DEBUGGING', 'DEBUGGING')
  fixAppName()

  expect(appMock.setName).toHaveBeenCalledWith(`${packageJSON.name}-dev`)
  expect(appMock.getPath).toHaveBeenCalledWith('appData')
  expect(appMock.setPath).toHaveBeenCalledWith(
    'userData',
    path.join('C:/Users/test/AppData/Roaming', `${packageJSON.name}-dev`)
  )
})

/**
 * fixAppName
 * Debugging off uses package name without -dev for setName and userData folder.
 */
test('Test that fixAppName uses package name without dev suffix when debugging is off', () => {
  vi.stubEnv('DEBUGGING', undefined)
  fixAppName()

  expect(appMock.setName).toHaveBeenCalledWith(packageJSON.name)
  expect(appMock.getPath).toHaveBeenCalledWith('appData')
  expect(appMock.setPath).toHaveBeenCalledWith(
    'userData',
    path.join('C:/Users/test/AppData/Roaming', packageJSON.name)
  )
})
