import { beforeEach, expect, test, vi } from 'vitest'

import { FA_PROJECT_OPEN_ERROR_NAME_ALREADY_ACTIVE } from 'app/types/I_faProjectManagementDomain'

import {
  buildFaProjectIdempotentOpenResult,
  FaProjectOpenRejectedAlreadyActiveError
} from '../faProjectOpenAlreadyActiveWiring'

const getActiveDbMock = vi.hoisted(() => vi.fn())
const getLastKnownPathMock = vi.hoisted(() => vi.fn())
const readUuidMock = vi.hoisted(() => vi.fn())
const readNameMock = vi.hoisted(() => vi.fn())
const recordRecentMock = vi.hoisted(() => vi.fn())

vi.mock('../faProjectActiveDatabaseWiring', () => ({
  getFaProjectActiveDatabase: getActiveDbMock,
  getFaProjectLastKnownActiveProjectFilePath: getLastKnownPathMock
}))

vi.mock('../faProjectDbMigrateWiring', () => ({
  readFaProjectStoredDisplayName: readNameMock,
  readFaProjectStoredProjectUuid: readUuidMock
}))

vi.mock('../faRecentProjectListRuntimeWiring', () => ({
  recordRecentProjectEntry: recordRecentMock
}))

beforeEach(() => {
  getActiveDbMock.mockReset()
  getLastKnownPathMock.mockReset()
  readUuidMock.mockReset()
  readNameMock.mockReset()
  recordRecentMock.mockReset()
  getActiveDbMock.mockReturnValue({ tag: 'db' })
  getLastKnownPathMock.mockReturnValue('D:\\active.faproject')
  readUuidMock.mockReturnValue('uuid-1')
  readNameMock.mockReturnValue('Active Name')
})

/**
 * faProjectOpenAlreadyActiveWiring
 * buildFaProjectIdempotentOpenResult returns opened with idempotentReuse when main still has a handle.
 */
test('Test that buildFaProjectIdempotentOpenResult returns idempotent opened when active db exists', () => {
  const rejected = new FaProjectOpenRejectedAlreadyActiveError()
  const r = buildFaProjectIdempotentOpenResult('D:\\pick.faproject', rejected)
  expect(r.outcome).toBe('opened')
  expect(r.idempotentReuse).toBe(true)
  expect(r.project?.filePath).toBe('D:\\active.faproject')
  expect(recordRecentMock).toHaveBeenCalledOnce()
})

/**
 * faProjectOpenAlreadyActiveWiring
 * buildFaProjectIdempotentOpenResult falls back to ProjectAlreadyOpen error when handle is missing.
 */
test('Test that buildFaProjectIdempotentOpenResult returns error when active db is missing', () => {
  getActiveDbMock.mockReturnValueOnce(null)
  const rejected = new FaProjectOpenRejectedAlreadyActiveError()
  const r = buildFaProjectIdempotentOpenResult('D:\\pick.faproject', rejected)
  expect(r.outcome).toBe('error')
  expect(r.errorName).toBe(FA_PROJECT_OPEN_ERROR_NAME_ALREADY_ACTIVE)
  expect(recordRecentMock).not.toHaveBeenCalled()
})

/**
 * faProjectOpenAlreadyActiveWiring
 * buildFaProjectIdempotentOpenResult uses the attempted path when main has no mirrored path yet.
 */
test('Test that buildFaProjectIdempotentOpenResult prefers attempted path when mirrored path is empty', () => {
  getLastKnownPathMock.mockReturnValueOnce('')
  const rejected = new FaProjectOpenRejectedAlreadyActiveError()
  const r = buildFaProjectIdempotentOpenResult('D:\\pick.faproject', rejected)
  expect(r.outcome).toBe('opened')
  expect(r.project?.filePath).toBe('D:\\pick.faproject')
})
