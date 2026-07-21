import { expect, test } from 'vitest'

import {
  normalizeFaProjectDocumentExtraClassesForStorage,
  resolveFaProjectDocumentExtraClassesForCreateInput,
  resolveFaProjectDocumentExtraClassesForUpdate
} from '../faProjectDocumentExtraClassesSql'

test('Test that normalizeFaProjectDocumentExtraClassesForStorage maps nullish to empty string', () => {
  expect(normalizeFaProjectDocumentExtraClassesForStorage(null)).toBe('')
  expect(normalizeFaProjectDocumentExtraClassesForStorage(undefined)).toBe('')
})

test('Test that create input defaults extraClasses to empty string', () => {
  expect(resolveFaProjectDocumentExtraClassesForCreateInput({
    displayName: 'Hero',
    worldId: 'world-1'
  })).toBe('')
})

test('Test that create input trims extraClasses', () => {
  expect(resolveFaProjectDocumentExtraClassesForCreateInput({
    displayName: 'Hero',
    extraClasses: '  my-class another ',
    worldId: 'world-1'
  })).toBe('my-class another')
})

test('Test that update patch preserves existing extra_classes when omitted', () => {
  expect(resolveFaProjectDocumentExtraClassesForUpdate(
    {},
    {
      extra_classes: 'saved-class'
    } as never
  )).toBe('saved-class')
})

test('Test that update patch applies explicit extraClasses', () => {
  expect(resolveFaProjectDocumentExtraClassesForUpdate(
    { extraClasses: ' next ' },
    {
      extra_classes: 'saved-class'
    } as never
  )).toBe('next')
})
