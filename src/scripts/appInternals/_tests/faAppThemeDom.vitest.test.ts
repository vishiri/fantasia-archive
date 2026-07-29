import { afterEach, expect, test, vi } from 'vitest'

import {
  applyFaAppThemeToDocument,
  FA_APP_THEME_BODY_CLASS_PREFIX,
  FA_APP_THEME_BODY_DARK_CLASS,
  FA_APP_THEME_BODY_DATASET_KEY,
  FA_APP_THEME_BODY_LIGHT_CLASS
} from '../faAppThemeApplyWiring'
import {
  resolveFaAppThemeIsDark,
  resolveFaAppThemeSkin
} from '../functions/faAppThemeDom'

const darkSetMock = vi.hoisted(() => vi.fn())

vi.mock('quasar', () => {
  return {
    Dark: {
      set: darkSetMock
    }
  }
})

type T_mockBody = {
  classList: {
    add: ReturnType<typeof vi.fn>
    remove: ReturnType<typeof vi.fn>
    [Symbol.iterator]: () => Iterator<string>
  }
  dataset: Record<string, string>
}

function createMockBody (existingClasses: string[] = []): T_mockBody {
  const classes = new Set(existingClasses)
  return {
    classList: {
      add: vi.fn((className: string) => {
        classes.add(className)
      }),
      remove: vi.fn((className: string) => {
        classes.delete(className)
      }),
      [Symbol.iterator]: () => classes.values()
    },
    dataset: {}
  }
}

/**
 * resolveFaAppThemeIsDark
 * Dark theme ids start with dark; light theme ids start with light.
 */
test('Test that resolveFaAppThemeIsDark maps dark ids to true and light ids to false', () => {
  expect(resolveFaAppThemeIsDark('darkThemeFantasy')).toBe(true)
  expect(resolveFaAppThemeIsDark('darkThemeFlat')).toBe(true)
  expect(resolveFaAppThemeIsDark('lightThemeFantasy')).toBe(false)
  expect(resolveFaAppThemeIsDark('lightThemeFlat')).toBe(false)
})

/**
 * resolveFaAppThemeSkin
 * Fantasy and flat theme ids map to skin class tokens.
 */
test('Test that resolveFaAppThemeSkin maps Fantasy and Flat ids', () => {
  expect(resolveFaAppThemeSkin('darkThemeFantasy')).toBe('fantasy')
  expect(resolveFaAppThemeSkin('lightThemeFantasy')).toBe('fantasy')
  expect(resolveFaAppThemeSkin('darkThemeFlat')).toBe('flat')
  expect(resolveFaAppThemeSkin('lightThemeFlat')).toBe('flat')
})

/**
 * applyFaAppThemeToDocument
 * Writes skin class, full-id data attribute, body dark/light, and Quasar Dark.
 * Fantasy vs flat ripple visibility is CSS under body.fa-appTheme--* (not Dark).
 */
test('Test that applyFaAppThemeToDocument sets skin class data and Dark mode', () => {
  const body = createMockBody([`${FA_APP_THEME_BODY_CLASS_PREFIX}flat`])
  vi.stubGlobal('document', { body })
  darkSetMock.mockReset()

  applyFaAppThemeToDocument('darkThemeFantasy')

  expect(body.classList.remove).toHaveBeenCalledWith(`${FA_APP_THEME_BODY_CLASS_PREFIX}flat`)
  expect(body.classList.add).toHaveBeenCalledWith(`${FA_APP_THEME_BODY_CLASS_PREFIX}fantasy`)
  expect(body.classList.add).toHaveBeenCalledWith(FA_APP_THEME_BODY_DARK_CLASS)
  expect(body.classList.remove).toHaveBeenCalledWith(FA_APP_THEME_BODY_LIGHT_CLASS)
  expect(body.dataset[FA_APP_THEME_BODY_DATASET_KEY]).toBe('darkThemeFantasy')
  expect(darkSetMock).toHaveBeenCalledWith(true)
})

/**
 * applyFaAppThemeToDocument
 * Invalid theme ids fall back to the default dark fantasy theme.
 */
test('Test that applyFaAppThemeToDocument falls back to darkThemeFantasy for invalid ids', () => {
  const body = createMockBody()
  vi.stubGlobal('document', { body })
  darkSetMock.mockReset()

  applyFaAppThemeToDocument('notATheme')

  expect(body.classList.add).toHaveBeenCalledWith(`${FA_APP_THEME_BODY_CLASS_PREFIX}fantasy`)
  expect(body.dataset[FA_APP_THEME_BODY_DATASET_KEY]).toBe('darkThemeFantasy')
  expect(darkSetMock).toHaveBeenCalledWith(true)
})

/**
 * applyFaAppThemeToDocument
 * Light flat themes turn Quasar Dark off and set body--light.
 */
test('Test that applyFaAppThemeToDocument applies light flat skin and body--light', () => {
  const body = createMockBody([FA_APP_THEME_BODY_DARK_CLASS])
  vi.stubGlobal('document', { body })
  darkSetMock.mockReset()

  applyFaAppThemeToDocument('lightThemeFlat')

  expect(darkSetMock).toHaveBeenCalledWith(false)
  expect(body.classList.add).toHaveBeenCalledWith(`${FA_APP_THEME_BODY_CLASS_PREFIX}flat`)
  expect(body.classList.add).toHaveBeenCalledWith(FA_APP_THEME_BODY_LIGHT_CLASS)
  expect(body.classList.remove).toHaveBeenCalledWith(FA_APP_THEME_BODY_DARK_CLASS)
  expect(body.dataset[FA_APP_THEME_BODY_DATASET_KEY]).toBe('lightThemeFlat')
})

/**
 * applyFaAppThemeToDocument
 * No-ops when document is unavailable.
 */
test('Test that applyFaAppThemeToDocument skips when document is undefined', () => {
  vi.stubGlobal('document', undefined)
  darkSetMock.mockReset()

  expect(() => {
    applyFaAppThemeToDocument('darkThemeFantasy')
  }).not.toThrow()
  expect(darkSetMock).not.toHaveBeenCalled()
})

afterEach(() => {
  vi.unstubAllGlobals()
})
