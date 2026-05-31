import { beforeEach, expect, test, vi } from 'vitest'

const { runFaActionMock } = vi.hoisted(() => ({
  runFaActionMock: vi.fn()
}))

vi.mock('app/src/scripts/actionManager/faActionManagerRun_manager', () => ({
  runFaAction: runFaActionMock,
  runFaActionAwait: vi.fn()
}))

import { buildDocumentsMenu } from '../documents'
import { buildProjectMenu } from '../project'
import { buildToolsMenu } from '../tools'

function emptyRecentSession (hasActiveProject: boolean): {
  hasActiveProject: boolean
  recentProjects: readonly []
} {
  return {
    hasActiveProject,
    recentProjects: []
  }
}

beforeEach(() => {
  runFaActionMock.mockClear()
})

/**
 * Menu feed helpers treat `conditions: false` as disabled rows (see AppControlSingleMenu).
 */

/**
 * Project menu
 * Create new project dispatches the open dialog action from the first row trigger.
 */
test('Test that buildProjectMenu create new project row opens the settings dialog action', () => {
  const menu = buildProjectMenu(emptyRecentSession(false))
  const items = menu.data.filter((row) => row.mode === 'item')
  items[0]!.trigger?.()
  expect(runFaActionMock).toHaveBeenCalledTimes(1)
  expect(runFaActionMock).toHaveBeenCalledWith('openNewProjectDialog', undefined)
})

/**
 * Project menu
 * Load existing project dispatches the load action from the load row trigger.
 */
test('Test that buildProjectMenu load existing project row dispatches loadExistingProject', () => {
  const menu = buildProjectMenu(emptyRecentSession(false))
  const items = menu.data.filter((row) => row.mode === 'item')
  items[1]!.trigger?.()
  expect(runFaActionMock).toHaveBeenCalledWith('loadExistingProject', {})
})

test('Test that buildProjectMenu toggle noteboard row dispatches toggleProjectNoteboardWindow', () => {
  const menu = buildProjectMenu(emptyRecentSession(true))
  const items = menu.data.filter((row) => row.mode === 'item')
  items[3]!.trigger?.()
  expect(runFaActionMock).toHaveBeenCalledWith('toggleProjectNoteboardWindow', undefined)
})

test('Test that buildProjectMenu custom Project CSS row dispatches openProjectStylingDialog', () => {
  const menu = buildProjectMenu(emptyRecentSession(true))
  const items = menu.data.filter((row) => row.mode === 'item')
  expect(items[4]!.keybindCommandId).toBe('openProjectStyling')
  items[4]!.trigger?.()
  expect(runFaActionMock).toHaveBeenCalledWith('openProjectStylingDialog', undefined)
})

test('Test that buildProjectMenu show project dashboard row dispatches showProjectDashboard', () => {
  const menu = buildProjectMenu(emptyRecentSession(true))
  const items = menu.data.filter((row) => row.mode === 'item')
  expect(items[5]!.keybindCommandId).toBe('showProjectDashboard')
  items[5]!.trigger?.()
  expect(runFaActionMock).toHaveBeenCalledWith('showProjectDashboard', undefined)
})

test('Test that buildProjectMenu project settings row dispatches openProjectSettingsDialog', () => {
  const menu = buildProjectMenu(emptyRecentSession(true))
  const items = menu.data.filter((row) => row.mode === 'item')
  items[6]!.trigger?.()
  expect(runFaActionMock).toHaveBeenCalledWith('openProjectSettingsDialog', undefined)
})

/**
 * Project menu
 * Implemented project-scoped rows honor hasActiveProject; unimplemented rows stay hidden.
 */
test('Test that buildProjectMenu disables gated rows when hasActiveProject is false', () => {
  const menu = buildProjectMenu(emptyRecentSession(false))
  const items = menu.data.filter((row) => row.mode === 'item')

  expect(items[0]!.conditions).not.toBe(false)
  expect(items[1]!.conditions).not.toBe(false)
  expect(items[2]!.conditions).toBe(false)
  expect(items[3]!.conditions).toBe(false)
  expect(items[4]!.conditions).toBe(false)
  expect(items[5]!.conditions).toBe(false)
  expect(items[6]!.conditions).toBe(false)
  expect(items[7]!.conditions).not.toBe(false)

  const sub = items[7]!.submenu?.filter((row) => row.mode === 'item') ?? []
  expect(sub.every((row) => row.conditions === false)).toBe(true)
})

/**
 * Project menu
 * Implemented gated rows enable when a project is active; unimplemented rows stay hidden.
 */
test('Test that buildProjectMenu enables gated rows when hasActiveProject is true', () => {
  const menu = buildProjectMenu(emptyRecentSession(true))
  const items = menu.data.filter((row) => row.mode === 'item')

  expect(items[0]!.conditions).not.toBe(false)
  expect(items[1]!.conditions).not.toBe(false)
  expect(items[2]!.conditions).toBe(false)
  expect(items[3]!.conditions).not.toBe(false)
  expect(items[4]!.conditions).not.toBe(false)
  expect(items[5]!.conditions).not.toBe(false)
  expect(items[6]!.conditions).not.toBe(false)
  expect(items[7]!.conditions).not.toBe(false)
  const sub = items[7]!.submenu?.filter((row) => row.mode === 'item') ?? []
  expect(sub.every((row) => row.conditions === false)).toBe(true)
})

/**
 * Project menu
 * Recent submenu dispatches load with filePath when entries exist.
 */
test('Test that buildProjectMenu recent row dispatches loadExistingProject with filePath', () => {
  const menu = buildProjectMenu({
    hasActiveProject: false,
    recentProjects: [{
      filePath: 'C:\\x\\a.faproject',
      name: 'Alpha'
    }]
  })
  const items = menu.data.filter((row) => row.mode === 'item')
  const recentParent = items[2]
  expect(recentParent?.conditions).not.toBe(false)
  expect(recentParent?.icon).toBe('keyboard_arrow_right')
  expect(recentParent?.specialColor).toBe('grey')
  expect(recentParent?.submenu?.length).toBe(1)
  const subRow = recentParent?.submenu?.find((r) => r.mode === 'item')
  expect(subRow?.secondaryHintText).toBe('C:\\x\\a.faproject')
  expect(subRow?.icon).toBeUndefined()
  subRow?.trigger?.()
  expect(runFaActionMock).toHaveBeenCalledWith(
    'loadExistingProject',
    {
      filePath: 'C:\\x\\a.faproject'
    }
  )
})

/**
 * Project menu
 * Omitted recentProjects disables load-recent parent with no submenu placeholder.
 */
test('Test that buildProjectMenu treats omitted recentProjects as no recent entries', () => {
  const menu = buildProjectMenu({ hasActiveProject: false })
  const items = menu.data.filter((row) => row.mode === 'item')
  const recentParent = items[2]
  expect(recentParent?.conditions).toBe(false)
  expect(recentParent?.submenu).toBeUndefined()
  expect(recentParent?.icon).toBe('keyboard_arrow_right')
  expect(recentParent?.specialColor).toBe('grey')
})

/**
 * Documents menu
 * Project-scoped rows disable when `hasActiveProject` is false.
 */
test('Test that buildDocumentsMenu disables project-scoped rows when hasActiveProject is false', () => {
  const menu = buildDocumentsMenu({ hasActiveProject: false })
  const items = menu.data.filter((row) => row.mode === 'item')
  expect(items.length).toBe(4)
  expect(items[0]!.conditions).toBe(false)
  expect(items[1]!.conditions).toBe(false)
  expect(items[2]!.conditions).toBe(false)
  expect(items[3]!.conditions).toBe(false)
})

/**
 * Tools menu
 * Import / Export App Configuration fires the centralized action regardless of loaded project session.
 */
test('Test that buildToolsMenu import export row opens the app configuration dialog action', () => {
  const menu = buildToolsMenu({ hasActiveProject: false })
  const items = menu.data.filter((row) => row.mode === 'item')
  items[4]!.trigger?.()
  expect(runFaActionMock).toHaveBeenCalledTimes(1)
  expect(runFaActionMock).toHaveBeenCalledWith('openImportExportAppConfigDialog', undefined)
})

/**
 * Tools menu
 * No project-only gates: five rows stay available when **hasActiveProject** is false.
 */
test('Test that buildToolsMenu keeps all tool rows available when hasActiveProject is false', () => {
  const menu = buildToolsMenu({ hasActiveProject: false })
  const items = menu.data.filter((row) => row.mode === 'item')

  expect(items.length).toBe(5)
  expect(items.every((row) => row.conditions !== false)).toBe(true)
})
