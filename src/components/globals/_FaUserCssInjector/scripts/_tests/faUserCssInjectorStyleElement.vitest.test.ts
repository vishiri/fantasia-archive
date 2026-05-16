/** @vitest-environment jsdom */

import { afterEach, expect, test } from 'vitest'

import {
  applyFaUserCssToStyleElementIfNeeded,
  ensureFaUserCssStyleElementInHead
} from '../faUserCssInjectorStyleElement'

const STYLE_ID = 'faUserCssInjectorStyleHelpersVitest'

afterEach(() => {
  ;[...document.querySelectorAll(`#${STYLE_ID}`)].forEach((node) => {
    node.remove()
  })
})

test('Test ensureFaUserCssStyleElementInHead returns null without document-like root', () => {
  expect(ensureFaUserCssStyleElementInHead(undefined, STYLE_ID)).toBeNull()
})

test('Test ensureFaUserCssStyleElementInHead creates annotated style on first run', () => {
  const style = ensureFaUserCssStyleElementInHead(document, STYLE_ID)

  expect(style).not.toBeNull()
  expect(style!.tagName.toLowerCase()).toBe('style')
  expect(style!.getAttribute('type')).toBe('text/css')
  expect(style!.getAttribute('data-fa-user-css')).toBe('true')
})

test('Test ensureFaUserCssStyleElementInHead reuses the same DOM node once created', () => {
  expect(ensureFaUserCssStyleElementInHead(document, STYLE_ID)).toBe(
    ensureFaUserCssStyleElementInHead(document, STYLE_ID)
  )
})

test('Test applyFaUserCssToStyleElementIfNeeded skips null nodes silently', () => {
  applyFaUserCssToStyleElementIfNeeded(null, '{}')
})

test('Test applyFaUserCssToStyleElementIfNeeded skips when text already matches', () => {
  const style = ensureFaUserCssStyleElementInHead(document, STYLE_ID)!
  applyFaUserCssToStyleElementIfNeeded(style, '{ a: b }')

  applyFaUserCssToStyleElementIfNeeded(style, '{ a: b }')
  expect(style.textContent).toBe('{ a: b }')
})

test('Test applyFaUserCssToStyleElementIfNeeded assigns when payloads differ', () => {
  const style = ensureFaUserCssStyleElementInHead(document, STYLE_ID)!
  applyFaUserCssToStyleElementIfNeeded(style, 'alpha')
  applyFaUserCssToStyleElementIfNeeded(style, 'beta')
  expect(style.textContent).toBe('beta')
})
