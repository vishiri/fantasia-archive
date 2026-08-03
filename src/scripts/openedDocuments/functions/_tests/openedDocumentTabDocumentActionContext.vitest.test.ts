import { expect, test } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { T_injectedResultAsync } from 'app/types/I_injectedNeverthrow'
import { FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY } from 'app/types/I_faDocumentTreeOrderNumber'

import { normalizeOpenedDocumentNullableStringFromDb } from '../openedDocumentNullableStringFromDb'
import { createCreateTemporaryOpenedDocumentTabSeed } from '../openedDocumentTemporaryTabSeed'
import { resolveOpenedDocumentTabDocumentActionContext } from '../openedDocumentTabDocumentActionContext'

const createTemporaryOpenedDocumentTabSeed = createCreateTemporaryOpenedDocumentTabSeed({
  emptyTreeOrderNumber: FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY,
  normalizeNullableStringFromDb: normalizeOpenedDocumentNullableStringFromDb
})

/**
 * Level-1 functions/_tests cannot import neverthrow; stub ResultAsync.fromPromise for DI.
 */
const ResultAsync = {
  fromPromise: <T>(
    promise: Promise<T>,
    mapError: (error: unknown) => unknown
  ) => ({
    then (
      onfulfilled?: ((value: {
        error: unknown
        isErr: () => boolean
        isOk: () => boolean
        value: T
      }) => unknown) | null
    ) {
      return promise.then(
        (value) => {
          const ok = {
            error: undefined as never,
            isErr: () => false,
            isOk: () => true,
            value
          }
          return onfulfilled ? onfulfilled(ok) : ok
        },
        (error: unknown) => {
          const err = {
            error: mapError(error),
            isErr: () => true,
            isOk: () => false,
            value: undefined as never
          }
          return onfulfilled ? onfulfilled(err) : err
        }
      )
    }
  })
} as unknown as T_injectedResultAsync

test('Test that resolveOpenedDocumentTabDocumentActionContext reads template from database for persisted tabs', async () => {
  const sourceTab: I_faOpenedDocumentTab = {
    documentId: 'doc-1',
    displayNameDraft: 'Hero',
    documentBackgroundColorDraft: '',
    documentTextColorDraft: '',
    editState: false,
    hasUnsavedChanges: false,
    persistenceState: 'persisted',
    savedDisplayName: 'Hero',
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
    extraClassesDraft: '',
    savedExtraClasses: '',
    savedDocumentTextColor: '',
    tabLabel: 'Character',
    templateIcon: 'mdi-account',
    worldId: 'world-1'
  }

  const context = await resolveOpenedDocumentTabDocumentActionContext({
    ResultAsync,
    getDocumentById: async () => ({
      parentDocumentId: 'doc-parent',
      templateId: 'tpl-1',
      worldId: 'world-1'
    }),
    sourceTab
  })

  expect(context).toEqual({
    parentDocumentId: 'doc-parent',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
})

test('Test that resolveOpenedDocumentTabDocumentActionContext keeps temporary tab placement metadata', async () => {
  const sourceTab = createTemporaryOpenedDocumentTabSeed({
    displayName: 'Temp doc',
    documentId: 'temp-1',
    parentDocumentId: 'doc-parent',
    tabLabel: 'Character',
    templateIcon: 'mdi-account',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })

  const context = await resolveOpenedDocumentTabDocumentActionContext({
    ResultAsync,
    getDocumentById: async () => {
      throw new Error('should not query database for temporary tab')
    },
    sourceTab
  })

  expect(context).toEqual({
    parentDocumentId: 'doc-parent',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
})

test('Test that resolveOpenedDocumentTabDocumentActionContext returns null when temporary tab lacks template or world', async () => {
  const sourceTab: I_faOpenedDocumentTab = {
    displayNameDraft: 'Temp doc',
    documentId: 'temp-1',
    documentBackgroundColorDraft: '',
    documentTextColorDraft: '',
    editState: true,
    hasUnsavedChanges: true,
    parentDocumentId: null,
    persistenceState: 'temporary',
    savedDisplayName: 'Temp doc',
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
    extraClassesDraft: '',
    savedExtraClasses: '',
    savedDocumentTextColor: '',
    tabLabel: 'Character',
    templateIcon: 'mdi-account',
    worldId: 'world-1'
  }

  const context = await resolveOpenedDocumentTabDocumentActionContext({
    ResultAsync,
    getDocumentById: async () => {
      throw new Error('should not query database for temporary tab')
    },
    sourceTab
  })

  expect(context).toBeNull()
})

test('Test that resolveOpenedDocumentTabDocumentActionContext returns null when persisted document lookup fails', async () => {
  const sourceTab: I_faOpenedDocumentTab = {
    documentId: 'doc-missing',
    displayNameDraft: 'Hero',
    documentBackgroundColorDraft: '',
    documentTextColorDraft: '',
    editState: false,
    hasUnsavedChanges: false,
    persistenceState: 'persisted',
    savedDisplayName: 'Hero',
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
    extraClassesDraft: '',
    savedExtraClasses: '',
    savedDocumentTextColor: '',
    tabLabel: 'Character',
    templateIcon: 'mdi-account',
    worldId: 'world-1'
  }

  const context = await resolveOpenedDocumentTabDocumentActionContext({
    ResultAsync,
    getDocumentById: async () => {
      throw new Error('missing document')
    },
    sourceTab
  })

  expect(context).toBeNull()
})
