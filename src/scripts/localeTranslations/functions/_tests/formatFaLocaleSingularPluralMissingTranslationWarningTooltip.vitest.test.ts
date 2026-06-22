import { expect, test, vi } from 'vitest'

import { formatFaLocaleSingularPluralMissingTranslationWarningTooltip } from '../formatFaLocaleSingularPluralMissingTranslationWarningTooltip'

test('Test that formatFaLocaleSingularPluralMissingTranslationWarningTooltip formats both-missing copy with fallback', () => {
  const translate = vi.fn((key: string, params?: Record<string, string>) => {
    if (params?.fallbackLanguageName !== undefined) {
      return `${key}:${params.fallbackLanguageName}`
    }
    return key
  })
  const tooltip = formatFaLocaleSingularPluralMissingTranslationWarningTooltip({
    activeLanguageCode: 'de',
    readFallbackLanguageName: () => 'English (US)',
    translate,
    warning: {
      fallbackLanguageCode: 'en-US',
      missingForm: 'both'
    }
  })
  expect(tooltip).toContain('dialogs.projectSettings.singularPluralMissing.bothIntro')
  expect(tooltip).toContain('dialogs.projectSettings.singularPluralMissing.singularBullet')
  expect(tooltip).toContain('dialogs.projectSettings.singularPluralMissing.pluralBullet')
  expect(tooltip).toContain('English (US)')
})

test('Test that formatFaLocaleSingularPluralMissingTranslationWarningTooltip formats plural-only missing copy', () => {
  const tooltip = formatFaLocaleSingularPluralMissingTranslationWarningTooltip({
    activeLanguageCode: 'de',
    readFallbackLanguageName: () => 'English (US)',
    translate: (key) => key,
    warning: {
      fallbackLanguageCode: 'de',
      missingForm: 'plural'
    }
  })
  expect(tooltip).toContain('dialogs.projectSettings.singularPluralMissing.bothIntro')
  expect(tooltip).toContain('dialogs.projectSettings.singularPluralMissing.pluralBullet')
  expect(tooltip).toMatch(
    /dialogs\.projectSettings\.singularPluralMissing\.bothIntro\r?\n- /
  )
  expect(tooltip).not.toContain('usingFallback')
})

test('Test that formatFaLocaleSingularPluralMissingTranslationWarningTooltip formats singular-only missing copy', () => {
  const tooltip = formatFaLocaleSingularPluralMissingTranslationWarningTooltip({
    activeLanguageCode: 'de',
    readFallbackLanguageName: () => 'English (US)',
    translate: (key) => key,
    warning: {
      fallbackLanguageCode: null,
      missingForm: 'singular'
    }
  })
  expect(tooltip).toContain('dialogs.projectSettings.singularPluralMissing.bothIntro')
  expect(tooltip).toContain('dialogs.projectSettings.singularPluralMissing.singularBullet')
})
