import { beforeEach, expect, test, vi } from 'vitest'

const { runFaActionMock } = vi.hoisted(() => ({
  runFaActionMock: vi.fn()
}))

vi.mock('app/src/scripts/actionManager/faActionManagerRun', () => ({
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
 * New project dispatches the open dialog action from the first row trigger.
 */
test('Test that buildProjectMenu new project row opens the settings dialog action', () => {
  const menu = buildProjectMenu(emptyRecentSession(false))
  const items = menu.data.filter((row) => row.mode === 'item')
  items[0]!.trigger?.()
  expect(runFaActionMock).toHaveBeenCalledTimes(1)
  expect(runFaActionMock).toHaveBeenCalledWith('openNewProjectDialog', undefined)
})

/**
 * Project menu
 * Load project dispatches the load action from the load row trigger.
 */
test('Test that buildProjectMenu load project row dispatches loadExistingProject', () => {
  const menu = buildProjectMenu(emptyRecentSession(false))
  const items = menu.data.filter((row) => row.mode === 'item')
  items[2]!.trigger?.()
  expect(runFaActionMock).toHaveBeenCalledWith('loadExistingProject', {})
})

/**
 * Project menu
 * Rows that require an open project are disabled when `hasActiveProject` is false.
 */
test('Test that buildProjectMenu disables gated rows when hasActiveProject is false', () => {
  const menu = buildProjectMenu(emptyRecentSession(false))
  const items = menu.data.filter((row) => row.mode === 'item')

  expect(items[0]!.conditions).not.toBe(false)
  expect(items[1]!.conditions).toBe(false)
  expect(items[2]!.conditions).not.toBe(false)
  expect(items[3]!.conditions).toBe(false)
  expect(items[4]!.conditions).toBe(false)
  expect(items[5]!.conditions).toBe(false)
  expect(items[6]!.conditions).toBe(false)
  expect(items[7]!.conditions).toBe(false)
  expect(items[8]!.conditions).not.toBe(false)

  const sub = items[8]!.submenu?.filter((row) => row.mode === 'item') ?? []
  expect(sub[0]!.conditions).toBe(false)
  expect(sub[1]!.conditions).not.toBe(false)
})

/**
 * Project menu
 * Gated rows enable when a project is active.
 */
test('Test that buildProjectMenu enables gated rows when hasActiveProject is true', () => {
  const menu = buildProjectMenu(emptyRecentSession(true))
  const items = menu.data.filter((row) => row.mode === 'item')

  expect(items[0]!.conditions).not.toBe(false)
  expect(items[1]!.conditions).not.toBe(false)
  expect(items[2]!.conditions).not.toBe(false)
  expect(items[3]!.conditions).toBe(false)
  expect(items[4]!.conditions).not.toBe(false)
  expect(items[5]!.conditions).not.toBe(false)
  expect(items[6]!.conditions).not.toBe(false)
  expect(items[7]!.conditions).not.toBe(false)
  expect(items[8]!.conditions).not.toBe(false)
  const sub = items[8]!.submenu?.filter((row) => row.mode === 'item') ?? []
  expect(sub.every((row) => row.conditions !== false)).toBe(true)
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
  const recentParent = items[3]
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
  const recentParent = items[3]
  expect(recentParent?.conditions).toBe(false)
  expect(recentParent?.submenu).toBeUndefined()
  expect(recentParent?.icon).toBe('keyboard_arrow_right')
  expect(recentParent?.specialColor).toBe('grey')
})

/**
 * Documents menu
 * Document actions require an open project.
 */
test('Test that buildDocumentsMenu disables all document actions when hasActiveProject is false', () => {
  const menu = buildDocumentsMenu({ hasActiveProject: false })
  const items = menu.data.filter((row) => row.mode === 'item')
  expect(items.length).toBe(3)
  expect(items.every((row) => row.conditions === false)).toBe(true)
})

/**
 * Tools menu
 * Toggle hierarchical tree requires an open project; other tools stay available.
 */
test('Test that buildToolsMenu disables only toggle tree when hasActiveProject is false', () => {
  const menu = buildToolsMenu({ hasActiveProject: false })
  const items = menu.data.filter((row) => row.mode === 'item')

  expect(items[0]!.conditions).toBe(false)
  expect(items.slice(1).every((row) => row.conditions !== false)).toBe(true)
})
