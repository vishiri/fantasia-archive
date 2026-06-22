import { computed, ref } from 'vue'
import { expect, test, vi } from 'vitest'

import type { I_faLocaleTranslationsInputComposableDeps } from 'app/types/I_faLocaleTranslationsInputComposable'

import { createFaLocaleTranslationsInputDisplayState } from '../functions/createFaLocaleTranslationsInputDisplayState'

function buildDisplayStateDeps (): I_faLocaleTranslationsInputComposableDeps {
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

test('Test that createFaLocaleTranslationsInputDisplayState trims values to maxLength', () => {
  const emitModelValue = vi.fn()
  const api = createFaLocaleTranslationsInputDisplayState(buildDisplayStateDeps(), {
    currentLanguageCode: ref('en-US'),
    emitModelValue,
    inputMode: ref('singleLine'),
    maxLength: ref(5),
    modelValue: ref({}),
    readPreferredLanguageInputFocus: () => null,
    readTriggerElement: () => null,
    requestAnimationFrame: (callback) => {
      callback()
      return 1
    }
  })

  api.updateLocaleValue('en-US', '123456789')
  expect(emitModelValue).toHaveBeenCalledWith({ 'en-US': '12345' })
})

test('Test that createFaLocaleTranslationsInputDisplayState coerces null and undefined to empty string', () => {
  const emitModelValue = vi.fn()
  const api = createFaLocaleTranslationsInputDisplayState(buildDisplayStateDeps(), {
    currentLanguageCode: ref('en-US'),
    emitModelValue,
    inputMode: ref('singleLine'),
    modelValue: ref({ 'en-US': 'keep' }),
    readPreferredLanguageInputFocus: () => null,
    readTriggerElement: () => null,
    requestAnimationFrame: (callback) => {
      callback()
      return 1
    }
  })

  api.updateLocaleValue('en-US', null)
  expect(emitModelValue).toHaveBeenCalledWith({})

  emitModelValue.mockClear()
  api.updateLocaleValue('de', undefined as unknown as string | number | null)
  expect(emitModelValue).toHaveBeenCalledWith({ 'en-US': 'keep' })
})

test('Test that createFaLocaleTranslationsInputDisplayState deletes locale keys for blank trimmed values', () => {
  const emitModelValue = vi.fn()
  const api = createFaLocaleTranslationsInputDisplayState(buildDisplayStateDeps(), {
    currentLanguageCode: ref('en-US'),
    emitModelValue,
    inputMode: ref('multiline'),
    modelValue: ref({
      'en-US': 'Name',
      de: 'Alt'
    }),
    readPreferredLanguageInputFocus: () => null,
    readTriggerElement: () => null,
    requestAnimationFrame: (callback) => {
      callback()
      return 1
    }
  })

  expect(api.isMultilineInput.value).toBe(true)
  expect(api.readLocaleValue('fr')).toBe('')

  api.updateLocaleValue('de', '   ')
  expect(emitModelValue).toHaveBeenCalledWith({ 'en-US': 'Name' })
})

test('Test that createFaLocaleTranslationsInputDisplayState keeps values when maxLength is unset', () => {
  const emitModelValue = vi.fn()
  const api = createFaLocaleTranslationsInputDisplayState(buildDisplayStateDeps(), {
    currentLanguageCode: ref('en-US'),
    emitModelValue,
    inputMode: ref('singleLine'),
    modelValue: ref({}),
    readPreferredLanguageInputFocus: () => null,
    readTriggerElement: () => null,
    requestAnimationFrame: (callback) => {
      callback()
      return 1
    }
  })

  api.updateLocaleValue('en-US', 42)
  expect(emitModelValue).toHaveBeenCalledWith({ 'en-US': '42' })
})

test('Test that createFaLocaleTranslationsInputDisplayState exposes fallback warning state', () => {
  const deps = buildDisplayStateDeps()
  deps.isFaLocaleStringTranslationUsingFallback = () => true
  const api = createFaLocaleTranslationsInputDisplayState(deps, {
    currentLanguageCode: ref('en-US'),
    emitModelValue: vi.fn(),
    inputMode: ref('singleLine'),
    modelValue: ref({ de: 'Fallback' }),
    readPreferredLanguageInputFocus: () => null,
    readTriggerElement: () => null,
    requestAnimationFrame: (callback) => {
      callback()
      return 1
    }
  })

  expect(api.showFallbackWarning.value).toBe(true)
  expect(api.resolvedValue.value).toBe('')
})
