import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, expect, test } from 'vitest'

import { S_FaProgramStyling } from 'app/src/stores/S_FaProgramStyling'

import FaUserCssInjector from '../FaUserCssInjector.vue'

const FA_USER_CSS_STYLE_ELEMENT_ID = 'faUserCss'

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  const lingering = document.getElementById(FA_USER_CSS_STYLE_ELEMENT_ID)
  if (lingering !== null && lingering.parentNode !== null) {
    lingering.parentNode.removeChild(lingering)
  }
})

/**
 * FaUserCssInjector
 * Mounting the component should append exactly one 'style#faUserCss' element to the document head with the current store css value.
 */
test('Test that FaUserCssInjector creates a style#faUserCss element on mount with the current store css', async () => {
  const store = S_FaProgramStyling()
  store.css = '.fa-test { color: orange; }'

  const w = mount(FaUserCssInjector)
  await flushPromises()

  const styleEl = document.getElementById(FA_USER_CSS_STYLE_ELEMENT_ID)
  expect(styleEl).not.toBeNull()
  expect(styleEl).toBeInstanceOf(HTMLStyleElement)
  expect(styleEl?.getAttribute('type')).toBe('text/css')
  expect(styleEl?.getAttribute('data-fa-user-css')).toBe('true')
  expect(styleEl?.parentElement).toBe(document.head)
  expect(styleEl?.textContent).toBe('.fa-test { color: orange; }')

  w.unmount()
})

/**
 * FaUserCssInjector
 * Updating the reactive store css should be mirrored into the live style element textContent.
 */
test('Test that FaUserCssInjector updates the style element textContent when the store css changes', async () => {
  const store = S_FaProgramStyling()
  store.css = '.fa-initial { color: red; }'

  const w = mount(FaUserCssInjector)
  await flushPromises()

  const styleEl = document.getElementById(FA_USER_CSS_STYLE_ELEMENT_ID)
  expect(styleEl?.textContent).toBe('.fa-initial { color: red; }')

  store.css = '.fa-next { color: green; }'
  await flushPromises()

  expect(styleEl?.textContent).toBe('.fa-next { color: green; }')

  w.unmount()
})

/**
 * FaUserCssInjector
 * When 'cssLivePreview' is set it overrides persisted 'css' in the injected style until cleared.
 */
test('Test that FaUserCssInjector applies cssLivePreview over store css when preview is active', async () => {
  const store = S_FaProgramStyling()
  store.css = '.persisted { color: blue; }'
  store.cssLivePreview = 'body { color: red; }'

  const w = mount(FaUserCssInjector)
  await flushPromises()

  const styleEl = document.getElementById(FA_USER_CSS_STYLE_ELEMENT_ID)
  expect(styleEl?.textContent).toBe('body { color: red; }')

  store.cssLivePreview = null
  await flushPromises()
  expect(styleEl?.textContent).toBe('.persisted { color: blue; }')

  w.unmount()
})

/**
 * FaUserCssInjector
 * Unmounting should detach the style element so subsequent app shells can mount cleanly without duplicates.
 */
test('Test that FaUserCssInjector removes its style#faUserCss element on unmount', async () => {
  const store = S_FaProgramStyling()
  store.css = ''

  const w = mount(FaUserCssInjector)
  await flushPromises()
  expect(document.getElementById(FA_USER_CSS_STYLE_ELEMENT_ID)).not.toBeNull()

  w.unmount()
  expect(document.getElementById(FA_USER_CSS_STYLE_ELEMENT_ID)).toBeNull()
})

/**
 * FaUserCssInjector
 * Reusing an existing style#faUserCss element (instead of creating a duplicate) keeps a single source of truth in the head.
 */
test('Test that FaUserCssInjector reuses an existing style#faUserCss element instead of duplicating it', async () => {
  const preexisting = document.createElement('style')
  preexisting.id = FA_USER_CSS_STYLE_ELEMENT_ID
  document.head.appendChild(preexisting)

  const store = S_FaProgramStyling()
  store.css = '.fa-shared { color: pink; }'

  const w = mount(FaUserCssInjector)
  await flushPromises()

  const all = document.querySelectorAll(`#${FA_USER_CSS_STYLE_ELEMENT_ID}`)
  expect(all).toHaveLength(1)
  expect(preexisting.textContent).toBe('.fa-shared { color: pink; }')

  w.unmount()
})
