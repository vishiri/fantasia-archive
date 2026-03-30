import { vi, expect, test } from 'vitest'

const { getVersionMock } = vi.hoisted(() => {
  return {
    getVersionMock: vi.fn(() => '1.0.0')
  }
})

vi.mock('@electron/remote', () => {
  return {
    app: {
      getVersion: () => getVersionMock()
    }
  }
})

import { appDetailsAPI } from '../appDetailsAPI'

/**
 * appDetailsAPI
 * PROJECT_VERSION reflects app.getVersion() at module load (mocked remote).
 */
test('Test if appDetailsAPI is returning correct value - PROJECT_VERSION', () => {
  expect(appDetailsAPI.PROJECT_VERSION).toBeTypeOf('string')
  expect(appDetailsAPI.PROJECT_VERSION).toBe('1.0.0')
})

/**
 * appDetailsAPI
 * Fresh module load picks up a new mocked version after resetModules.
 */
test('Test if appDetailsAPI PROJECT_VERSION follows getVersion on re-import', async () => {
  getVersionMock.mockReturnValueOnce('9.8.7')
  vi.resetModules()
  const { appDetailsAPI: reloaded } = await import('../appDetailsAPI')
  expect(reloaded.PROJECT_VERSION).toBe('9.8.7')
})
