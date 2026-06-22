import { expect, test } from 'vitest'

import {
  isDialogProjectSettingsWorldTemplateGroupMissingCurrentLanguageTranslations,
  resolveDialogProjectSettingsWorldTemplateLayoutTreeMissingTranslationWarning,
  resolveDialogProjectSettingsWorldTemplateLayoutTreeMissingTranslationWarningI18nKey,
  resolveDialogProjectSettingsWorldTemplatePlacementTreeMissingTranslationWarning
} from '../../dialogProjectSettingsWorldTemplateLayoutTreeMissingTranslations'

const groupNode = {
  children: [],
  displayNameTranslations: { 'en-US': 'Group' },
  documentCountInWorld: 0,
  documentTemplateId: null,
  icon: 'mdi-folder',
  id: 'group-a',
  label: 'Group',
  nicknamePluralTranslations: {},
  nicknameSingularTranslations: {},
  nodeKind: 'group' as const,
  templateDisplayName: '',
  usesNickname: false,
  worldAppendix: ''
}

const templateNode = {
  children: [],
  displayNameTranslations: {},
  documentCountInWorld: 0,
  documentTemplateId: 'template-a',
  icon: 'mdi-file',
  id: 'placement-a',
  label: 'Character',
  nicknamePluralTranslations: {},
  nicknameSingularTranslations: {},
  nodeKind: 'template' as const,
  templateDisplayName: 'Character',
  usesNickname: false,
  worldAppendix: ''
}

test('Test that isDialogProjectSettingsWorldTemplateGroupMissingCurrentLanguageTranslations detects empty active locale', () => {
  expect(isDialogProjectSettingsWorldTemplateGroupMissingCurrentLanguageTranslations(
    { 'en-US': 'Group' },
    'de'
  )).toBe(true)
  expect(isDialogProjectSettingsWorldTemplateGroupMissingCurrentLanguageTranslations(
    { de: 'Gruppe' },
    'de'
  )).toBe(false)
})

test('Test that resolveDialogProjectSettingsWorldTemplatePlacementTreeMissingTranslationWarning prefers nickname gaps', () => {
  expect(resolveDialogProjectSettingsWorldTemplatePlacementTreeMissingTranslationWarning({
    documentTemplateTitlePluralTranslations: { 'en-US': 'Character' },
    documentTemplateTitleSingularTranslations: {},
    languageCode: 'de',
    nicknamePluralTranslations: { 'en-US': 'Hero' },
    nicknameSingularTranslations: {}
  })).toEqual({
    kind: 'placementNickname',
    warning: {
      fallbackLanguageCode: 'en-US',
      missingForm: 'both'
    }
  })

  expect(resolveDialogProjectSettingsWorldTemplatePlacementTreeMissingTranslationWarning({
    documentTemplateTitlePluralTranslations: { 'en-US': 'Character' },
    documentTemplateTitleSingularTranslations: {},
    languageCode: 'de',
    nicknamePluralTranslations: { de: 'Held' },
    nicknameSingularTranslations: { de: 'Held' }
  })).toBeNull()

  expect(resolveDialogProjectSettingsWorldTemplatePlacementTreeMissingTranslationWarning({
    documentTemplateTitlePluralTranslations: { 'en-US': 'Character' },
    documentTemplateTitleSingularTranslations: {},
    languageCode: 'de',
    nicknamePluralTranslations: {},
    nicknameSingularTranslations: {}
  })).toEqual({
    kind: 'documentTemplateTitle',
    warning: {
      fallbackLanguageCode: 'en-US',
      missingForm: 'both'
    }
  })

  expect(resolveDialogProjectSettingsWorldTemplatePlacementTreeMissingTranslationWarning({
    documentTemplateTitlePluralTranslations: { de: 'Charakter' },
    documentTemplateTitleSingularTranslations: {},
    languageCode: 'de',
    nicknamePluralTranslations: {},
    nicknameSingularTranslations: {}
  })).toEqual({
    kind: 'documentTemplateTitle',
    warning: {
      fallbackLanguageCode: null,
      missingForm: 'singular'
    }
  })

  expect(resolveDialogProjectSettingsWorldTemplatePlacementTreeMissingTranslationWarning({
    documentTemplateTitlePluralTranslations: null,
    documentTemplateTitleSingularTranslations: null,
    languageCode: 'de',
    nicknamePluralTranslations: {},
    nicknameSingularTranslations: {}
  })).toBeNull()
})

test('Test that resolveDialogProjectSettingsWorldTemplateLayoutTreeMissingTranslationWarning resolves group and template rows', () => {
  expect(resolveDialogProjectSettingsWorldTemplateLayoutTreeMissingTranslationWarning({
    documentTemplateTitlePluralTranslations: null,
    documentTemplateTitleSingularTranslations: null,
    languageCode: 'de',
    node: groupNode
  })).toBe('groupDisplayName')

  expect(resolveDialogProjectSettingsWorldTemplateLayoutTreeMissingTranslationWarning({
    documentTemplateTitlePluralTranslations: { 'en-US': 'Character' },
    documentTemplateTitleSingularTranslations: {},
    languageCode: 'de',
    node: templateNode
  })).toEqual({
    kind: 'documentTemplateTitle',
    warning: {
      fallbackLanguageCode: 'en-US',
      missingForm: 'both'
    }
  })

  expect(resolveDialogProjectSettingsWorldTemplateLayoutTreeMissingTranslationWarning({
    documentTemplateTitlePluralTranslations: { 'en-US': 'Character' },
    documentTemplateTitleSingularTranslations: {},
    languageCode: 'de',
    node: {
      ...templateNode,
      nicknamePluralTranslations: { de: 'Held' },
      nicknameSingularTranslations: { de: 'Held' }
    }
  })).toBeNull()

  expect(resolveDialogProjectSettingsWorldTemplateLayoutTreeMissingTranslationWarning({
    documentTemplateTitlePluralTranslations: { 'en-US': 'Character' },
    documentTemplateTitleSingularTranslations: {},
    languageCode: 'de',
    node: {
      ...templateNode,
      documentTemplateId: null
    }
  })).toBeNull()
})

test('Test that resolveDialogProjectSettingsWorldTemplateLayoutTreeMissingTranslationWarningI18nKey maps warning kinds', () => {
  expect(resolveDialogProjectSettingsWorldTemplateLayoutTreeMissingTranslationWarningI18nKey(null)).toBeNull()
  expect(resolveDialogProjectSettingsWorldTemplateLayoutTreeMissingTranslationWarningI18nKey('groupDisplayName')).toBe(
    'dialogs.projectSettings.fields.worldTemplateLayout.missingGroupDisplayNameTreeTooltip'
  )
  expect(resolveDialogProjectSettingsWorldTemplateLayoutTreeMissingTranslationWarningI18nKey({
    kind: 'placementNickname',
    warning: {
      fallbackLanguageCode: null,
      missingForm: 'plural'
    }
  })).toBeNull()
})
