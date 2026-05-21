import { expect, test, vi } from 'vitest'

import * as faActionManagerRun from 'app/src/scripts/actionManager/faActionManagerRun'

import { errorNotFoundResumeCurrentProjectClick } from '../errorNotFoundResumeCurrentProject'

/**
 * errorNotFoundResumeCurrentProjectClick
 * Dispatches loadExistingProject for the active session path.
 */
test('Test that errorNotFoundResumeCurrentProjectClick dispatches loadExistingProject', () => {
  const runFaActionMock = vi.spyOn(faActionManagerRun, 'runFaAction').mockImplementation(() => undefined)

  errorNotFoundResumeCurrentProjectClick('C:\\Projects\\demo.faproject')
  expect(runFaActionMock).toHaveBeenCalledWith('loadExistingProject', {
    filePath: 'C:\\Projects\\demo.faproject'
  })

  runFaActionMock.mockRestore()
})

/**
 * errorNotFoundResumeCurrentProjectClick
 * Ignores empty or missing paths.
 */
test('Test that errorNotFoundResumeCurrentProjectClick skips when path is empty', () => {
  const runFaActionMock = vi.spyOn(faActionManagerRun, 'runFaAction').mockImplementation(() => undefined)

  errorNotFoundResumeCurrentProjectClick(undefined)
  errorNotFoundResumeCurrentProjectClick('   ')
  expect(runFaActionMock).not.toHaveBeenCalled()

  runFaActionMock.mockRestore()
})
