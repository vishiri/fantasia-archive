import { beforeEach, expect, test } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import type { I_faActiveProject } from 'app/types/I_faActiveProjectDomain'

import { S_FaActiveProject } from '../S_FaActiveProject'

let store: ReturnType<typeof S_FaActiveProject>

beforeEach(() => {
  setActivePinia(createPinia())
  store = S_FaActiveProject()
})

/**
 * S_FaActiveProject
 * Default session state has no loaded project.
 */
test('Test that S_FaActiveProject starts with null activeProject and hasActiveProject false', () => {
  expect(store.activeProject).toBeNull()
  expect(store.hasActiveProject).toBe(false)
})

/**
 * S_FaActiveProject / setActiveProject
 * Persists the open project snapshot for the session.
 */
test('Test that setActiveProject assigns activeProject and sets hasActiveProject true', () => {
  const payload: I_faActiveProject = {
    id: 'proj-1',
    name: 'My world'
  }

  store.setActiveProject(payload)

  expect(store.activeProject).toEqual(payload)
  expect(store.hasActiveProject).toBe(true)
})

/**
 * S_FaActiveProject / setActiveProject
 * Replaces a previously active project.
 */
test('Test that setActiveProject replaces an existing active project', () => {
  store.setActiveProject({
    id: 'first',
    name: 'First'
  })

  const second: I_faActiveProject = {
    id: 'second',
    name: 'Second'
  }

  store.setActiveProject(second)

  expect(store.activeProject).toEqual(second)
})

/**
 * S_FaActiveProject / clearActiveProject
 * Returns to the no-project session state.
 */
test('Test that clearActiveProject clears activeProject and hasActiveProject', () => {
  store.setActiveProject({
    id: 'proj-clear',
    name: 'Temp'
  })

  expect(store.hasActiveProject).toBe(true)

  store.clearActiveProject()

  expect(store.activeProject).toBeNull()
  expect(store.hasActiveProject).toBe(false)
})
