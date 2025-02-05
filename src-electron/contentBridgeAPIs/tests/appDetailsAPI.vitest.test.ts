import { vi, expect, test } from 'vitest'
import { appDetailsAPI } from '../appDetailsAPI'

/**
 * appDetailsAPI
 * PROJECT_VERSION
 */
test('Test if appDetailsAPI is returning correct value - PROJECT_VERSION', () => {
  vi.mock('@electron/remote', () => {
    return { app: { getVersion: () => '1.0.0' } }
  })

  expect(appDetailsAPI.PROJECT_VERSION).toBeTypeOf('string')
  expect(appDetailsAPI.PROJECT_VERSION).toBe('1.0.0')
})
