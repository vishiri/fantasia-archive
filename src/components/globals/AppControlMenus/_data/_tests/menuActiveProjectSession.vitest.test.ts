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
  const menu = buildProjectMenu({ hasActiveProject: false })
  const items = menu.data.filter((row) => row.mode === 'item')
  items[0]!.trigger?.()
  expect(runFaActionMock).toHaveBeenCalledTimes(1)
  expect(runFaActionMock).toHaveBeenCalledWith('openNewProjectSettingsDialog', undefined)
})

/**
 * Project menu
 * Rows that require an open project are disabled when `hasActiveProject` is false.
 */
test('Test that buildProjectMenu disables gated rows when hasActiveProject is false', () => {
  const menu = buildProjectMenu({ hasActiveProject: false })
  const items = menu.data.filter((row) => row.mode === 'item')

  expect(items[0]!.conditions).not.toBe(false)
  expect(items[1]!.conditions).toBe(false)
  expect(items[2]!.conditions).not.toBe(false)
  expect(items[3]!.conditions).not.toBe(false)
  expect(items[4]!.conditions).toBe(false)
  expect(items[5]!.conditions).toBe(false)
  expect(items[6]!.conditions).toBe(false)
  expect(items[7]!.conditions).not.toBe(false)

  const sub = items[7]!.submenu?.filter((row) => row.mode === 'item') ?? []
  expect(sub[0]!.conditions).toBe(false)
  expect(sub[1]!.conditions).not.toBe(false)
})

/**
 * Project menu
 * Gated rows enable when a project is active.
 */
test('Test that buildProjectMenu enables gated rows when hasActiveProject is true', () => {
  const menu = buildProjectMenu({ hasActiveProject: true })
  const items = menu.data.filter((row) => row.mode === 'item')

  expect(items.every((row) => row.conditions !== false)).toBe(true)
  const sub = items[7]!.submenu?.filter((row) => row.mode === 'item') ?? []
  expect(sub.every((row) => row.conditions !== false)).toBe(true)
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
