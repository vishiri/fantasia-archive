import { afterEach, expect, test, vi } from 'vitest'

import {
  applyFaInterfaceTextDirectionFromLanguageCode,
  resolveFaInterfaceTextDirectionFromLanguageCode
} from '../functions/faInterfaceTextDirection'

type T_mockHtmlElement = {
  dir: string
  style: {
    direction: string
  }
}

function createMockDocumentElement (): T_mockHtmlElement {
  return {
    dir: '',
    style: {
      direction: ''
    }
  }
}

/**
 * resolveFaInterfaceTextDirectionFromLanguageCode
 * Arabic uses right-to-left layout; other locales stay left-to-right.
 */
test('Test that resolveFaInterfaceTextDirectionFromLanguageCode maps ar to rtl and others to ltr', () => {
  expect(resolveFaInterfaceTextDirectionFromLanguageCode('ar')).toBe('rtl')
  expect(resolveFaInterfaceTextDirectionFromLanguageCode('en-US')).toBe('ltr')
  expect(resolveFaInterfaceTextDirectionFromLanguageCode('fr')).toBe('ltr')
})

/**
 * applyFaInterfaceTextDirectionFromLanguageCode
 * Writes dir and inline direction on the documentElement when document exists.
 */
test('Test that applyFaInterfaceTextDirectionFromLanguageCode sets html direction for ar and ltr otherwise', () => {
  const html = createMockDocumentElement()
  vi.stubGlobal('document', { documentElement: html })

  applyFaInterfaceTextDirectionFromLanguageCode('ar')
  expect(html.dir).toBe('rtl')
  expect(html.style.direction).toBe('rtl')

  applyFaInterfaceTextDirectionFromLanguageCode('de')
  expect(html.dir).toBe('ltr')
  expect(html.style.direction).toBe('ltr')

  vi.unstubAllGlobals()
})

/**
 * applyFaInterfaceTextDirectionFromLanguageCode
 * No-ops when document is unavailable (SSR / Node harness).
 */
test('Test that applyFaInterfaceTextDirectionFromLanguageCode skips when document is undefined', () => {
  vi.stubGlobal('document', undefined)

  expect(() => {
    applyFaInterfaceTextDirectionFromLanguageCode('ar')
  }).not.toThrow()

  vi.unstubAllGlobals()
})

afterEach(() => {
  vi.unstubAllGlobals()
})
