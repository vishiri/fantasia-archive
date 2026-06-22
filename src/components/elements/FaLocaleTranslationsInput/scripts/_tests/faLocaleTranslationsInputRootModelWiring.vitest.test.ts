import { computed, ref, toRef, type WritableComputedRef } from 'vue'
import { expect, test, vi } from 'vitest'

import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'

import { createFaLocaleTranslationsInputRootModelWiring } from '../faLocaleTranslationsInputRootModelWiring'
import { createFaLocaleTranslationsInputViewWiring } from '../faLocaleTranslationsInputViewWiring'

function buildComposableMock (): never {
  return {
    isMenuPresentationLocked: computed(() => false),
    isMultilineInput: computed(() => false),
    localeRows: computed(() => []),
    lockedMenuContentStyle: computed(() => ({})),
    menuOffset: [0, 4],
    menuTarget: computed(() => undefined),
    onTranslationsMenuBeforeShow: vi.fn(),
    onTranslationsMenuHide: vi.fn(),
    onTranslationsMenuShow: vi.fn(),
    openTranslationsMenu: vi.fn(),
    readPluralLocaleValue: () => '',
    readSingularLocaleValue: () => '',
    resolvedLanguageCode: computed(() => 'en-US'),
    resolvedValue: computed(() => ''),
    showFallbackWarning: computed(() => false),
    updatePluralLocaleValue: vi.fn(),
    updateSingularLocaleValue: vi.fn()
  } as never
}

test('Test that createFaLocaleTranslationsInputRootModelWiring emits singularPlural model updates', () => {
  const emit = vi.fn()
  const props = {
    currentLanguageCode: 'en-US' as const,
    modelValue: {
      plural: { 'en-US': 'Cats' },
      singular: {}
    },
    testLocator: 'fixture-input',
    translationForms: 'singularPlural' as const
  }
  const wiring = createFaLocaleTranslationsInputRootModelWiring({
    computed,
    createFaLocaleTranslationsInputViewWiring: (deps) => createFaLocaleTranslationsInputViewWiring({
      computed,
      emitModelValue: deps.emitModelValue,
      preferredLanguageInputRef: ref(null),
      readRows: () => 3,
      readTriggerElement: () => null
    }),
    emit,
    props,
    ref,
    toRef,
    useFaLocaleTranslationsInput: buildComposableMock,
    useFaLocaleTranslationsInputSingularPlural: buildComposableMock
  })

  expect(wiring.isSingularPluralForms.value).toBe(true)

  const modelRef = wiring.singularPluralModelValueRef as WritableComputedRef<I_faLocaleSingularPluralTranslations>
  modelRef.value = {
    plural: { 'en-US': 'Cats' },
    singular: { 'en-US': 'Cat' }
  }
  expect(emit).toHaveBeenCalledWith('update:modelValue', {
    plural: { 'en-US': 'Cats' },
    singular: { 'en-US': 'Cat' }
  })
})
