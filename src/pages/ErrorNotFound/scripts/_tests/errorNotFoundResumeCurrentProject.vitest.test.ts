import { expect, test, vi } from 'vitest'

const runFaActionMock = vi.hoisted(() => {
  return vi.fn()
})

vi.mock('app/src/scripts/actionManager/faActionManagerRun_manager', () => {
  return {
    runFaAction: runFaActionMock,
    runFaActionAwait: vi.fn(async () => true)
  }
})

import { errorNotFoundResumeCurrentProjectClick } from '../errorNotFound_manager'

/**
 * errorNotFoundResumeCurrentProjectClick
 * Dispatches loadExistingProject with resumeActiveSession when a path is present.
 */
test('Test that errorNotFoundResumeCurrentProjectClick dispatches loadExistingProject', () => {
  runFaActionMock.mockClear()

  errorNotFoundResumeCurrentProjectClick('C:\\Projects\\demo.faproject')

  expect(runFaActionMock).toHaveBeenCalledWith('loadExistingProject', {
    filePath: 'C:\\Projects\\demo.faproject',
    resumeActiveSession: true
  })
})

/**
 * errorNotFoundResumeCurrentProjectClick
 * No-op when the path is missing or blank.
 */
test('Test that errorNotFoundResumeCurrentProjectClick skips when path is empty', () => {
  runFaActionMock.mockClear()

  errorNotFoundResumeCurrentProjectClick(undefined)
  errorNotFoundResumeCurrentProjectClick('   ')

  expect(runFaActionMock).not.toHaveBeenCalled()
})
