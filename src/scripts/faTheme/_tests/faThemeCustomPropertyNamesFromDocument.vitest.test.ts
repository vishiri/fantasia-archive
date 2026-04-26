// @vitest-environment jsdom

import { afterEach, expect, test, vi } from 'vitest'

const { faThemeScssFixture } = vi.hoisted((): { faThemeScssFixture: string } => {
  const { readFileSync: rf } = require('node:fs') as typeof import('node:fs')
  const { dirname: dn, join: jn } = require('node:path') as typeof import('node:path')
  const { fileURLToPath: fup } = require('node:url') as typeof import('node:url')
  const p = jn(
    dn(fup(import.meta.url)),
    '../../../css/fa-theme.scss'
  )
  return {
    faThemeScssFixture: rf(p, 'utf8')
  }
})

vi.mock('app/src/css/fa-theme.scss?raw', () => {
  return {
    default: faThemeScssFixture
  }
})

import * as fromDocument from 'app/src/scripts/faTheme/faThemeCustomPropertyNamesFromDocument'
import { collectFaColorCustomPropertyNamesFromDocument } from 'app/src/scripts/faTheme/faThemeCustomPropertyNamesFromDocument'
import { getFaColorCustomPropertyNamesForHelpPanel } from 'app/src/scripts/faTheme/faThemeCustomPropertyNames'

const appended: HTMLStyleElement[] = []

const styleSheetsDefaultDesc = Object.getOwnPropertyDescriptor(
  /**
   * `document` in jsdom should inherit `styleSheets` from a prototype the runtime owns.
   */
  Object.getPrototypeOf(document),
  'styleSheets'
) ?? Object.getOwnPropertyDescriptor(
  /**
   * Fall back in case a jsdom build pins `styleSheets` on the instance.
   */
  document,
  'styleSheets'
)

function restoreDefaultStyleSheets (): void {
  if (styleSheetsDefaultDesc) {
    const owner = 'get' in styleSheetsDefaultDesc && 'set' in styleSheetsDefaultDesc
      ? Object.getPrototypeOf(document)
      : document
    Object.defineProperty(owner, 'styleSheets', styleSheetsDefaultDesc)
  }
}

afterEach(() => {
  for (const el of appended) {
    el.remove()
  }
  appended.length = 0
  vi.restoreAllMocks()
  restoreDefaultStyleSheets()
})

function appendStyle (cssText: string): void {
  const s = document.createElement('style')
  s.append(document.createTextNode(cssText))
  document.head.append(s)
  appended.push(s)
}

/**
 * collectFaColorCustomPropertyNamesFromDocument
 * Reads **`--fa-color-*`** property names (not values) from live `CSSStyleRule` text.
 */
test('Test that collectFaColorCustomPropertyNamesFromDocument lists --fa-color- names from :root in a style element', () => {
  appendStyle(':root { --fa-color-xyz-dev-only: 1; --unrelated: 2; }')
  expect(collectFaColorCustomPropertyNamesFromDocument()).toContain('--fa-color-xyz-dev-only')
  expect(collectFaColorCustomPropertyNamesFromDocument()).not.toContain('--unrelated')
})

/**
 * collectFaColorCustomPropertyNamesFromDocument
 * Rules with a `styleSheet` (for example `CSSImportRule` in a browser) recurse into the nested sheet.
 */
test('Test that collectFaColorCustomPropertyNamesFromDocument follows a nested styleSheet on a rule', () => {
  appendStyle(':root { --fa-color-duck-nested: 1; }')
  const targetSheet = appended[0]?.sheet
  if (!targetSheet) {
    throw new Error('expected sheet')
  }
  const fakeImportShape = { styleSheet: targetSheet } as unknown as CSSRule
  const ruleList = {
    length: 1,
    0: fakeImportShape,
    item: (i: number) => (i === 0 ? fakeImportShape : null)
  } as unknown as CSSRuleList
  const topSheet = { get cssRules () { return ruleList } } as unknown as CSSStyleSheet
  const sheetList = {
    length: 1,
    0: topSheet,
    item: (i: number) => (i === 0 ? topSheet : null)
  } as unknown as StyleSheetList
  const owner = styleSheetsDefaultDesc
    ? Object.getPrototypeOf(document)
    : document
  Object.defineProperty(owner, 'styleSheets', {
    configurable: true,
    enumerable: true,
    value: sheetList
  })
  expect(collectFaColorCustomPropertyNamesFromDocument()).toContain('--fa-color-duck-nested')
})

/**
 * collectFaColorCustomPropertyNamesFromDocument
 * Nested at-rules (for example a media block) are walked.
 */
test('Test that collectFaColorCustomPropertyNamesFromDocument walks rules inside a media block', () => {
  appendStyle(
    [
      '@media screen {',
      '  :root { --fa-color-in-media: 0; }',
      '}'
    ].join(' ')
  )
  expect(collectFaColorCustomPropertyNamesFromDocument()).toContain('--fa-color-in-media')
})

/**
 * collectFaColorCustomPropertyNamesFromDocument
 * A rare engine quirk can expose a hole in `cssRule` lists; null entries are ignored.
 */
test('Test that collectFaColorCustomPropertyNamesFromDocument skips a null entry in a rule list', () => {
  const nullList = {
    length: 1,
    0: null,
    item: (i: number) => (i === 0 ? null : null)
  } as unknown as CSSRuleList
  const topSheet = { get cssRules () { return nullList } } as unknown as CSSStyleSheet
  const sheetList = {
    length: 1,
    0: topSheet,
    item: (i: number) => (i === 0 ? topSheet : null)
  } as unknown as StyleSheetList
  const owner = styleSheetsDefaultDesc
    ? Object.getPrototypeOf(document)
    : document
  Object.defineProperty(owner, 'styleSheets', {
    configurable: true,
    enumerable: true,
    value: sheetList
  })
  expect(collectFaColorCustomPropertyNamesFromDocument()).toEqual([])
})

/**
 * collectFaColorCustomPropertyNamesFromDocument
 * Skips style sheets you cannot read (the same CORS `cssRules` access shape browsers throw on).
 */
test('Test that collectFaColorCustomPropertyNamesFromDocument skips a stylesheet that throws on cssRules', () => {
  appendStyle(':root { --fa-color-ok-skip: 1; }')
  const good = appended[0]?.sheet
  if (!good) {
    throw new Error('expected sheet')
  }
  const bad = {
    get cssRules () {
      throw new Error('cors')
    }
  } as unknown as CSSStyleSheet
  const list = {
    length: 2,
    0: bad,
    1: good,
    item: (i: number) => (i === 0 ? bad : good)
  } as unknown as StyleSheetList
  const owner = styleSheetsDefaultDesc
    ? Object.getPrototypeOf(document)
    : document
  Object.defineProperty(owner, 'styleSheets', {
    configurable: true,
    enumerable: true,
    value: list
  })
  expect(collectFaColorCustomPropertyNamesFromDocument()).toContain('--fa-color-ok-skip')
})

/**
 * collectFaColorCustomPropertyNamesFromDocument
 * When a nested at-rule that normally exposes `cssRules` throws, the walk ignores that block.
 */
test('Test that collectFaColorCustomPropertyNamesFromDocument swallows a media block whose cssRules cannot be read', () => {
  appendStyle(
    [
      '@media screen {',
      '  :root { --fa-color-media-unreadable: 1; }',
      '}'
    ].join(' ')
  )
  const good = appended[0]?.sheet
  if (!good) {
    throw new Error('expected sheet')
  }
  const r0 = good.cssRules[0] as CSSMediaRule
  if (!r0 || r0.cssRules.length < 1) {
    return
  }
  Object.defineProperty(r0, 'cssRules', {
    configurable: true,
    get () {
      throw new Error('unreadable')
    }
  })
  expect(() => collectFaColorCustomPropertyNamesFromDocument()).not.toThrow()
})

/**
 * getFaColorCustomPropertyNamesForHelpPanel
 * Prefers a non-empty DOM list over the `?raw` parse when the page already has `--fa-color-*` rules.
 */
test('Test that getFaColorCustomPropertyNamesForHelpPanel prefers the DOM list when it is non-empty', () => {
  appendStyle(':root { --fa-color-unique-scanner-test-001: 1; }')
  const fromDom = getFaColorCustomPropertyNamesForHelpPanel()
  expect(fromDom).toContain('--fa-color-unique-scanner-test-001')
  expect(fromDom.length).toBeGreaterThan(0)
})

/**
 * getFaColorCustomPropertyNamesForHelpPanel
 * When the DOM has no matching rules yet, falls back to the `fa-theme.scss` source parse.
 */
test('Test that getFaColorCustomPropertyNamesForHelpPanel uses the scss list when the DOM scan is empty', () => {
  vi.spyOn(fromDocument, 'collectFaColorCustomPropertyNamesFromDocument').mockReturnValue([])
  const fromFallback = getFaColorCustomPropertyNamesForHelpPanel()
  expect(fromFallback.length).toBeGreaterThan(20)
  expect(fromFallback).toContain('--fa-color-accent')
  expect(fromFallback).toContain('--fa-color-primary')
  expect(fromFallback).toContain('--fa-color-tooltip-background')
})
