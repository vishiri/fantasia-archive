import { expect, test } from 'vitest'

import {
  buildDialogProjectSettingsSingularPluralMissingTooltip,
  createDialogProjectSettingsVitestI18n,
  mergeDialogProjectSettingsVitestGlobal
} from '../dialogProjectSettingsVitestI18n'

test('Test that buildDialogProjectSettingsSingularPluralMissingTooltip formats all missing forms', () => {
  expect(buildDialogProjectSettingsSingularPluralMissingTooltip({
    fallbackLanguageCode: null,
    missingForm: 'plural'
  })).toBe([
    'Missing translations for current language:',
    '- Plural form missing'
  ].join('\n'))

  expect(buildDialogProjectSettingsSingularPluralMissingTooltip({
    fallbackLanguageCode: null,
    missingForm: 'singular'
  })).toBe([
    'Missing translations for current language:',
    '- Singular form missing'
  ].join('\n'))

  expect(buildDialogProjectSettingsSingularPluralMissingTooltip({
    fallbackLanguageCode: 'de',
    missingForm: 'both'
  })).toContain('Using fallback of Deutsch (AI-generiert)')

  expect(buildDialogProjectSettingsSingularPluralMissingTooltip({
    fallbackLanguageCode: 'fr',
    missingForm: 'both'
  })).toContain('Using fallback of fr')
})

test('Test that mergeDialogProjectSettingsVitestGlobal prepends i18n plugin', () => {
  const extraPlugin = { install: () => {} }
  const merged = mergeDialogProjectSettingsVitestGlobal({
    plugins: [extraPlugin]
  })

  expect(merged.plugins).toHaveLength(2)
})

test('Test that mergeDialogProjectSettingsVitestGlobal defaults missing plugins array', () => {
  const merged = mergeDialogProjectSettingsVitestGlobal()
  expect(merged.plugins).toHaveLength(1)
})

test('Test that createDialogProjectSettingsVitestI18n returns missing keys unchanged', () => {
  const i18n = createDialogProjectSettingsVitestI18n()
  const translate = (i18n.global as { t: (key: string) => string }).t
  expect(translate('dialogs.projectSettings.unknownKey')).toBe('dialogs.projectSettings.unknownKey')
})
