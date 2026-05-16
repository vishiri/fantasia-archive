/** @vitest-environment jsdom */

import { afterEach, expect, test } from 'vitest'

import {
  ensureProjectUserCssStyleElementInHead,
  FA_PROJECT_USER_CSS_ELEMENT_ID,
  faProjectUserCssHeadIsUnset,
  repositionProjectStyleAfterAppCss
} from '../faProjectUserCssStyleElement'

afterEach(() => {
  ;[...document.querySelectorAll(`#${FA_PROJECT_USER_CSS_ELEMENT_ID}`)].forEach((node) => {
    node.remove()
  })
  ;[...document.querySelectorAll('#faUserCss')].forEach((node) => {
    node.remove()
  })
})

test('Test faProjectUserCssHeadIsUnset flags documents without an attached head', () => {
  expect(faProjectUserCssHeadIsUnset({ head: undefined })).toBe(true)
  expect(faProjectUserCssHeadIsUnset({ head: null })).toBe(true)
  expect(
    faProjectUserCssHeadIsUnset({
      head: document.head
    })
  ).toBe(false)
})

test('repositionProjectStyleAfterAppCss leaves stylesheet nodes untouched when document.head adapters are falsy', () => {
  const el = document.createElement('style')
  const docStub = {
    getElementById: (): null => {
      return null
    },

    head: undefined
  } as unknown as Pick<Document, 'getElementById' | 'head'>

  repositionProjectStyleAfterAppCss(docStub, el)
})

test('Test ensureProjectUserCssStyleElementInHead returns null without document-like root', () => {
  expect(ensureProjectUserCssStyleElementInHead(undefined)).toBeNull()
})

test('Test ensureProjectUserCssStyleElementInHead creates annotated style element on first run', () => {
  const style = ensureProjectUserCssStyleElementInHead(document)
  expect(style).not.toBeNull()
  expect(style!.tagName.toLowerCase()).toBe('style')
  expect(style!.getAttribute('type')).toBe('text/css')
  expect(style!.getAttribute('data-fa-project-user-css')).toBe('true')
  expect(style!.id).toBe(FA_PROJECT_USER_CSS_ELEMENT_ID)
})

test('Test ensureProjectUserCssStyleElementInHead reuses the same DOM node once created', () => {
  const a = ensureProjectUserCssStyleElementInHead(document)
  const b = ensureProjectUserCssStyleElementInHead(document)
  expect(a).toBe(b)
})

test('Test project style is inserted after anchor style#faUserCss when anchor lives in document.head', () => {
  const appCss = document.createElement('style')
  appCss.id = 'faUserCss'
  document.head.appendChild(appCss)

  const projectCss = ensureProjectUserCssStyleElementInHead(document)
  expect(projectCss).not.toBeNull()

  const children = [...document.head.children]
  expect(children.indexOf(appCss)).toBeGreaterThan(-1)
  expect(children.indexOf(projectCss as HTMLStyleElement)).toBe(children.indexOf(appCss) + 1)

  document.head.removeChild(appCss)
  document.head.removeChild(projectCss as HTMLStyleElement)
})
