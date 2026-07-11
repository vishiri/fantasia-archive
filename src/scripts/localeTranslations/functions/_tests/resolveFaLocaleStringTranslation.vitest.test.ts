import { expect, test, vi } from 'vitest'

import { FA_USER_SETTINGS_LANGUAGE_CODES } from 'app/types/faUserSettingsLanguageRegistry'

import {
  hasFaLocaleStringTranslation,
  resolveFaLocaleStringTranslation,
  resolveFaLocaleStringTranslationForStorage,
  resolveFaLocaleStringTranslationLanguageCode
} from '../../faLocaleStringTranslations_manager'
import { isFaLocaleStringTranslationUsingFallback } from '../isFaLocaleStringTranslationUsingFallback'
import { createNormalizeFaLocaleStringTranslations } from '../normalizeFaLocaleStringTranslations'
import { resolveFaLocaleTranslationsMenuAnchorElement } from '../resolveFaLocaleTranslationsMenuAnchorElement'
import { buildFaLocaleTranslationsMenuContentStyle, resolveFaLocaleTranslationsMenuPresentation } from '../resolveFaLocaleTranslationsMenuPresentation'
import { scheduleFaLocaleTranslationsMenuInputFocus } from '../scheduleFaLocaleTranslationsMenuInputFocus'

const normalizeFaLocaleStringTranslations = createNormalizeFaLocaleStringTranslations({
  languageCodes: FA_USER_SETTINGS_LANGUAGE_CODES,
  maxLength: 120
})

test('Test that resolveFaLocaleStringTranslation returns preferred language when present', () => {
  const translations = {
    'en-US': 'English',
    de: 'German'
  }
  expect(resolveFaLocaleStringTranslation(translations, 'de')).toBe('German')
  expect(resolveFaLocaleStringTranslationLanguageCode(translations, 'de')).toBe('de')
})

test('Test that resolveFaLocaleStringTranslation falls back to en-US', () => {
  const translations = {
    'en-US': 'English',
    de: ''
  }
  expect(resolveFaLocaleStringTranslation(translations, 'de')).toBe('English')
  expect(resolveFaLocaleStringTranslationLanguageCode(translations, 'de')).toBe('en-US')
})

test('Test that resolveFaLocaleStringTranslation scans remaining codes alphabetically', () => {
  const translations = {
    fr: 'French',
    de: 'German'
  }
  expect(resolveFaLocaleStringTranslation(translations, 'ja')).toBe('German')
})

test('Test that resolveFaLocaleStringTranslation returns empty when no translations exist', () => {
  expect(resolveFaLocaleStringTranslation({}, 'en-US')).toBe('')
})

test('Test that hasFaLocaleStringTranslation detects any non-empty locale', () => {
  expect(hasFaLocaleStringTranslation({ de: '  ' })).toBe(false)
  expect(hasFaLocaleStringTranslation({ de: ' Name ' })).toBe(true)
})

test('Test that resolveFaLocaleStringTranslationForStorage uses en-US fallback chain', () => {
  const translations = {
    de: 'German only'
  }
  expect(resolveFaLocaleStringTranslationForStorage(translations)).toBe('German only')
})

test('Test that normalizeFaLocaleStringTranslations trims and drops empty keys', () => {
  expect(normalizeFaLocaleStringTranslations({
    'en-US': '  Race  ',
    de: '   '
  })).toEqual({
    'en-US': 'Race'
  })
})

test('Test that isFaLocaleStringTranslationUsingFallback is true when another locale supplies text', () => {
  expect(isFaLocaleStringTranslationUsingFallback({
    currentLanguageCode: 'de',
    resolveLanguageCode: resolveFaLocaleStringTranslationLanguageCode,
    translations: {
      'en-US': 'English'
    }
  })).toBe(true)
})

test('Test that resolveFaLocaleTranslationsMenuPresentation uses configured max width when viewport allows', () => {
  const presentation = resolveFaLocaleTranslationsMenuPresentation({
    anchorRect: {
      bottom: 200,
      height: 40,
      left: 100,
      right: 700,
      top: 160,
      width: 600,
      x: 100,
      y: 160
    } as DOMRectReadOnly,
    maxHeightPx: 450,
    maxWidthPx: 500,
    viewportHeightPx: 900,
    viewportMarginPx: 16,
    viewportWidthPx: 1200
  })

  expect(presentation).toEqual({
    maxHeightPx: 450,
    widthPx: 500
  })
})

test('Test that resolveFaLocaleTranslationsMenuPresentation enforces minimum menu width', () => {
  const presentation = resolveFaLocaleTranslationsMenuPresentation({
    anchorRect: {
      bottom: 200,
      height: 40,
      left: 100,
      right: 220,
      top: 160,
      width: 120,
      x: 100,
      y: 160
    } as DOMRectReadOnly,
    maxHeightPx: 450,
    maxWidthPx: 500,
    minWidthPx: 350,
    viewportHeightPx: 900,
    viewportMarginPx: 16,
    viewportWidthPx: 1200
  })

  expect(presentation.widthPx).toBe(350)
})

test('Test that resolveFaLocaleTranslationsMenuPresentation keeps singular plural minimum width above narrow anchor', () => {
  const presentation = resolveFaLocaleTranslationsMenuPresentation({
    anchorRect: {
      bottom: 200,
      height: 40,
      left: 100,
      right: 280,
      top: 160,
      width: 180,
      x: 100,
      y: 160
    } as DOMRectReadOnly,
    maxHeightPx: 450,
    maxWidthPx: 700,
    minWidthPx: 650,
    viewportHeightPx: 900,
    viewportMarginPx: 16,
    viewportWidthPx: 1200
  })

  expect(presentation.widthPx).toBe(650)
})

test('Test that buildFaLocaleTranslationsMenuContentStyle emits locked menu CSS variables', () => {
  expect(buildFaLocaleTranslationsMenuContentStyle({
    maxHeightPx: 420,
    widthPx: 360
  })).toEqual({
    '--fa-locale-translations-menu-max-height': '420px',
    '--fa-locale-translations-menu-width': '360px',
    maxHeight: '420px',
    maxWidth: '360px',
    minWidth: '360px',
    width: '360px'
  })
})

test('Test that resolveFaLocaleTranslationsMenuAnchorElement returns null for missing trigger', () => {
  expect(resolveFaLocaleTranslationsMenuAnchorElement(null)).toBe(null)
})

test('Test that resolveFaLocaleTranslationsMenuAnchorElement prefers q-field host', () => {
  const field = { marker: 'field' }
  const trigger = {
    closest: () => field
  } as unknown as HTMLElement
  expect(resolveFaLocaleTranslationsMenuAnchorElement(trigger)).toBe(field)
})

test('Test that resolveFaLocaleTranslationsMenuAnchorElement falls back to trigger element', () => {
  const trigger = {
    closest: () => null
  } as unknown as HTMLElement
  expect(resolveFaLocaleTranslationsMenuAnchorElement(trigger)).toBe(trigger)
})

test('Test that faLocaleStringTranslations_manager exports wired resolver helpers', () => {
  expect(resolveFaLocaleStringTranslation({ 'en-US': 'Title' }, 'en-US')).toBe('Title')
  expect(hasFaLocaleStringTranslation({ de: 'Name' })).toBe(true)
  expect(resolveFaLocaleStringTranslationLanguageCode({ de: 'Name' }, 'en-US')).toBe('de')
  expect(resolveFaLocaleStringTranslationForStorage({ de: 'Name' })).toBe('Name')
})

test('Test that scheduleFaLocaleTranslationsMenuInputFocus focuses menu input after ticks', async () => {
  const focusMenuInput = vi.fn()
  const rafCallbacks: Array<() => void> = []
  scheduleFaLocaleTranslationsMenuInputFocus({
    focusMenuInput,
    nextTick: async () => {},
    requestAnimationFrame: (callback) => {
      rafCallbacks.push(callback)
      return 1
    }
  })
  await Promise.resolve()
  expect(focusMenuInput).toHaveBeenCalledTimes(1)
  rafCallbacks[0]!?.()
  await Promise.resolve()
  expect(focusMenuInput).toHaveBeenCalledTimes(2)
})

test('Test that scheduleFaLocaleTranslationsMenuInputFocus logs when nextTick rejects', async () => {
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const focusMenuInput = vi.fn()
  scheduleFaLocaleTranslationsMenuInputFocus({
    focusMenuInput,
    nextTick: () => Promise.reject(new Error('nextTick failed')),
    requestAnimationFrame: vi.fn()
  })
  await vi.waitFor(() => {
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[faLocaleTranslations] nextTick chain failed',
      expect.any(Error)
    )
  })
  expect(focusMenuInput).not.toHaveBeenCalled()
  consoleErrorSpy.mockRestore()
})

test('Test that resolveFaLocaleTranslationsMenuPresentation uses built-in defaults when optional sizes omitted', () => {
  const presentation = resolveFaLocaleTranslationsMenuPresentation({
    anchorRect: {
      bottom: 400,
      height: 40,
      left: 40,
      right: 640,
      top: 360,
      width: 600,
      x: 40,
      y: 360
    } as DOMRectReadOnly,
    viewportHeightPx: 900,
    viewportWidthPx: 1200
  })

  expect(presentation).toEqual({
    maxHeightPx: 450,
    widthPx: 500
  })
})

test('Test that resolveFaLocaleTranslationsMenuPresentation never exceeds global menu max height', () => {
  const presentation = resolveFaLocaleTranslationsMenuPresentation({
    anchorRect: {
      bottom: 100,
      height: 40,
      left: 40,
      right: 240,
      top: 60,
      width: 200,
      x: 40,
      y: 60
    } as DOMRectReadOnly,
    maxHeightPx: 9999,
    viewportHeightPx: 2000,
    viewportMarginPx: 16,
    viewportWidthPx: 1200
  })

  expect(presentation.maxHeightPx).toBe(450)
})
