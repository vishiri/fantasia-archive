import { expect, test } from 'vitest'

import type { I_faActiveProject } from 'app/types/I_faActiveProjectDomain'

import {
  buildFaActiveProjectFromBridgeProject,
  coerceFaActiveProjectCreateUserOutcome,
  coerceFaActiveProjectOpenUserOutcome,
  patchFaActiveProjectDisplayName
} from '../faActiveProjectSnapshot'

const sample: I_faActiveProject = {
  filePath: 'C:\\p\\a.faproject',
  id: 'proj-1',
  name: 'Before'
}

/**
 * patchFaActiveProjectDisplayName
 * Returns null when no project is active; otherwise copies with a new name.
 */
test('Test that patchFaActiveProjectDisplayName updates name or returns null', () => {
  expect(patchFaActiveProjectDisplayName(null, 'After')).toBeNull()
  expect(patchFaActiveProjectDisplayName(sample, 'After')).toEqual({
    ...sample,
    name: 'After'
  })
})

/**
 * buildFaActiveProjectFromBridgeProject
 * Maps bridge project fields into the session snapshot.
 */
test('Test that buildFaActiveProjectFromBridgeProject copies bridge fields', () => {
  expect(buildFaActiveProjectFromBridgeProject({
    filePath: 'C:\\new.faproject',
    id: 'id-2',
    name: 'New'
  })).toEqual({
    filePath: 'C:\\new.faproject',
    id: 'id-2',
    name: 'New'
  })
})

test('Test that coerceFaActiveProjectCreateUserOutcome maps open results to canceled', () => {
  expect(coerceFaActiveProjectCreateUserOutcome('opened')).toBe('canceled')
  expect(coerceFaActiveProjectCreateUserOutcome('reused')).toBe('canceled')
  expect(coerceFaActiveProjectCreateUserOutcome('created')).toBe('created')
  expect(coerceFaActiveProjectCreateUserOutcome('superseded')).toBe('superseded')
})

test('Test that coerceFaActiveProjectOpenUserOutcome maps created to canceled', () => {
  expect(coerceFaActiveProjectOpenUserOutcome('created')).toBe('canceled')
  expect(coerceFaActiveProjectOpenUserOutcome('opened')).toBe('opened')
  expect(coerceFaActiveProjectOpenUserOutcome('reused')).toBe('reused')
})
