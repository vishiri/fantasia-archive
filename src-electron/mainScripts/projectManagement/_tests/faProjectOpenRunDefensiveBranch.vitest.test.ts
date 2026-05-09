import { expect, test, vi } from 'vitest'

const resolveMock = vi.hoisted(() => vi.fn())

vi.mock('../faProjectOpenResolveTargetPath', () => {
  return {
    resolveFaProjectOpenTargetPath: (...args: unknown[]) => resolveMock(...args)
  }
})

vi.mock('../faRecentProjectListRuntime', () => {
  return {
    recordRecentProjectEntry: vi.fn(),
    removeRecentProjectEntryByPath: vi.fn()
  }
})

import { runFaProjectOpenFromIpc } from '../faProjectOpenRun'

test('Test that runFaProjectOpenFromIpc surfaces error when resolve omits filePath', async () => {
  resolveMock.mockResolvedValueOnce({ ipcExplicitPath: false })
  const r = await runFaProjectOpenFromIpc({} as never, {})
  expect(r).toMatchObject({
    errorMessage: 'Unable to resolve project file to open',
    errorName: 'FileError',
    outcome: 'error'
  })
})
