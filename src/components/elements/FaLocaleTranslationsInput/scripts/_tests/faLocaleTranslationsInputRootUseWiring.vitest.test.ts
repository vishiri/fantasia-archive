/** @vitest-environment jsdom */

import { computed, nextTick, ref, toRef } from 'vue'
import { expect, test, vi } from 'vitest'

import { createFaLocaleTranslationsInputPresentationWiring } from '../faLocaleTranslationsInputPresentationWiring'
import { createUseFaLocaleTranslationsInputRoot } from '../faLocaleTranslationsInputRootUseWiring'
import {
  createFaLocaleTranslationsInputFallbackWarningTooltip,
  createFaLocaleTranslationsInputSingularPluralFallbackWarningTooltip,
  createFaLocaleTranslationsInputViewWiring
} from '../faLocaleTranslationsInputViewWiring'

const syncMenuAnchorTarget = vi.fn()

function buildComposableMock (): never {
  return {
    isMenuPresentationLocked: computed(() => false),
    isMultilineInput: computed(() => false),
    localeRows: computed(() => []),
    lockedMenuContentStyle: computed(() => ({})),
    menuOffset: [0, 4] as [number, number],
    menuTarget: computed(() => undefined),
    onTranslationsMenuBeforeShow: vi.fn(),
    onTranslationsMenuHide: vi.fn(),
    onTranslationsMenuShow: vi.fn(),
    openTranslationsMenu: vi.fn(),
    readLocaleValue: () => '',
    resolvedLanguageCode: computed(() => 'en-US' as const),
    resolvedValue: computed(() => ''),
    showFallbackWarning: computed(() => false),
    syncMenuAnchorTarget,
    translationsMenuOpen: ref(false),
    updateLocaleValue: vi.fn()
  } as never
}

const useFaLocaleTranslationsInputRoot = createUseFaLocaleTranslationsInputRoot({
  computed,
  createFaLocaleTranslationsInputFallbackWarningTooltip,
  createFaLocaleTranslationsInputPresentationWiring,
  createFaLocaleTranslationsInputSingularPluralFallbackWarningTooltip,
  createFaLocaleTranslationsInputViewWiring,
  nextTick,
  onMounted: (callback) => {
    callback()
  },
  ref,
  toRef,
  useFaLocaleTranslationsInput: buildComposableMock,
  useFaLocaleTranslationsInputSingularPlural: buildComposableMock,
  useI18n: () => ({
    t: (key: string) => key
  }) as never
})

test('Test that useFaLocaleTranslationsInputRoot syncs menu anchor for field presentation', async () => {
  syncMenuAnchorTarget.mockClear()
  useFaLocaleTranslationsInputRoot({
    currentLanguageCode: 'en-US',
    modelValue: { 'en-US': 'Name' },
    testLocator: 'fixture-input'
  }, vi.fn())
  await nextTick()
  expect(syncMenuAnchorTarget).toHaveBeenCalled()
})

test('Test that useFaLocaleTranslationsInputRoot skips menu anchor sync for menuPanel presentation', async () => {
  syncMenuAnchorTarget.mockClear()
  useFaLocaleTranslationsInputRoot({
    currentLanguageCode: 'en-US',
    modelValue: { 'en-US': 'Name' },
    presentation: 'menuPanel',
    testLocator: 'fixture-input'
  }, vi.fn())
  await nextTick()
  expect(syncMenuAnchorTarget).not.toHaveBeenCalled()
})
