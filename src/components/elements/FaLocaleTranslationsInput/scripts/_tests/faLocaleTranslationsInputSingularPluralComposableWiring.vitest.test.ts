import { computed, ref } from 'vue'
import { afterEach, expect, test, vi } from 'vitest'

import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faLocaleTranslationsInputComposableOptions } from 'app/types/I_faLocaleTranslationsInputComposable'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import * as menuStateModule from '../functions/createFaLocaleTranslationsInputMenuState'
import { createUseFaLocaleTranslationsInputSingularPlural } from '../faLocaleTranslationsInputSingularPluralComposableWiring'
import { useFaLocaleTranslationsInputSingularPlural } from '../faLocaleTranslationsInputSingularPlural_manager'

function buildSingularPluralComposableDeps (): Parameters<
  typeof createUseFaLocaleTranslationsInputSingularPlural
>[0] {
  return {
    FA_LOCALE_TRANSLATIONS_INPUT_MENU_MAX_HEIGHT_PX: 450,
    FA_LOCALE_TRANSLATIONS_INPUT_MENU_MAX_WIDTH_PX: 500,
    FA_LOCALE_TRANSLATIONS_INPUT_MENU_MIN_WIDTH_PX: 350,
    FA_LOCALE_TRANSLATIONS_INPUT_MENU_OFFSET_Y_PX: 4,
    FA_LOCALE_TRANSLATIONS_INPUT_MENU_VIEWPORT_MARGIN_PX: 16,
    buildFaLocaleTranslationsMenuContentStyle: () => ({}),
    buildLocaleRows: () => [
      {
        code: 'en-US',
        displayName: 'English'
      }
    ],
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
    resolveFaLocaleSingularPluralMissingFormsForLanguage: () => null,
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

afterEach(() => {
  vi.restoreAllMocks()
})

/**
 * createUseFaLocaleTranslationsInputSingularPlural
 * Wires singular-plural display state, plural-only menu emits, and mode flag.
 */
test('Test that createUseFaLocaleTranslationsInputSingularPlural wires display and plural menu emits', () => {
  const emitModelValue = vi.fn()
  let capturedMenuOptions: I_faLocaleTranslationsInputComposableOptions | undefined
  const capturedComputedFns: Array<() => unknown> = []
  const originalCreateMenuState = menuStateModule.createFaLocaleTranslationsInputMenuState
  const deps = {
    ...buildSingularPluralComposableDeps(),
    computed: <T>(fn: () => T) => {
      capturedComputedFns.push(fn)
      return computed(fn)
    }
  }

  vi.spyOn(menuStateModule, 'createFaLocaleTranslationsInputMenuState')
    .mockImplementation((menuDeps, options) => {
      capturedMenuOptions = options
      return originalCreateMenuState(menuDeps, options)
    })

  const useFaLocaleTranslationsInputSingularPlural = createUseFaLocaleTranslationsInputSingularPlural(deps)

  const modelValue = ref({
    plural: { 'en-US': 'Cats' },
    singular: { 'en-US': 'Cat' }
  })

  const api = useFaLocaleTranslationsInputSingularPlural({
    currentLanguageCode: ref('en-US'),
    emitModelValue,
    inputMode: ref('singleLine'),
    modelValue,
    readPreferredLanguageInputFocus: () => null,
    readTriggerElement: () => null,
    requestAnimationFrame: (callback) => {
      callback()
      return 1
    }
  })

  expect(api.isSingularPluralMode.value).toBe(true)
  expect(api.resolvedValue.value).toBe('English')

  for (const readComputed of capturedComputedFns) {
    readComputed()
  }

  capturedMenuOptions?.emitModelValue({ 'en-US': 'Creatures' })
  expect(emitModelValue).toHaveBeenCalledWith({
    plural: { 'en-US': 'Creatures' },
    singular: { 'en-US': 'Cat' }
  })

  api.updatePluralLocaleValue('en-US', 'Hunters')
  expect(emitModelValue).toHaveBeenCalledWith({
    plural: { 'en-US': 'Hunters' },
    singular: { 'en-US': 'Cat' }
  })
})

/**
 * createUseFaLocaleTranslationsInputSingularPlural
 * Exposes singular-plural composable through the wired manager entry.
 */
test('Test that useFaLocaleTranslationsInputSingularPlural manager wires singular plural composable', () => {
  const api = useFaLocaleTranslationsInputSingularPlural({
    currentLanguageCode: ref('en-US'),
    emitModelValue: vi.fn(),
    inputMode: ref('singleLine'),
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

  expect(api.isSingularPluralMode.value).toBe(true)
  expect(api.resolvedValue.value.length).toBeGreaterThan(0)
})
