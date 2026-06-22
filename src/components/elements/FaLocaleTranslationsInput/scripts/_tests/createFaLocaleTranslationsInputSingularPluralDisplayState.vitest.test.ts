import { computed, ref } from 'vue'
import { expect, test, vi } from 'vitest'

import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { createFaLocaleTranslationsInputSingularPluralDisplayState } from '../functions/createFaLocaleTranslationsInputSingularPluralDisplayState'

function buildSingularPluralDisplayStateDeps (): Parameters<
  typeof createFaLocaleTranslationsInputSingularPluralDisplayState
>[0] {
  return {
    FA_LOCALE_TRANSLATIONS_INPUT_MENU_MAX_HEIGHT_PX: 450,
    FA_LOCALE_TRANSLATIONS_INPUT_MENU_MAX_WIDTH_PX: 500,
    FA_LOCALE_TRANSLATIONS_INPUT_MENU_MIN_WIDTH_PX: 350,
    FA_LOCALE_TRANSLATIONS_INPUT_MENU_OFFSET_Y_PX: 4,
    FA_LOCALE_TRANSLATIONS_INPUT_MENU_VIEWPORT_MARGIN_PX: 16,
    buildFaLocaleTranslationsMenuContentStyle: () => ({}),
    buildLocaleRows: () => [],
    computed,
    isFaLocaleStringTranslationUsingFallback: () => false,
    nextTick: async () => {},
    ref,
    resolveFaLocaleSingularPluralDisplayTranslation: (
      _translations: I_faLocaleSingularPluralTranslations,
      preferredLanguageCode: T_faUserSettingsLanguageCode
    ) => {
      return preferredLanguageCode === 'de' ? 'German' : 'English'
    },
    resolveFaLocaleSingularPluralDisplayTranslationLanguageCode: () => 'en-US',
    resolveFaLocaleSingularPluralMissingFormsForLanguage: (translations, languageCode) => {
      const hasPlural = (translations.plural[languageCode] ?? '').trim().length > 0
      const hasSingular = (translations.singular[languageCode] ?? '').trim().length > 0
      if (hasPlural && hasSingular) {
        return null
      }
      if (!hasPlural && !hasSingular) {
        return 'both'
      }
      return hasPlural ? 'singular' : 'plural'
    },
    resolveFaLocaleStringTranslation: (translations, languageCode) => translations[languageCode] ?? '',
    resolveFaLocaleStringTranslationLanguageCode: () => 'en-US',
    resolveFaLocaleTranslationsMenuAnchorElement: () => null,
    resolveFaLocaleTranslationsMenuPresentation: () => ({
      maxHeightPx: 400,
      widthPx: 300
    }),
    scheduleFaLocaleTranslationsMenuInputFocus: vi.fn()
  }
}

test('Test that createFaLocaleTranslationsInputSingularPluralDisplayState updates singular and plural maps', () => {
  const emitModelValue = vi.fn()
  const api = createFaLocaleTranslationsInputSingularPluralDisplayState(buildSingularPluralDisplayStateDeps(), {
    currentLanguageCode: ref('en-US'),
    emitModelValue,
    inputMode: ref('singleLine'),
    maxLength: ref(5),
    modelValue: ref({
      plural: { 'en-US': 'Cats' },
      singular: { de: 'Katze' }
    }),
    readPreferredLanguageInputFocus: () => null,
    readTriggerElement: () => null,
    requestAnimationFrame: (callback) => {
      callback()
      return 1
    }
  })

  expect(api.resolvedValue.value).toBe('English')
  expect(api.readSingularLocaleValue('de')).toBe('Katze')
  expect(api.readPluralLocaleValue('en-US')).toBe('Cats')
  expect(api.showFallbackWarning.value).toBe(true)

  api.updatePluralLocaleValue('en-US', '123456')
  expect(emitModelValue).toHaveBeenCalledWith({
    plural: { 'en-US': '12345' },
    singular: { de: 'Katze' }
  })

  emitModelValue.mockClear()
  api.updateSingularLocaleValue('de', '   ')
  expect(emitModelValue).toHaveBeenCalledWith({
    plural: { 'en-US': 'Cats' },
    singular: {}
  })
})

test('Test that createFaLocaleTranslationsInputSingularPluralDisplayState supports multiline mode', () => {
  const emitModelValue = vi.fn()
  const api = createFaLocaleTranslationsInputSingularPluralDisplayState(buildSingularPluralDisplayStateDeps(), {
    currentLanguageCode: ref('en-US'),
    emitModelValue,
    inputMode: ref('multiline'),
    modelValue: ref({
      plural: { 'en-US': 'Cats' },
      singular: { 'en-US': 'Cat' }
    }),
    readPreferredLanguageInputFocus: () => null,
    readTriggerElement: () => null,
    requestAnimationFrame: (callback) => {
      callback()
      return 1
    }
  })

  expect(api.isMultilineInput.value).toBe(true)
  expect(api.showFallbackWarning.value).toBe(false)
  expect(api.readPluralLocaleValue('fr')).toBe('')

  api.updateSingularLocaleValue('en-US', null)
  expect(emitModelValue).toHaveBeenCalledWith({
    plural: { 'en-US': 'Cats' },
    singular: {}
  })
})
