import { computed, ref } from 'vue'
import { expect, test, vi } from 'vitest'

import type { I_faLocaleTranslationsInputComposableDeps } from 'app/types/I_faLocaleTranslationsInputComposable'

import { createFaLocaleTranslationsInputMenuState } from '../functions/createFaLocaleTranslationsInputMenuState'

function buildMenuStateTestDeps (): I_faLocaleTranslationsInputComposableDeps {
  return {
    FA_LOCALE_TRANSLATIONS_INPUT_MENU_MAX_HEIGHT_PX: 450,
    FA_LOCALE_TRANSLATIONS_INPUT_MENU_MAX_WIDTH_PX: 500,
    FA_LOCALE_TRANSLATIONS_INPUT_MENU_MIN_WIDTH_PX: 350,
    FA_LOCALE_TRANSLATIONS_INPUT_MENU_OFFSET_Y_PX: 4,
    FA_LOCALE_TRANSLATIONS_INPUT_MENU_VIEWPORT_MARGIN_PX: 16,
    buildFaLocaleTranslationsMenuContentStyle: () => ({ width: '100px' }),
    buildLocaleRows: () => [],
    computed,
    isFaLocaleStringTranslationUsingFallback: () => false,
    nextTick: async () => {},
    ref,
    resolveFaLocaleStringTranslation: () => '',
    resolveFaLocaleStringTranslationLanguageCode: () => null,
    resolveFaLocaleTranslationsMenuAnchorElement: () => null,
    resolveFaLocaleTranslationsMenuPresentation: () => ({
      maxHeightPx: 400,
      widthPx: 300
    }),
    scheduleFaLocaleTranslationsMenuInputFocus: vi.fn()
  }
}

test('Test that createFaLocaleTranslationsInputMenuState toggles menu open state', () => {
  const api = createFaLocaleTranslationsInputMenuState(buildMenuStateTestDeps(), {
    currentLanguageCode: ref('en-US'),
    emitModelValue: vi.fn(),
    inputMode: ref('singleLine'),
    modelValue: ref({}),
    readPreferredLanguageInputFocus: () => null,
    readTriggerElement: () => null,
    requestAnimationFrame: (callback) => {
      callback()
      return 1
    }
  })

  api.openTranslationsMenu()
  expect(api.translationsMenuOpen.value).toBe(true)

  api.openTranslationsMenu()
  expect(api.translationsMenuOpen.value).toBe(false)
})

test('Test that createFaLocaleTranslationsInputMenuState clears locked presentation on hide', () => {
  const deps = {
    ...buildMenuStateTestDeps(),
    resolveFaLocaleTranslationsMenuAnchorElement: (trigger: HTMLElement | null) => trigger
  }
  const api = createFaLocaleTranslationsInputMenuState(deps, {
    currentLanguageCode: ref('en-US'),
    emitModelValue: vi.fn(),
    inputMode: ref('singleLine'),
    modelValue: ref({}),
    readPreferredLanguageInputFocus: () => null,
    readTriggerElement: () => ({
      getBoundingClientRect: () => ({
        bottom: 100,
        height: 20,
        left: 0,
        right: 100,
        top: 80,
        width: 100,
        x: 0,
        y: 80
      })
    } as unknown as HTMLElement),
    requestAnimationFrame: (callback) => {
      callback()
      return 1
    }
  })

  api.onTranslationsMenuBeforeShow()
  expect(api.lockedMenuContentStyle.value).toEqual({ width: '100px' })

  api.onTranslationsMenuHide()
  expect(api.lockedMenuContentStyle.value).toBeUndefined()
})

test('Test that createFaLocaleTranslationsInputMenuState schedules focus on show', () => {
  const deps = buildMenuStateTestDeps()
  const focusMenuInput = vi.fn()
  const api = createFaLocaleTranslationsInputMenuState(deps, {
    currentLanguageCode: ref('en-US'),
    emitModelValue: vi.fn(),
    inputMode: ref('singleLine'),
    modelValue: ref({}),
    readPreferredLanguageInputFocus: () => focusMenuInput,
    readTriggerElement: () => null,
    requestAnimationFrame: (callback) => {
      callback()
      return 1
    }
  })

  api.onTranslationsMenuShow()
  expect(deps.scheduleFaLocaleTranslationsMenuInputFocus).toHaveBeenCalledTimes(1)
})

test('Test that createFaLocaleTranslationsInputMenuState skips focus when preferred input is unavailable', () => {
  const deps = buildMenuStateTestDeps()
  let capturedFocusMenuInput: (() => void) | undefined
  deps.scheduleFaLocaleTranslationsMenuInputFocus = (scheduleDeps) => {
    capturedFocusMenuInput = scheduleDeps.focusMenuInput
  }
  const api = createFaLocaleTranslationsInputMenuState(deps, {
    currentLanguageCode: ref('en-US'),
    emitModelValue: vi.fn(),
    inputMode: ref('singleLine'),
    modelValue: ref({}),
    readPreferredLanguageInputFocus: () => null,
    readTriggerElement: () => null,
    requestAnimationFrame: (callback) => {
      callback()
      return 1
    }
  })

  api.onTranslationsMenuShow()
  expect(capturedFocusMenuInput).toBeDefined()
  capturedFocusMenuInput?.()
})

test('Test that createFaLocaleTranslationsInputMenuState invokes preferred focus when available', () => {
  const deps = buildMenuStateTestDeps()
  const focusPreferred = vi.fn()
  let capturedFocusMenuInput: (() => void) | undefined
  deps.scheduleFaLocaleTranslationsMenuInputFocus = (scheduleDeps) => {
    capturedFocusMenuInput = scheduleDeps.focusMenuInput
  }
  createFaLocaleTranslationsInputMenuState(deps, {
    currentLanguageCode: ref('en-US'),
    emitModelValue: vi.fn(),
    inputMode: ref('singleLine'),
    modelValue: ref({}),
    readPreferredLanguageInputFocus: () => focusPreferred,
    readTriggerElement: () => null,
    requestAnimationFrame: (callback) => {
      callback()
      return 1
    }
  }).onTranslationsMenuShow()

  capturedFocusMenuInput?.()
  expect(focusPreferred).toHaveBeenCalledTimes(1)
})

test('Test that createFaLocaleTranslationsInputMenuState skips lock when anchor is missing', () => {
  const api = createFaLocaleTranslationsInputMenuState(buildMenuStateTestDeps(), {
    currentLanguageCode: ref('en-US'),
    emitModelValue: vi.fn(),
    inputMode: ref('singleLine'),
    modelValue: ref({}),
    readPreferredLanguageInputFocus: () => null,
    readTriggerElement: () => null,
    requestAnimationFrame: (callback) => {
      callback()
      return 1
    }
  })

  api.lockMenuPresentation()
  expect(api.lockedMenuContentStyle.value).toBeUndefined()
})

test('Test that createFaLocaleTranslationsInputMenuState skips sync on reopen toggle', () => {
  const resolveAnchor = vi.fn(() => null)
  const deps = {
    ...buildMenuStateTestDeps(),
    resolveFaLocaleTranslationsMenuAnchorElement: resolveAnchor
  }
  const api = createFaLocaleTranslationsInputMenuState(deps, {
    currentLanguageCode: ref('en-US'),
    emitModelValue: vi.fn(),
    inputMode: ref('singleLine'),
    modelValue: ref({}),
    readPreferredLanguageInputFocus: () => null,
    readTriggerElement: () => null,
    requestAnimationFrame: (callback) => {
      callback()
      return 1
    }
  })

  api.openTranslationsMenu()
  expect(resolveAnchor).toHaveBeenCalledTimes(1)

  resolveAnchor.mockClear()
  api.openTranslationsMenu()
  expect(resolveAnchor).not.toHaveBeenCalled()
})
