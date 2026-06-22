import { computed } from 'vue'
import { expect, test, vi } from 'vitest'

import {
  buildFaLocaleTranslationsInputMenuPanelBindings,
  buildFaLocaleTranslationsInputSummaryFieldBindings
} from '../faLocaleTranslationsInputRootBindingsWiring'
import { createFaLocaleTranslationsInputRootBindingsState } from '../faLocaleTranslationsInputRootModelWiring'
import {
  createFaLocaleTranslationsInputFallbackWarningTooltip,
  createFaLocaleTranslationsInputSingularPluralFallbackWarningTooltip
} from '../faLocaleTranslationsInputViewWiring'

const baseProps = {
  autogrow: true,
  color: 'primary-bright',
  currentLanguageCode: 'en-US' as const,
  dark: true,
  dense: true,
  error: false,
  hideBottomSpace: true,
  inputMode: 'singleLine' as const,
  maxLength: 120,
  modelValue: { 'en-US': 'Name' },
  presentation: 'field' as const,
  rows: 3,
  testLocator: 'fixture-locale-input'
}

function buildSingleComposableMock (resolvedLanguageCode: 'de' | 'en-US' = 'en-US'): never {
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
    readLocaleValue: (languageCode: string) => languageCode === 'en-US' ? 'Name' : '',
    resolvedLanguageCode: computed(() => resolvedLanguageCode),
    resolvedValue: computed(() => 'Name'),
    showFallbackWarning: computed(() => false),
    updateLocaleValue: vi.fn()
  } as never
}

function buildSingularPluralComposableMock (): never {
  return {
    isMenuPresentationLocked: computed(() => false),
    isMultilineInput: computed(() => true),
    localeRows: computed(() => []),
    lockedMenuContentStyle: computed(() => ({ width: '400px' })),
    menuOffset: [0, 4] as [number, number],
    menuTarget: computed(() => undefined),
    onTranslationsMenuBeforeShow: vi.fn(),
    onTranslationsMenuHide: vi.fn(),
    onTranslationsMenuShow: vi.fn(),
    openTranslationsMenu: vi.fn(),
    readPluralLocaleValue: (languageCode: string) => languageCode === 'en-US' ? 'Cats' : '',
    readSingularLocaleValue: (languageCode: string) => languageCode === 'en-US' ? 'Cat' : '',
    resolvedLanguageCode: computed(() => 'en-US' as const),
    resolvedValue: computed(() => 'Cats'),
    showFallbackWarning: computed(() => true),
    updatePluralLocaleValue: vi.fn(),
    updateSingularLocaleValue: vi.fn()
  } as never
}

test('Test that buildFaLocaleTranslationsInputMenuPanelBindings wires single and singularPlural modes', () => {
  const singleBindings = buildFaLocaleTranslationsInputMenuPanelBindings({
    activeComposable: buildSingleComposableMock(),
    isSingularPluralForms: false,
    pluralColumnLabel: 'Plural',
    props: baseProps,
    resolvedTextareaRows: 3,
    setPreferredLanguageInputRef: vi.fn(),
    singularColumnLabel: 'Singular'
  })

  expect(singleBindings.readLocaleValue?.('en-US')).toBe('Name')
  expect(singleBindings.isSingularPluralMode).toBe(false)

  const minimalMenuBindings = buildFaLocaleTranslationsInputMenuPanelBindings({
    activeComposable: buildSingleComposableMock(),
    isSingularPluralForms: false,
    pluralColumnLabel: 'Plural',
    props: {
      currentLanguageCode: 'en-US',
      modelValue: { 'en-US': 'Name' },
      testLocator: 'fixture-locale-input'
    },
    resolvedTextareaRows: 3,
    setPreferredLanguageInputRef: vi.fn(),
    singularColumnLabel: 'Singular'
  })
  expect(minimalMenuBindings.autogrow).toBe(false)

  const updatePluralLocaleValue = vi.fn()
  const updateSingularLocaleValue = vi.fn()
  const singularPluralComposable = {
    isMenuPresentationLocked: computed(() => false),
    isMultilineInput: computed(() => true),
    localeRows: computed(() => []),
    lockedMenuContentStyle: computed(() => ({ width: '400px' })),
    menuOffset: [0, 4] as [number, number],
    menuTarget: computed(() => undefined),
    onTranslationsMenuBeforeShow: vi.fn(),
    onTranslationsMenuHide: vi.fn(),
    onTranslationsMenuShow: vi.fn(),
    openTranslationsMenu: vi.fn(),
    readPluralLocaleValue: (languageCode: string) => languageCode === 'en-US' ? 'Cats' : '',
    readSingularLocaleValue: (languageCode: string) => languageCode === 'en-US' ? 'Cat' : '',
    resolvedLanguageCode: computed(() => 'en-US' as const),
    resolvedValue: computed(() => 'Cats'),
    showFallbackWarning: computed(() => true),
    updatePluralLocaleValue,
    updateSingularLocaleValue
  }

  const singularPluralBindings = buildFaLocaleTranslationsInputMenuPanelBindings({
    activeComposable: singularPluralComposable as never,
    isSingularPluralForms: true,
    pluralColumnLabel: 'Plural',
    props: {
      ...baseProps,
      modelValue: {
        plural: { 'en-US': 'Cats' },
        singular: { 'en-US': 'Cat' }
      },
      translationForms: 'singularPlural'
    },
    resolvedTextareaRows: 4,
    setPreferredLanguageInputRef: vi.fn(),
    singularColumnLabel: 'Singular'
  })

  expect(singularPluralBindings.readPluralLocaleValue?.('en-US')).toBe('Cats')
  expect(singularPluralBindings.readSingularLocaleValue?.('en-US')).toBe('Cat')
  expect(singularPluralBindings.isSingularPluralMode).toBe(true)
  singularPluralBindings.updatePluralLocaleValue?.('en-US', 'Creatures')
  singularPluralBindings.updateSingularLocaleValue?.('en-US', 'Creature')
  expect(updatePluralLocaleValue).toHaveBeenCalledWith('en-US', 'Creatures')
  expect(updateSingularLocaleValue).toHaveBeenCalledWith('en-US', 'Creature')
  expect(singularPluralBindings.readLocaleValue?.('en-US')).toBe('')
  singularPluralBindings.updateLocaleValue?.('en-US', 'ignored')
})

test('Test that buildFaLocaleTranslationsInputSummaryFieldBindings wires single and singularPlural modes', () => {
  const singleBindings = buildFaLocaleTranslationsInputSummaryFieldBindings({
    activeComposable: buildSingleComposableMock(),
    fallbackWarningTooltip: 'single warning',
    isSingularPluralForms: false,
    pluralColumnLabel: 'Plural',
    props: baseProps,
    resolvedTextareaRows: 3,
    setPreferredLanguageInputRef: vi.fn(),
    singularColumnLabel: 'Singular',
    translateButtonTooltip: 'Translate'
  })

  expect(singleBindings.fallbackWarningTooltip).toBe('single warning')
  expect(singleBindings.readLocaleValue?.('en-US')).toBe('Name')

  const singularPluralBindings = buildFaLocaleTranslationsInputSummaryFieldBindings({
    activeComposable: buildSingularPluralComposableMock(),
    fallbackWarningTooltip: 'plural warning',
    isSingularPluralForms: true,
    pluralColumnLabel: 'Plural',
    props: {
      ...baseProps,
      modelValue: {
        plural: { 'en-US': 'Cats' },
        singular: { 'en-US': 'Cat' }
      },
      translationForms: 'singularPlural'
    },
    resolvedTextareaRows: 4,
    setPreferredLanguageInputRef: vi.fn(),
    singularColumnLabel: 'Singular',
    translateButtonTooltip: 'Translate'
  })

  expect(singularPluralBindings.showFallbackWarning).toBe(true)
  expect(singularPluralBindings.readPluralLocaleValue?.('en-US')).toBe('Cats')
  expect(singularPluralBindings.readLocaleValue?.('en-US')).toBe('')
  singularPluralBindings.updateLocaleValue?.('en-US', 'ignored')
})

test('Test that createFaLocaleTranslationsInputRootBindingsState selects singularPlural fallback tooltip', () => {
  const bindings = createFaLocaleTranslationsInputRootBindingsState({
    activeComposable: computed(() => buildSingularPluralComposableMock()),
    computed,
    createFaLocaleTranslationsInputFallbackWarningTooltip,
    createFaLocaleTranslationsInputSingularPluralFallbackWarningTooltip,
    isSingularPluralForms: computed(() => true),
    props: {
      ...baseProps,
      modelValue: {
        plural: { 'en-US': 'Cats' },
        singular: {}
      },
      translationForms: 'singularPlural'
    },
    resolvedTextareaRows: computed(() => 4),
    setPreferredLanguageInputRef: vi.fn(),
    singularPluralModelValueRef: computed(() => ({
      plural: { 'en-US': 'Cats' },
      singular: {}
    })),
    translate: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key)
  })

  expect(bindings.summaryFieldBindings.value.fallbackWarningTooltip.length).toBeGreaterThan(0)
  expect(bindings.menuPanelBindings.value.pluralColumnLabel).toBe('faLocaleTranslationsInput.pluralColumnLabel')
})

test('Test that createFaLocaleTranslationsInputRootBindingsState selects single fallback tooltip', () => {
  const translate = vi.fn((key: string, params?: Record<string, unknown>) => {
    return params ? `${key}:${JSON.stringify(params)}` : key
  })
  const bindings = createFaLocaleTranslationsInputRootBindingsState({
    activeComposable: computed(() => buildSingleComposableMock('de')),
    computed,
    createFaLocaleTranslationsInputFallbackWarningTooltip,
    createFaLocaleTranslationsInputSingularPluralFallbackWarningTooltip,
    isSingularPluralForms: computed(() => false),
    props: baseProps,
    resolvedTextareaRows: computed(() => 3),
    setPreferredLanguageInputRef: vi.fn(),
    singularPluralModelValueRef: computed(() => ({
      plural: {},
      singular: {}
    })),
    translate
  })

  expect(bindings.summaryFieldBindings.value.fallbackWarningTooltip).toContain('faLocaleTranslationsInput.fallbackWarningTooltip')
  expect(translate).toHaveBeenCalled()
})

test('Test that createFaLocaleTranslationsInputRootBindingsState returns empty singularPlural fallback when complete', () => {
  const bindings = createFaLocaleTranslationsInputRootBindingsState({
    activeComposable: computed(() => buildSingularPluralComposableMock()),
    computed,
    createFaLocaleTranslationsInputFallbackWarningTooltip,
    createFaLocaleTranslationsInputSingularPluralFallbackWarningTooltip,
    isSingularPluralForms: computed(() => true),
    props: {
      currentLanguageCode: 'en-US',
      modelValue: {
        plural: { 'en-US': 'Cats' },
        singular: { 'en-US': 'Cat' }
      },
      testLocator: 'fixture-locale-input',
      translationForms: 'singularPlural'
    },
    resolvedTextareaRows: computed(() => 4),
    setPreferredLanguageInputRef: vi.fn(),
    singularPluralModelValueRef: computed(() => ({
      plural: { 'en-US': 'Cats' },
      singular: { 'en-US': 'Cat' }
    })),
    translate: (key) => key
  })

  expect(bindings.summaryFieldBindings.value.fallbackWarningTooltip).toBe('')
})

test('Test that buildFaLocaleTranslationsInputSummaryFieldBindings applies prop defaults', () => {
  const bindings = buildFaLocaleTranslationsInputSummaryFieldBindings({
    activeComposable: buildSingleComposableMock(),
    fallbackWarningTooltip: '',
    isSingularPluralForms: false,
    pluralColumnLabel: 'Plural',
    props: {
      currentLanguageCode: 'en-US',
      modelValue: { 'en-US': 'Name' },
      testLocator: 'fixture-locale-input'
    },
    resolvedTextareaRows: 3,
    setPreferredLanguageInputRef: vi.fn(),
    singularColumnLabel: 'Singular',
    translateButtonTooltip: 'Translate'
  })

  expect(bindings.autogrow).toBe(false)
  expect(bindings.color).toBe('primary-bright')
  expect(bindings.dark).toBe(true)
  expect(bindings.dense).toBe(true)
  expect(bindings.error).toBe(false)
  expect(bindings.hideBottomSpace).toBe(true)
})
