import { computed, ref } from 'vue'
import { expect, test, vi } from 'vitest'
import type { QInput } from 'quasar'

import {
  createFaLocaleTranslationsInputFallbackWarningTooltip,
  createFaLocaleTranslationsInputSingularPluralFallbackWarningTooltip,
  createFaLocaleTranslationsInputViewWiring
} from '../faLocaleTranslationsInputViewWiring'

/**
 * createFaLocaleTranslationsInputViewWiring
 * Wires trigger element, focus, and textarea row helpers for the element shell.
 */
test('Test that FaLocaleTranslationsInput view wiring resolves trigger and focus helpers', () => {
  const preferredLanguageInputRef = ref<QInput | null>(null)
  const emitModelValue = vi.fn()
  const triggerElement = document.createElement('button')

  const wiring = createFaLocaleTranslationsInputViewWiring({
    computed,
    emitModelValue,
    preferredLanguageInputRef,
    readRows: () => 6,
    readTriggerElement: () => triggerElement
  })

  expect(wiring.readTriggerElement()).toBe(triggerElement)
  expect(wiring.readPreferredLanguageInputFocus()).toBeNull()
  expect(wiring.resolvedTextareaRows.value).toBe(6)

  wiring.emitUpdate({ 'en-US': 'Value' })
  expect(emitModelValue).toHaveBeenCalledWith({ 'en-US': 'Value' })

  const focus = vi.fn()
  preferredLanguageInputRef.value = { focus } as unknown as QInput
  expect(wiring.readPreferredLanguageInputFocus()?.()).toBeUndefined()
  expect(focus).toHaveBeenCalled()
})

/**
 * createFaLocaleTranslationsInputFallbackWarningTooltip
 * Builds fallback warning copy from resolved language code.
 */
test('Test that FaLocaleTranslationsInput fallback tooltip wiring formats warning text', () => {
  const emptyTooltip = createFaLocaleTranslationsInputFallbackWarningTooltip({
    computed,
    readResolvedLanguageCode: () => null,
    translate: () => 'unused'
  })
  expect(emptyTooltip.value).toBe('')

  const tooltip = createFaLocaleTranslationsInputFallbackWarningTooltip({
    computed,
    readResolvedLanguageCode: () => 'de',
    translate: (_key, params) => `Fallback ${params.fallbackLanguageName}`
  })
  expect(tooltip.value).toBe('Fallback Deutsch (AI-generiert)')
})

test('Test that FaLocaleTranslationsInput singularPlural fallback tooltip wiring formats warning text', () => {
  const emptyTooltip = createFaLocaleTranslationsInputSingularPluralFallbackWarningTooltip({
    computed,
    readCurrentLanguageCode: () => 'en-US',
    readModelValue: () => ({
      plural: { 'en-US': 'Cats' },
      singular: { 'en-US': 'Cat' }
    }),
    translate: (key) => key
  })
  expect(emptyTooltip.value).toBe('')

  const tooltip = createFaLocaleTranslationsInputSingularPluralFallbackWarningTooltip({
    computed,
    readCurrentLanguageCode: () => 'de',
    readModelValue: () => ({
      plural: { 'en-US': 'Cats' },
      singular: {}
    }),
    translate: (key, params) => {
      if (key === 'dialogs.projectSettings.singularPluralMissing.usingFallback' && params?.fallbackLanguageName) {
        return `Fallback ${params.fallbackLanguageName}`
      }
      return key
    }
  })
  expect(tooltip.value).toContain('Fallback English, US')
})
