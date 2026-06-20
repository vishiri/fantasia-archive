import { afterEach, expect, test, vi } from 'vitest'

import { parseFaProjectManagementE2eStageFilePath } from '../faProjectManagementStageE2ePath'

afterEach(() => {
  vi.unstubAllEnvs()
})

test('parseFaProjectManagementE2eStageFilePath returns null outside e2e', () => {
  vi.stubEnv('TEST_ENV', 'components')
  expect(parseFaProjectManagementE2eStageFilePath(process.env.TEST_ENV, 'D:\\x.faproject')).toBeNull()
})

test('parseFaProjectManagementE2eStageFilePath rejects non-string payloads', () => {
  vi.stubEnv('TEST_ENV', 'e2e')
  expect(parseFaProjectManagementE2eStageFilePath(process.env.TEST_ENV, null)).toBeNull()
  expect(parseFaProjectManagementE2eStageFilePath(process.env.TEST_ENV, 1)).toBeNull()
})

test('parseFaProjectManagementE2eStageFilePath trims and accepts absolute paths in e2e', () => {
  vi.stubEnv('TEST_ENV', 'e2e')
  expect(parseFaProjectManagementE2eStageFilePath(process.env.TEST_ENV, '  D:\\x.faproject  ')).toBe('D:\\x.faproject')
})

test('parseFaProjectManagementE2eStageFilePath rejects empty trimmed strings in e2e', () => {
  vi.stubEnv('TEST_ENV', 'e2e')
  expect(parseFaProjectManagementE2eStageFilePath(process.env.TEST_ENV, '   ')).toBeNull()
})
