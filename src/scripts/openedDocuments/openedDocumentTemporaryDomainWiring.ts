import { FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY } from 'app/types/I_faDocumentTreeOrderNumber'

import { normalizeOpenedDocumentNullableStringFromDb } from './functions/openedDocumentNullableStringFromDb'
import {
  createApplyTemporaryOpenedDocumentParent,
  createPromoteTemporaryOpenedDocumentTabAfterCreate,
  normalizeOpenedDocumentTabPersistenceState,
  remapOpenedDocumentTabDocumentId,
  resolveOpenedDocumentTabIsPersisted,
  resolveOpenedDocumentTabIsTemporary,
  resolveTemporaryOpenedDocumentDisplayNameForSave,
  resolveTemporaryOpenedDocumentParentDocumentId
} from './functions/openedDocumentTemporaryDomain'
import {
  createCreateTemporaryOpenedDocumentTabCopySeed,
  createCreateTemporaryOpenedDocumentTabSeed
} from './functions/openedDocumentTemporaryTabSeed'

const temporaryNullableStringNormalizeDeps = {
  normalizeNullableStringFromDb: normalizeOpenedDocumentNullableStringFromDb
}

const temporaryTreeOrderNormalizeDeps = {
  emptyTreeOrderNumber: FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY,
  normalizeNullableStringFromDb: normalizeOpenedDocumentNullableStringFromDb
}

export const applyTemporaryOpenedDocumentParent = createApplyTemporaryOpenedDocumentParent(
  temporaryNullableStringNormalizeDeps
)

export const promoteTemporaryOpenedDocumentTabAfterCreate =
  createPromoteTemporaryOpenedDocumentTabAfterCreate(temporaryTreeOrderNormalizeDeps)

export const createTemporaryOpenedDocumentTabCopySeed =
  createCreateTemporaryOpenedDocumentTabCopySeed(temporaryTreeOrderNormalizeDeps)

export const createTemporaryOpenedDocumentTabSeed =
  createCreateTemporaryOpenedDocumentTabSeed(temporaryTreeOrderNormalizeDeps)

export {
  normalizeOpenedDocumentTabPersistenceState,
  remapOpenedDocumentTabDocumentId,
  resolveOpenedDocumentTabIsPersisted,
  resolveOpenedDocumentTabIsTemporary,
  resolveTemporaryOpenedDocumentDisplayNameForSave,
  resolveTemporaryOpenedDocumentParentDocumentId
}
