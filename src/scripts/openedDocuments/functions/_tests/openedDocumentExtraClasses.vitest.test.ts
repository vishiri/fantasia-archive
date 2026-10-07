import { expect, test } from 'vitest'

import { normalizeOpenedDocumentExtraClassesFromDb } from '../openedDocumentNullableStringFromDb'
import {
  openedDocumentExtraClassesDraftExceedsStorage,
  resolveDocumentWorkspacePageExtraHtmlClassList,
  resolveOpenedDocumentExtraClassesDraftForPersist
} from '../openedDocumentExtraClasses'

test('Test that normalizeOpenedDocumentExtraClassesFromDb maps null to empty string', () => {
  expect(normalizeOpenedDocumentExtraClassesFromDb(null)).toBe('')
})

test('Test that normalizeOpenedDocumentExtraClassesFromDb preserves stored value', () => {
  expect(normalizeOpenedDocumentExtraClassesFromDb('foo bar')).toBe('foo bar')
})

test('Test that resolveOpenedDocumentExtraClassesDraftForPersist trims draft', () => {
  expect(resolveOpenedDocumentExtraClassesDraftForPersist('  foo bar  ')).toBe('foo bar')
})

test('Test that openedDocumentExtraClassesDraftExceedsStorage uses the trimmed 512 character cap', () => {
  expect(openedDocumentExtraClassesDraftExceedsStorage('a'.repeat(512))).toBe(false)
  expect(openedDocumentExtraClassesDraftExceedsStorage(`  ${'a'.repeat(512)}  `)).toBe(false)
  expect(openedDocumentExtraClassesDraftExceedsStorage('a'.repeat(513))).toBe(true)
})

test('Test that resolveDocumentWorkspacePageExtraHtmlClassList splits tokens', () => {
  expect(resolveDocumentWorkspacePageExtraHtmlClassList('foo  bar')).toEqual(['foo', 'bar'])
})

test('Test that resolveDocumentWorkspacePageExtraHtmlClassList returns empty for blank draft', () => {
  expect(resolveDocumentWorkspacePageExtraHtmlClassList('   ')).toEqual([])
})
