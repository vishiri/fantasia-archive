import { describe, expect, test } from 'vitest'

import {
  formatProjectHierarchyTreeAddNewRowLabel,
  formatProjectHierarchyTreeNewDocumentDisplayName,
  PROJECT_HIERARCHY_TREE_ADD_NEW_MISSING_TRANSLATION_TOKEN,
  resolveProjectHierarchyTreeAddNewRowLabel,
  resolveProjectHierarchyTreeAddNewTemplateTitlePart,
  resolveProjectHierarchyTreeNewDocumentDisplayName
} from '../projectHierarchyTreeAddNewDocumentLabel'

describe('resolveProjectHierarchyTreeAddNewTemplateTitlePart', () => {
  test('Test that singular preferred locale wins first', () => {
    const part = resolveProjectHierarchyTreeAddNewTemplateTitlePart({
      preferredLanguageCode: 'de',
      titlePluralTranslations: {
        de: 'Charaktere',
        'en-US': 'Characters'
      },
      titleSingularTranslations: {
        de: 'Charakter',
        'en-US': 'Character'
      }
    })
    expect(part).toBe('Charakter')
  })

  test('Test that plural preferred locale is second fallback', () => {
    const part = resolveProjectHierarchyTreeAddNewTemplateTitlePart({
      preferredLanguageCode: 'de',
      titlePluralTranslations: {
        de: 'Charaktere',
        'en-US': 'Characters'
      },
      titleSingularTranslations: {
        'en-US': 'Character'
      }
    })
    expect(part).toBe('Charaktere')
  })

  test('Test that singular en-US is third fallback', () => {
    const part = resolveProjectHierarchyTreeAddNewTemplateTitlePart({
      preferredLanguageCode: 'de',
      titlePluralTranslations: { 'en-US': 'Characters' },
      titleSingularTranslations: { 'en-US': 'Character' }
    })
    expect(part).toBe('Character')
  })

  test('Test that plural en-US is fourth fallback', () => {
    const part = resolveProjectHierarchyTreeAddNewTemplateTitlePart({
      preferredLanguageCode: 'de',
      titlePluralTranslations: { 'en-US': 'Characters' },
      titleSingularTranslations: {}
    })
    expect(part).toBe('Characters')
  })

  test('Test that missing translations return the missing token', () => {
    const part = resolveProjectHierarchyTreeAddNewTemplateTitlePart({
      preferredLanguageCode: 'de',
      titlePluralTranslations: {},
      titleSingularTranslations: {}
    })
    expect(part).toBe(PROJECT_HIERARCHY_TREE_ADD_NEW_MISSING_TRANSLATION_TOKEN)
  })
})

describe('formatProjectHierarchyTreeAddNewRowLabel', () => {
  test('Test that row label lowercases template part and keeps Add new prefix', () => {
    expect(formatProjectHierarchyTreeAddNewRowLabel('Character')).toBe('Add new character')
  })

  test('Test that missing token keeps uppercase in row label', () => {
    expect(
      formatProjectHierarchyTreeAddNewRowLabel(PROJECT_HIERARCHY_TREE_ADD_NEW_MISSING_TRANSLATION_TOKEN)
    ).toBe('Add new MISSING TRANSLATION')
  })
})

describe('formatProjectHierarchyTreeNewDocumentDisplayName', () => {
  test('Test that display name lowercases template part and keeps New prefix', () => {
    expect(formatProjectHierarchyTreeNewDocumentDisplayName('Character')).toBe('New character')
  })

  test('Test that missing token keeps uppercase in display name', () => {
    expect(
      formatProjectHierarchyTreeNewDocumentDisplayName(PROJECT_HIERARCHY_TREE_ADD_NEW_MISSING_TRANSLATION_TOKEN)
    ).toBe('New MISSING TRANSLATION')
  })
})

describe('resolveProjectHierarchyTreeAddNewRowLabel', () => {
  test('Test that resolved row label applies full pipeline', () => {
    const label = resolveProjectHierarchyTreeAddNewRowLabel({
      preferredLanguageCode: 'en-US',
      titlePluralTranslations: { 'en-US': 'Characters' },
      titleSingularTranslations: { 'en-US': 'Character' }
    })
    expect(label).toBe('Add new character')
  })
})

describe('resolveProjectHierarchyTreeNewDocumentDisplayName', () => {
  test('Test that resolved display name applies full pipeline', () => {
    const displayName = resolveProjectHierarchyTreeNewDocumentDisplayName({
      preferredLanguageCode: 'en-US',
      titlePluralTranslations: { 'en-US': 'Characters' },
      titleSingularTranslations: { 'en-US': 'Character' }
    })
    expect(displayName).toBe('New character')
  })
})
