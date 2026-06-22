import { expect, test } from 'vitest'

import {
  normalizeDialogProjectSettingsDocumentTemplateWorldAppendixTranslations,
  resolveDialogProjectSettingsDocumentTemplateResolvedWorldAppendix,
  resolveDialogProjectSettingsDocumentTemplateResolvedWorldAppendixLanguageCode
} from '../dialogProjectSettingsDocumentTemplateWorldAppendixDraft'

test('Test that resolveDialogProjectSettingsDocumentTemplateResolvedWorldAppendix resolves current locale', () => {
  expect(resolveDialogProjectSettingsDocumentTemplateResolvedWorldAppendix(
    {
      worldAppendixTranslations: {
        'en-US': ' notes',
        de: ' Notizen'
      }
    },
    'de'
  )).toBe('Notizen')
})

test('Test that resolveDialogProjectSettingsDocumentTemplateResolvedWorldAppendixLanguageCode reports fallback source', () => {
  expect(resolveDialogProjectSettingsDocumentTemplateResolvedWorldAppendixLanguageCode(
    {
      worldAppendixTranslations: {
        'en-US': ' notes',
        de: ''
      }
    },
    'de'
  )).toBe('en-US')
})

test('Test that normalizeDialogProjectSettingsDocumentTemplateWorldAppendixTranslations trims locale values', () => {
  expect(normalizeDialogProjectSettingsDocumentTemplateWorldAppendixTranslations({
    'en-US': '  appendix  '
  })).toEqual({
    'en-US': 'appendix'
  })
})
