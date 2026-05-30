import { beforeEach, expect, test, vi } from 'vitest'

const runFaActionAwaitMock = vi.hoisted(() => {
  return vi.fn()
})

const refreshRecentProjectsMock = vi.hoisted(() => {
  return vi.fn()
})

const notifyMissingMock = vi.hoisted(() => {
  return vi.fn()
})

const resolveRecentProjectMruHeadForOpenMock = vi.hoisted(() => {
  return vi.fn()
})

const activeProjectRef = vi.hoisted(() => {
  return {
    value: null as { filePath: string } | null
  }
})

const hasWelcomeScreenAutoLoadMruHeadFailedMock = vi.hoisted(() => {
  return vi.fn(() => {
    return false
  })
})

const markWelcomeScreenAutoLoadMruHeadFailedMock = vi.hoisted(() => {
  return vi.fn()
})

const navigateToWorkspaceRouteForActiveProjectMock = vi.hoisted(() => {
  return vi.fn()
})

vi.mock('quasar', () => ({
  Notify: {
    create: vi.fn()
  }
}))

vi.mock('app/src/scripts/actionManager/faActionManagerRun_manager', () => ({
  runFaActionAwait: runFaActionAwaitMock
}))

vi.mock('app/src/stores/S_FaRecentProjects', () => {
  return {
    S_FaRecentProjects: () => {
      return {
        refreshRecentProjects: refreshRecentProjectsMock
      }
    }
  }
})

vi.mock('app/src/stores/S_FaActiveProject', () => {
  return {
    S_FaActiveProject: () => {
      return {
        get activeProject () {
          return activeProjectRef.value
        }
      }
    }
  }
})

vi.mock('../faWelcomeScreenRecentProjectNotify_manager', () => {
  return {
    notifyWelcomeScreenRecentProjectFileMissing: notifyMissingMock
  }
})

vi.mock('../functions/faWelcomeScreenAutoLoadSession', () => {
  return {
    hasWelcomeScreenAutoLoadMruHeadFailed: hasWelcomeScreenAutoLoadMruHeadFailedMock,
    markWelcomeScreenAutoLoadMruHeadFailed: markWelcomeScreenAutoLoadMruHeadFailedMock
  }
})

vi.mock('app/src/scripts/appInternals/appInternals_manager', () => ({
  applyFaUserSettingsLanguageSelection: vi.fn(async () => true),
  navigateToWorkspaceRouteForActiveProject: navigateToWorkspaceRouteForActiveProjectMock
}))

import {
  openWelcomeScreenAutoLoadProject,
  resolveWelcomeScreenAutoLoadTarget
} from '../faWelcomeScreenAutoLoadProject_manager'

function assignFaContentBridgeApis (apis: unknown): void {
  vi.stubGlobal('window', {
    faContentBridgeAPIs: apis
  })
}

beforeEach(() => {
  runFaActionAwaitMock.mockReset()
  refreshRecentProjectsMock.mockReset()
  notifyMissingMock.mockReset()
  hasWelcomeScreenAutoLoadMruHeadFailedMock.mockReset()
  hasWelcomeScreenAutoLoadMruHeadFailedMock.mockReturnValue(false)
  markWelcomeScreenAutoLoadMruHeadFailedMock.mockReset()
  navigateToWorkspaceRouteForActiveProjectMock.mockReset()
  navigateToWorkspaceRouteForActiveProjectMock.mockResolvedValue(undefined)
  resolveRecentProjectMruHeadForOpenMock.mockReset()
  activeProjectRef.value = null
  runFaActionAwaitMock.mockResolvedValue(true)
  refreshRecentProjectsMock.mockResolvedValue(undefined)
  assignFaContentBridgeApis({
    projectManagement: {
      resolveRecentProjectMruHeadForOpen: resolveRecentProjectMruHeadForOpenMock
    }
  })
})

/**
 * openWelcomeScreenAutoLoadProject
 * Shows an error and does not open the next recent row when the MRU head file is missing.
 */
test('Test that openWelcomeScreenAutoLoadProject notifies and skips load when MRU head is missing', async () => {
  resolveRecentProjectMruHeadForOpenMock.mockResolvedValueOnce({
    attemptedEntry: {
      filePath: 'C:\\gone\\latest.faproject',
      name: 'Gone'
    },
    outcome: 'missing'
  })

  await expect(openWelcomeScreenAutoLoadProject()).resolves.toBe(false)

  expect(markWelcomeScreenAutoLoadMruHeadFailedMock).toHaveBeenCalled()
  expect(notifyMissingMock).toHaveBeenCalledWith('Gone')
  expect(refreshRecentProjectsMock).toHaveBeenCalled()
  expect(runFaActionAwaitMock).not.toHaveBeenCalled()
})

/**
 * openWelcomeScreenAutoLoadProject
 * Opens only the MRU head path returned as ready.
 */
test('Test that openWelcomeScreenAutoLoadProject loads MRU head when ready', async () => {
  resolveRecentProjectMruHeadForOpenMock.mockResolvedValueOnce({
    entry: {
      filePath: 'C:\\data\\latest.faproject',
      name: 'Latest'
    },
    outcome: 'ready'
  })

  await expect(openWelcomeScreenAutoLoadProject()).resolves.toBe(true)

  expect(runFaActionAwaitMock).toHaveBeenCalledWith('loadExistingProject', {
    filePath: 'C:\\data\\latest.faproject',
    resumeActiveSession: true
  })
  expect(navigateToWorkspaceRouteForActiveProjectMock).toHaveBeenCalledTimes(1)
})

/**
 * openWelcomeScreenAutoLoadProject
 * Skips automatic retry after MRU head was already missing this session.
 */
test('Test that openWelcomeScreenAutoLoadProject automatic invocation stops after MRU head failure', async () => {
  hasWelcomeScreenAutoLoadMruHeadFailedMock.mockReturnValue(true)
  resolveRecentProjectMruHeadForOpenMock.mockResolvedValueOnce({
    entry: {
      filePath: 'C:\\data\\next.faproject',
      name: 'Next'
    },
    outcome: 'ready'
  })

  await expect(openWelcomeScreenAutoLoadProject({
    invocation: 'automatic'
  })).resolves.toBe(false)

  expect(resolveRecentProjectMruHeadForOpenMock).not.toHaveBeenCalled()
  expect(runFaActionAwaitMock).not.toHaveBeenCalled()
})

/**
 * resolveWelcomeScreenAutoLoadTarget
 * Prefers the active session path over MRU resolution.
 */
test('Test that resolveWelcomeScreenAutoLoadTarget prefers active session over MRU head', async () => {
  activeProjectRef.value = {
    filePath: 'C:\\data\\current.faproject'
  }

  await expect(resolveWelcomeScreenAutoLoadTarget()).resolves.toEqual({
    filePath: 'C:\\data\\current.faproject',
    kind: 'activeSession'
  })
  expect(resolveRecentProjectMruHeadForOpenMock).not.toHaveBeenCalled()
})

/**
 * resolveWelcomeScreenAutoLoadTarget
 * Returns none when project management MRU resolve is unavailable.
 */
test('Test that resolveWelcomeScreenAutoLoadTarget returns none without MRU resolve bridge', async () => {
  assignFaContentBridgeApis({
    projectManagement: {}
  })

  await expect(resolveWelcomeScreenAutoLoadTarget()).resolves.toEqual({ kind: 'none' })
})

/**
 * resolveWelcomeScreenAutoLoadTarget
 * Returns none when MRU resolve reports an empty list.
 */
test('Test that resolveWelcomeScreenAutoLoadTarget returns none when MRU head is empty', async () => {
  resolveRecentProjectMruHeadForOpenMock.mockResolvedValueOnce({ outcome: 'empty' })

  await expect(resolveWelcomeScreenAutoLoadTarget()).resolves.toEqual({ kind: 'none' })
})

/**
 * openWelcomeScreenAutoLoadProject
 * Returns false when no auto-load target resolves.
 */
test('Test that openWelcomeScreenAutoLoadProject returns false when target is none', async () => {
  resolveRecentProjectMruHeadForOpenMock.mockResolvedValueOnce({ outcome: 'empty' })

  await expect(openWelcomeScreenAutoLoadProject()).resolves.toBe(false)
  expect(runFaActionAwaitMock).not.toHaveBeenCalled()
})

/**
 * openWelcomeScreenAutoLoadProject
 * Returns false when loadExistingProject action fails.
 */
test('Test that openWelcomeScreenAutoLoadProject returns false when load action fails', async () => {
  resolveRecentProjectMruHeadForOpenMock.mockResolvedValueOnce({
    entry: {
      filePath: 'C:\\data\\latest.faproject',
      name: 'Latest'
    },
    outcome: 'ready'
  })
  runFaActionAwaitMock.mockResolvedValueOnce(false)

  await expect(openWelcomeScreenAutoLoadProject()).resolves.toBe(false)
  expect(navigateToWorkspaceRouteForActiveProjectMock).not.toHaveBeenCalled()
})
