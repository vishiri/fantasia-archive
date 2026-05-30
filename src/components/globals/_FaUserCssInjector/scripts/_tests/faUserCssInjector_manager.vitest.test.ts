/** @vitest-environment jsdom */
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { defineComponent, h } from 'vue'

import { S_FaAppStyling } from 'app/src/stores/S_FaAppStyling'

import { useFaUserCssInjector } from '../faUserCssInjector_manager'

const FA_USER_CSS_STYLE_ELEMENT_ID = 'faUserCss'

function createFaUserCssInjectorHarness () {
  return defineComponent({
    setup () {
      useFaUserCssInjector()
      return () => h('div')
    }
  })
}

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
 * useFaUserCssInjector
 * Mounting applies store css to a head style element; unmount removes it when still attached.
 */
test('Test that useFaUserCssInjector mounts and unmounts the faUserCss style element', async () => {
  const store = S_FaAppStyling()
  store.css = '.fa-manager-test { color: cyan; }'

  const wrapper = mount(createFaUserCssInjectorHarness())

  const styleEl = document.getElementById(FA_USER_CSS_STYLE_ELEMENT_ID)
  expect(styleEl?.textContent).toBe('.fa-manager-test { color: cyan; }')

  wrapper.unmount()
  expect(document.getElementById(FA_USER_CSS_STYLE_ELEMENT_ID)).toBeNull()
})

/**
 * useFaUserCssInjector
 * Unmount stays safe when the style node was detached from the document head earlier.
 */
test('Test that useFaUserCssInjector unmount tolerates a detached style element', async () => {
  const store = S_FaAppStyling()
  store.css = '.fa-detached { color: gray; }'

  const wrapper = mount(createFaUserCssInjectorHarness())

  const styleEl = document.getElementById(FA_USER_CSS_STYLE_ELEMENT_ID)
  expect(styleEl).not.toBeNull()
  styleEl?.parentNode?.removeChild(styleEl)

  expect(() => wrapper.unmount()).not.toThrow()
})

/**
 * useFaUserCssInjector
 * Watch updates apply when persisted css changes after mount.
 */
test('Test that useFaUserCssInjector watch mirrors store css after mount', async () => {
  const store = S_FaAppStyling()
  store.css = '.fa-watch-initial { color: navy; }'

  const wrapper = mount(createFaUserCssInjectorHarness())

  const styleEl = document.getElementById(FA_USER_CSS_STYLE_ELEMENT_ID)
  expect(styleEl?.textContent).toBe('.fa-watch-initial { color: navy; }')

  store.css = '.fa-watch-next { color: olive; }'
  await wrapper.vm.$nextTick()

  expect(styleEl?.textContent).toBe('.fa-watch-next { color: olive; }')

  wrapper.unmount()
})

/**
 * useFaUserCssInjector
 * Watch skips textContent writes when persisted css already matches the style node.
 */
test('Test that useFaUserCssInjector watch avoids redundant style text writes', async () => {
  const store = S_FaAppStyling()
  const cssText = '.fa-redundant { color: teal; }'
  store.css = cssText

  const preexisting = document.createElement('style')
  preexisting.id = FA_USER_CSS_STYLE_ELEMENT_ID
  preexisting.textContent = cssText
  document.head.appendChild(preexisting)

  const setSpy = vi.spyOn(preexisting, 'textContent', 'set')

  const wrapper = mount(createFaUserCssInjectorHarness())
  await wrapper.vm.$nextTick()

  store.css = cssText
  await wrapper.vm.$nextTick()

  expect(setSpy.mock.calls.length).toBe(0)

  wrapper.unmount()
})
