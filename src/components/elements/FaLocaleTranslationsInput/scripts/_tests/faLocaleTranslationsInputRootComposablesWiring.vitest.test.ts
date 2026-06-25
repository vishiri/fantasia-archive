import { computed, ref, toRef } from 'vue'
import { expect, test, vi } from 'vitest'

import { FA_LOCALE_TRANSLATIONS_INPUT_DEFAULT_TEXTAREA_ROWS } from 'app/types/I_faLocaleTranslationsInput'

import { createFaLocaleTranslationsInputRootActiveComposable } from '../faLocaleTranslationsInputRootComposablesWiring'
import { createFaLocaleTranslationsInputViewWiring } from '../faLocaleTranslationsInputViewWiring'

const baseProps = {
  currentLanguageCode: 'en-US' as const,
  testLocator: 'fixture-input'
}

test('Test that createFaLocaleTranslationsInputRootActiveComposable switches composable by translationForms', () => {
  const emit = vi.fn()
  const singleComposable = { id: 'single' }
  const singularPluralComposable = { id: 'singularPlural' }
  const viewWiring = createFaLocaleTranslationsInputViewWiring({
    computed,
    emitModelValue: vi.fn(),
    preferredLanguageInputRef: ref(null),
    readRows: () => 5,
    readTriggerElement: () => null
  })

  const wiring = createFaLocaleTranslationsInputRootActiveComposable({
    computed,
    createFaLocaleTranslationsInputViewWiring: () => viewWiring,
    emit,
    isSingularPluralForms: computed(() => false),
    preferredLanguageInputRef: ref(null),
    props: {
      ...baseProps,
      modelValue: { 'en-US': 'Name' }
    },
    singularPluralModelValueRef: computed({
      get: () => ({
        plural: {},
        singular: {}
      }),
      set: () => {}
    }),
    singleModelValueRef: computed({
      get: () => ({ 'en-US': 'Name' }),
      set: (value) => {
        emit('update:modelValue', value)
      }
    }),
    summaryFieldRef: ref(null),
    toRef,
    useFaLocaleTranslationsInput: () => singleComposable as never,
    useFaLocaleTranslationsInputSingularPlural: () => singularPluralComposable as never
  })

  expect(wiring.activeComposable.value).toBe(singleComposable)
  expect(wiring.resolvedTextareaRows.value).toBe(5)
  expect(wiring.readPreferredLanguageInputFocus()).toBeNull()
  wiring.setPreferredLanguageInputRef(document.createElement('input'))
})

test('Test that createFaLocaleTranslationsInputRootActiveComposable uses singularPlural composable and focus wiring', () => {
  const emit = vi.fn()
  const singularPluralComposable = { id: 'singularPlural' }
  const preferredLanguageInputRef = ref<import('quasar').QInput | null>(null)
  const capturedViewWirings: Array<ReturnType<typeof createFaLocaleTranslationsInputViewWiring>> = []

  const wiring = createFaLocaleTranslationsInputRootActiveComposable({
    computed,
    createFaLocaleTranslationsInputViewWiring: (deps) => {
      const created = createFaLocaleTranslationsInputViewWiring(deps)
      capturedViewWirings.push(created)
      return created
    },
    emit,
    isSingularPluralForms: computed(() => true),
    preferredLanguageInputRef,
    props: {
      ...baseProps,
      modelValue: {
        plural: { 'en-US': 'Cats' },
        singular: { 'en-US': 'Cat' }
      },
      translationForms: 'singularPlural'
    },
    singularPluralModelValueRef: computed({
      get: () => ({
        plural: { 'en-US': 'Cats' },
        singular: { 'en-US': 'Cat' }
      }),
      set: (value) => {
        emit('update:modelValue', value)
      }
    }),
    singleModelValueRef: computed({
      get: () => ({}),
      set: () => {}
    }),
    summaryFieldRef: ref(null),
    toRef,
    useFaLocaleTranslationsInput: () => ({ id: 'single' }) as never,
    useFaLocaleTranslationsInputSingularPlural: () => singularPluralComposable as never
  })

  expect(wiring.activeComposable.value).toBe(singularPluralComposable)
  expect(wiring.resolvedTextareaRows.value).toBe(FA_LOCALE_TRANSLATIONS_INPUT_DEFAULT_TEXTAREA_ROWS)

  const focus = vi.fn()
  preferredLanguageInputRef.value = { focus } as unknown as import('quasar').QInput
  expect(wiring.readPreferredLanguageInputFocus()?.()).toBeUndefined()
  expect(focus).toHaveBeenCalled()

  wiring.setPreferredLanguageInputRef(document.createElement('input'))
  capturedViewWirings[1]!?.emitUpdate({ 'en-US': 'Updated' })
  expect(emit).toHaveBeenCalledWith('update:modelValue', {
    plural: { 'en-US': 'Updated' },
    singular: { 'en-US': 'Cat' }
  })
})

test('Test that createFaLocaleTranslationsInputRootActiveComposable reads trigger element from summary field', () => {
  const button = document.createElement('button')
  const summaryFieldRef = ref({
    readTranslationsButtonElement: () => button
  }) as never
  const capturedReadTrigger: Array<() => HTMLElement | null> = []
  const wiring = createFaLocaleTranslationsInputRootActiveComposable({
    computed,
    createFaLocaleTranslationsInputViewWiring: (deps) => {
      capturedReadTrigger.push(deps.readTriggerElement)
      return createFaLocaleTranslationsInputViewWiring(deps)
    },
    emit: vi.fn(),
    isSingularPluralForms: computed(() => false),
    preferredLanguageInputRef: ref(null),
    props: {
      ...baseProps,
      modelValue: { 'en-US': 'Name' }
    },
    singularPluralModelValueRef: computed({
      get: () => ({
        plural: {},
        singular: {}
      }),
      set: () => {}
    }),
    singleModelValueRef: computed(() => ({ 'en-US': 'Name' })),
    summaryFieldRef,
    toRef,
    useFaLocaleTranslationsInput: () => ({ id: 'single' }) as never,
    useFaLocaleTranslationsInputSingularPlural: () => ({ id: 'singularPlural' }) as never
  })

  expect(capturedReadTrigger[0]!?.()).toBe(button)
  expect(wiring.readPreferredLanguageInputFocus()).toBeNull()
})

test('Test that createFaLocaleTranslationsInputRootActiveComposable returns null trigger when summary field has no button', () => {
  const capturedReadTrigger: Array<() => HTMLElement | null> = []
  createFaLocaleTranslationsInputRootActiveComposable({
    computed,
    createFaLocaleTranslationsInputViewWiring: (deps) => {
      capturedReadTrigger.push(deps.readTriggerElement)
      return createFaLocaleTranslationsInputViewWiring(deps)
    },
    emit: vi.fn(),
    isSingularPluralForms: computed(() => false),
    preferredLanguageInputRef: ref(null),
    props: {
      ...baseProps,
      modelValue: { 'en-US': 'Name' }
    },
    singularPluralModelValueRef: computed({
      get: () => ({
        plural: {},
        singular: {}
      }),
      set: () => {}
    }),
    singleModelValueRef: computed(() => ({ 'en-US': 'Name' })),
    summaryFieldRef: ref({
      readTranslationsButtonElement: () => null
    }) as never,
    toRef,
    useFaLocaleTranslationsInput: () => ({ id: 'single' }) as never,
    useFaLocaleTranslationsInputSingularPlural: () => ({ id: 'singularPlural' }) as never
  })

  expect(capturedReadTrigger[0]!?.()).toBeNull()
})

test('Test that createFaLocaleTranslationsInputRootActiveComposable forwards singularPlural composable emits', () => {
  const emit = vi.fn()
  createFaLocaleTranslationsInputRootActiveComposable({
    computed,
    createFaLocaleTranslationsInputViewWiring: (deps) => createFaLocaleTranslationsInputViewWiring(deps),
    emit,
    isSingularPluralForms: computed(() => true),
    preferredLanguageInputRef: ref(null),
    props: {
      ...baseProps,
      modelValue: {
        plural: { 'en-US': 'Cats' },
        singular: { 'en-US': 'Cat' }
      },
      translationForms: 'singularPlural'
    },
    singularPluralModelValueRef: computed({
      get: () => ({
        plural: { 'en-US': 'Cats' },
        singular: { 'en-US': 'Cat' }
      }),
      set: () => {}
    }),
    singleModelValueRef: computed(() => ({})),
    summaryFieldRef: ref(null),
    toRef,
    useFaLocaleTranslationsInput: () => ({ id: 'single' }) as never,
    useFaLocaleTranslationsInputSingularPlural: (options) => {
      options.emitModelValue({
        plural: { 'en-US': 'Creatures' },
        singular: { 'en-US': 'Creature' }
      })
      return { id: 'singularPlural' } as never
    }
  })

  expect(emit).toHaveBeenCalledWith('update:modelValue', {
    plural: { 'en-US': 'Creatures' },
    singular: { 'en-US': 'Creature' }
  })
})

test('Test that createFaLocaleTranslationsInputRootActiveComposable wires singularPlural trigger element reads', () => {
  const button = document.createElement('button')
  const capturedReadTriggers: Array<() => HTMLElement | null> = []
  createFaLocaleTranslationsInputRootActiveComposable({
    computed,
    createFaLocaleTranslationsInputViewWiring: (deps) => {
      capturedReadTriggers.push(deps.readTriggerElement)
      return createFaLocaleTranslationsInputViewWiring(deps)
    },
    emit: vi.fn(),
    isSingularPluralForms: computed(() => true),
    preferredLanguageInputRef: ref(null),
    props: {
      ...baseProps,
      modelValue: {
        plural: { 'en-US': 'Cats' },
        singular: { 'en-US': 'Cat' }
      },
      translationForms: 'singularPlural'
    },
    singularPluralModelValueRef: computed(() => ({
      plural: { 'en-US': 'Cats' },
      singular: { 'en-US': 'Cat' }
    })),
    singleModelValueRef: computed(() => ({})),
    summaryFieldRef: ref({
      readTranslationsButtonElement: () => button
    }) as never,
    toRef,
    useFaLocaleTranslationsInput: () => ({ id: 'single' }) as never,
    useFaLocaleTranslationsInputSingularPlural: () => ({ id: 'singularPlural' }) as never
  })

  expect(capturedReadTriggers[1]!?.()).toBe(button)
})

/**
 * createFaLocaleTranslationsInputRootActiveComposable
 * Forwards window requestAnimationFrame into singular-plural composable options.
 */
test('Test that createFaLocaleTranslationsInputRootActiveComposable forwards requestAnimationFrame to singular plural composable', () => {
  const requestAnimationFrameSpy = vi
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback) => {
      const frameTime = 0
      callback(frameTime)
      return 1
    })
  let capturedRequestAnimationFrame: typeof window.requestAnimationFrame | undefined

  createFaLocaleTranslationsInputRootActiveComposable({
    computed,
    createFaLocaleTranslationsInputViewWiring: (deps) => createFaLocaleTranslationsInputViewWiring(deps),
    emit: vi.fn(),
    isSingularPluralForms: computed(() => true),
    preferredLanguageInputRef: ref(null),
    props: {
      ...baseProps,
      modelValue: {
        plural: { 'en-US': 'Cats' },
        singular: { 'en-US': 'Cat' }
      },
      translationForms: 'singularPlural'
    },
    singularPluralModelValueRef: computed(() => ({
      plural: { 'en-US': 'Cats' },
      singular: { 'en-US': 'Cat' }
    })),
    singleModelValueRef: computed(() => ({})),
    summaryFieldRef: ref(null),
    toRef,
    useFaLocaleTranslationsInput: () => ({ id: 'single' }) as never,
    useFaLocaleTranslationsInputSingularPlural: (options) => {
      capturedRequestAnimationFrame = options.requestAnimationFrame as typeof window.requestAnimationFrame
      return { id: 'singularPlural' } as never
    }
  })

  const frameCallback: FrameRequestCallback = (time) => {
    void time
  }
  capturedRequestAnimationFrame?.(frameCallback)
  expect(requestAnimationFrameSpy).toHaveBeenCalled()
  requestAnimationFrameSpy.mockRestore()
})
