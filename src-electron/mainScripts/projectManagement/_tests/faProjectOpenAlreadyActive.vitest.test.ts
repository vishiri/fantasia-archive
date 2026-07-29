import { beforeEach, expect, test, vi } from 'vitest'

import { FA_PROJECT_OPEN_ERROR_NAME_ALREADY_ACTIVE } from 'app/types/I_faProjectManagementDomain'

import {
  buildFaProjectIdempotentOpenResult,
  FaProjectOpenRejectedAlreadyActiveError
} from '../faProjectOpenAlreadyActiveWiring'

const recordRecentMock = vi.hoisted(() => vi.fn())

vi.mock('../faRecentProjectListRuntimeWiring', () => ({
  recordRecentProjectEntry: recordRecentMock
}))

beforeEach(() => {
  recordRecentMock.mockReset()
})

/**
 * faProjectOpenAlreadyActiveWiring
 * buildFaProjectIdempotentOpenResult returns opened with idempotentReuse when caller supplies a snapshot.
 */
test('Test that buildFaProjectIdempotentOpenResult returns idempotent opened when snapshot exists', () => {
  const rejected = new FaProjectOpenRejectedAlreadyActiveError()
  const r = buildFaProjectIdempotentOpenResult('D:\\pick.faproject', rejected, {
    filePath: 'D:\\active.faproject',
    id: 'uuid-1',
    name: 'Active Name'
  })
  expect(r.outcome).toBe('opened')
  expect(r.idempotentReuse).toBe(true)
  expect(r.project?.filePath).toBe('D:\\active.faproject')
  expect(recordRecentMock).toHaveBeenCalledOnce()
})

/**
 * faProjectOpenAlreadyActiveWiring
 * buildFaProjectIdempotentOpenResult falls back to ProjectAlreadyOpen error when snapshot is missing.
 */
test('Test that buildFaProjectIdempotentOpenResult returns error when snapshot is missing', () => {
  const rejected = new FaProjectOpenRejectedAlreadyActiveError()
  const r = buildFaProjectIdempotentOpenResult('D:\\pick.faproject', rejected, null)
  expect(r.outcome).toBe('error')
  expect(r.errorName).toBe(FA_PROJECT_OPEN_ERROR_NAME_ALREADY_ACTIVE)
  expect(recordRecentMock).not.toHaveBeenCalled()
})

/**
 * faProjectOpenAlreadyActiveWiring
 * buildFaProjectIdempotentOpenResult uses the snapshot filePath supplied by the allowlisted open path.
 */
test('Test that buildFaProjectIdempotentOpenResult records the snapshot filePath from the caller', () => {
  const rejected = new FaProjectOpenRejectedAlreadyActiveError()
  const r = buildFaProjectIdempotentOpenResult('D:\\pick.faproject', rejected, {
    filePath: 'D:\\pick.faproject',
    id: 'uuid-1',
    name: 'Active Name'
  })
  expect(r.outcome).toBe('opened')
  expect(r.project?.filePath).toBe('D:\\pick.faproject')
  expect(recordRecentMock).toHaveBeenCalledWith({
    filePath: 'D:\\pick.faproject',
    name: 'Active Name'
  })
})
