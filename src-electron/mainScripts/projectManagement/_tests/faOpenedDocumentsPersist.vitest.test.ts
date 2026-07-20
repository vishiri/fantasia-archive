import { expect, test, vi } from 'vitest'

import { FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faOpenedDocumentsSnapshot } from 'app/types/I_faOpenedDocumentsDomain'

import {
  clearFaProjectOpenedDocumentsSnapshot,
  readFaProjectOpenedDocumentsSnapshot,
  upsertFaProjectOpenedDocumentsSnapshot
} from '../faOpenedDocumentsPersistWiring'

const sampleSnapshot: I_faOpenedDocumentsSnapshot = {
  schemaVersion: 1,
  activeDocumentId: 'doc-1',
  tabs: [
    {
      documentId: 'doc-1',
      persistenceState: 'persisted',
      tabLabel: 'Hero',
      templateIcon: 'mdi-account',
      displayNameDraft: 'Hero',
      savedDisplayName: 'Hero',
      documentTextColorDraft: '',
      savedDocumentTextColor: '',
      documentBackgroundColorDraft: '',
      savedDocumentBackgroundColor: '',
      isCategoryDraft: false,
      savedIsCategory: false,
      isFinishedDraft: false,
      isMinorDraft: false,
      isDeadDraft: false,
      savedIsFinished: false,
      savedIsMinor: false,
      savedIsDead: false,
      parentDocumentIdDraft: '',
      savedParentDocumentId: '',
      treeOrderNumberDraft: '',
      savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
      hasUnsavedChanges: false,
      editState: false
    }
  ]
}

/**
 * readFaProjectOpenedDocumentsSnapshot
 * Returns empty snapshot when the singleton row is missing.
 */
test('Test that readFaProjectOpenedDocumentsSnapshot returns empty snapshot when row is absent', () => {
  const db = {
    prepare: vi.fn(() => ({
      get: vi.fn(() => undefined)
    }))
  }
  const snapshot = readFaProjectOpenedDocumentsSnapshot(db as never)
  expect(snapshot).toEqual(FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT)
})

/**
 * readFaProjectOpenedDocumentsSnapshot
 * Parses stored JSON when the singleton row exists.
 */
test('Test that readFaProjectOpenedDocumentsSnapshot parses stored snapshot JSON', () => {
  const db = {
    prepare: vi.fn(() => ({
      get: vi.fn(() => ({
        snapshotJson: JSON.stringify(sampleSnapshot)
      }))
    }))
  }
  const snapshot = readFaProjectOpenedDocumentsSnapshot(db as never)
  expect(snapshot.activeDocumentId).toBe('doc-1')
  expect(snapshot.tabs).toHaveLength(1)
  expect(snapshot.tabs[0]?.documentId).toBe('doc-1')
})

/**
 * upsertFaProjectOpenedDocumentsSnapshot
 * Writes serialized JSON to the singleton opened_documents row.
 */
test('Test that upsertFaProjectOpenedDocumentsSnapshot upserts snapshot JSON', () => {
  const runs: unknown[][] = []
  const db = {
    prepare: vi.fn(() => ({
      run: vi.fn((...args: unknown[]) => {
        runs.push(args)
      })
    }))
  }
  upsertFaProjectOpenedDocumentsSnapshot(db as never, sampleSnapshot)
  expect(runs.length).toBe(1)
  expect(runs[0]?.[0]).toBe(1)
  expect(typeof runs[0]?.[1]).toBe('string')
})

/**
 * clearFaProjectOpenedDocumentsSnapshot
 * Deletes the singleton opened_documents row.
 */
test('Test that clearFaProjectOpenedDocumentsSnapshot deletes the singleton row', () => {
  const runs: unknown[][] = []
  const db = {
    prepare: vi.fn(() => ({
      run: vi.fn((...args: unknown[]) => {
        runs.push(args)
      })
    }))
  }
  clearFaProjectOpenedDocumentsSnapshot(db as never)
  expect(runs[0]?.[0]).toBe(1)
})
