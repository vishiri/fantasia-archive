import type Database from 'better-sqlite3'

import { expect, test } from 'vitest'

import { resolveFaProjectDocumentPlacementId } from '../faProjectDocumentCreateResolveWiring'

function dbReturning (row: { id: string } | undefined): Database {
  const db = {
    prepare: () => {
      return {
        get: () => row
      }
    }
  }
  return db as unknown as Database
}

/**
 * resolveFaProjectDocumentPlacementId
 * Explicit null stays unplaced even when a template placement exists.
 */
test('Test that resolveFaProjectDocumentPlacementId keeps explicit null unplaced', () => {
  const placementId = resolveFaProjectDocumentPlacementId(
    dbReturning({ id: 'placement-a' }),
    'world-1',
    'tpl-1',
    null
  )
  expect(placementId).toBeNull()
})

/**
 * resolveFaProjectDocumentPlacementId
 * Omitted placement still resolves one template placement row.
 */
test('Test that resolveFaProjectDocumentPlacementId looks up when placement is omitted', () => {
  const placementId = resolveFaProjectDocumentPlacementId(
    dbReturning({ id: 'placement-a' }),
    'world-1',
    'tpl-1',
    undefined
  )
  expect(placementId).toBe('placement-a')
})

/**
 * resolveFaProjectDocumentPlacementId
 * A chosen placement wins over the template lookup.
 */
test('Test that resolveFaProjectDocumentPlacementId keeps an explicit placement id', () => {
  const placementId = resolveFaProjectDocumentPlacementId(
    dbReturning({ id: 'placement-a' }),
    'world-1',
    'tpl-1',
    'placement-b'
  )
  expect(placementId).toBe('placement-b')
})
