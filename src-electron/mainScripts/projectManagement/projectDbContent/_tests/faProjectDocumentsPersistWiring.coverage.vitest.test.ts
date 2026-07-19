import { beforeEach, expect, test, vi } from 'vitest'

import { FaProjectContentNotFoundError } from '../faProjectContentNotFoundError'

vi.mock('../faProjectDocumentDeleteWiring', () => {
  return {
    promoteFaProjectDocumentChildrenBeforeDelete: vi.fn()
  }
})

vi.mock('../faProjectDocumentsQueryWiring', () => {
  return {
    getFaProjectDocumentById: vi.fn(),
    listFaProjectDocuments: vi.fn()
  }
})

vi.mock('../faProjectDocumentCreateResolveWiring', () => {
  return {
    resolveFaProjectDocumentPlacementId: vi.fn(() => null),
    resolveFaProjectDocumentSortOrderForCreate: vi.fn(() => 0),
    validateFaProjectDocumentForeignKeys: vi.fn()
  }
})

vi.mock('../faProjectDocumentCreateWiring', () => {
  return {
    resolveFaProjectDocumentIdForCreate: vi.fn((_db: unknown, id: string | undefined) => {
      return id ?? 'new-id'
    }),
    validateDocumentParentForeignKey: vi.fn()
  }
})

vi.mock('../faProjectDocumentAppearanceColorPersistWiring', () => {
  return {
    resolveFaProjectDocumentAppearanceColorsForCreate: vi.fn(() => {
      return {
        documentBackgroundColor: null,
        documentTextColor: null
      }
    }),
    resolveFaProjectDocumentAppearanceColorsForUpdate: vi.fn(() => {
      return {
        documentBackgroundColor: null,
        documentTextColor: null
      }
    })
  }
})

vi.mock('../faProjectDocumentsSqlWiring', () => {
  return {
    buildFaProjectDocumentSelectSql: vi.fn(() => 'SELECT * FROM documents')
  }
})

const { deleteFaProjectDocument, updateFaProjectDocument } = await import('../faProjectDocumentsPersistWiring')

beforeEach(() => {
  vi.clearAllMocks()
})

/**
 * updateFaProjectDocument
 * Throws when the document row is missing.
 */
test('Test that updateFaProjectDocument throws when the document row is missing', () => {
  const db = {
    prepare: vi.fn(() => {
      return {
        get: vi.fn(() => undefined)
      }
    })
  }
  expect(() =>
    updateFaProjectDocument(db as never, 'missing-id', { displayName: 'X' })
  ).toThrow(FaProjectContentNotFoundError)
})

/**
 * deleteFaProjectDocument
 * Throws when DELETE reports zero changes after promote.
 */
test('Test that deleteFaProjectDocument throws when delete changes are zero', () => {
  const db = {
    prepare: vi.fn(() => {
      return {
        run: vi.fn(() => {
          return { changes: 0 }
        })
      }
    })
  }
  expect(() =>
    deleteFaProjectDocument(db as never, 'missing-id')
  ).toThrow(FaProjectContentNotFoundError)
})
