import { afterEach, expect, test, vi } from 'vitest'

const appMock = vi.hoisted(() => {
  return {
    getPath: vi.fn(() => 'C:/mock/AppData/Roaming'),
    setName: vi.fn(),
    setPath: vi.fn()
  }
})

vi.mock('electron', () => {
  return {
    app: appMock
  }
})

vi.mock('../../../../package.json', () => {
  return {
    default: {
      name: ''
    }
  }
})

import { fixAppName } from '../fixAppName'

afterEach(() => {
  vi.unstubAllEnvs()
})

/**
 * fixAppName
 * When package name is empty, determineAppName is falsy and Electron name or userData paths are not applied.
 */
test('Test that fixAppName skips setName and setPath when package name resolves empty', () => {
  vi.stubEnv('DEBUGGING', undefined)
  fixAppName()

  expect(appMock.setName).not.toHaveBeenCalled()
  expect(appMock.setPath).not.toHaveBeenCalled()
})
