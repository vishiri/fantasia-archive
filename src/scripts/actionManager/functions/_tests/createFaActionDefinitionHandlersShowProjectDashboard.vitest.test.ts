import { beforeEach, expect, test, vi } from 'vitest'

import { createFaActionDefinitionHandlersShowProjectDashboard } from '../createFaActionDefinitionHandlersShowProjectDashboard'

const navigateToWorkspaceRouteForActiveProjectMock = vi.fn(async () => undefined)

const S_FaActiveProjectMock = vi.fn(() => ({
  hasActiveProject: true
}))

beforeEach(() => {
  navigateToWorkspaceRouteForActiveProjectMock.mockClear()
  S_FaActiveProjectMock.mockReset()
  S_FaActiveProjectMock.mockReturnValue({ hasActiveProject: true })
})

/**
 * showProjectDashboard action navigates to the workspace home route when a project is active.
 */
test('Test that handleShowProjectDashboard navigates when hasActiveProject is true', async () => {
  const { handleShowProjectDashboard } = createFaActionDefinitionHandlersShowProjectDashboard({
    S_FaActiveProject: S_FaActiveProjectMock,
    navigateToWorkspaceRouteForActiveProject: navigateToWorkspaceRouteForActiveProjectMock
  })

  await handleShowProjectDashboard()

  expect(navigateToWorkspaceRouteForActiveProjectMock).toHaveBeenCalledOnce()
})

/**
 * showProjectDashboard action is a no-op when no project is loaded.
 */
test('Test that handleShowProjectDashboard skips navigation without an active project', async () => {
  S_FaActiveProjectMock.mockReturnValue({ hasActiveProject: false })

  const { handleShowProjectDashboard } = createFaActionDefinitionHandlersShowProjectDashboard({
    S_FaActiveProject: S_FaActiveProjectMock,
    navigateToWorkspaceRouteForActiveProject: navigateToWorkspaceRouteForActiveProjectMock
  })

  await handleShowProjectDashboard()

  expect(navigateToWorkspaceRouteForActiveProjectMock).not.toHaveBeenCalled()
})
