/** @vitest-environment jsdom */
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { defineComponent, h } from 'vue'

import { S_FaProjectStyling } from 'app/src/stores/S_FaProjectStyling'

import { FA_PROJECT_USER_CSS_ELEMENT_ID } from '../functions/faProjectUserCssStyleElement'
import { useFaProjectUserCssInjector } from '../faProjectUserCssInjector_manager'

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  const lingering = document.getElementById(FA_PROJECT_USER_CSS_ELEMENT_ID)
  if (lingering !== null && lingering.parentNode !== null) {
    lingering.parentNode.removeChild(lingering)
  }
})

function mountProjectUserCssInjectorHarness () {
  return defineComponent({
    setup () {
      useFaProjectUserCssInjector()
      return () => h('div')
    }
  })
}

/**
 * useFaProjectUserCssInjector
 * Empty trimmed css removes the managed style element from the document head.
 */
test('Test that useFaProjectUserCssInjector removes head style when payload trims empty', async () => {
  const store = S_FaProjectStyling()
  store.applyRoot({
    css: 'p { color: red; }',
    frame: null,
    schemaVersion: 1
  })

  const wrapper = mount(mountProjectUserCssInjectorHarness())
  await wrapper.vm.$nextTick()

  expect(document.getElementById(FA_PROJECT_USER_CSS_ELEMENT_ID)).not.toBeNull()

  store.applyRoot({
    css: '   ',
    frame: null,
    schemaVersion: 1
  })
  await wrapper.vm.$nextTick()

  expect(document.getElementById(FA_PROJECT_USER_CSS_ELEMENT_ID)).toBeNull()

  wrapper.unmount()
})

/**
 * useFaProjectUserCssInjector
 * Empty trimmed css clears managedStyleEl even when the node is already detached from the head.
 */
test('Test that useFaProjectUserCssInjector clears managed style when payload trims empty on a detached node', async () => {
  const store = S_FaProjectStyling()
  store.applyRoot({
    css: ':root { color: red; }',
    frame: null,
    schemaVersion: 1
  })

  const wrapper = mount(mountProjectUserCssInjectorHarness())
  await wrapper.vm.$nextTick()

  const styleEl = document.getElementById(FA_PROJECT_USER_CSS_ELEMENT_ID)
  expect(styleEl).not.toBeNull()
  styleEl?.parentNode?.removeChild(styleEl)

  store.applyRoot({
    css: '   ',
    frame: null,
    schemaVersion: 1
  })
  await wrapper.vm.$nextTick()

  expect(document.getElementById(FA_PROJECT_USER_CSS_ELEMENT_ID)).toBeNull()

  wrapper.unmount()
})

/**
 * useFaProjectUserCssInjector
 * Watch avoids rewriting textContent when payload already matches the style node.
 */
test('Test that useFaProjectUserCssInjector skips redundant textContent writes', async () => {
  const store = S_FaProjectStyling()
  const cssText = '.fa-project-redundant { color: maroon; }'
  store.applyRoot({
    css: cssText,
    frame: null,
    schemaVersion: 1
  })

  const preexisting = document.createElement('style')
  preexisting.id = FA_PROJECT_USER_CSS_ELEMENT_ID
  preexisting.textContent = cssText
  document.head.appendChild(preexisting)

  const setSpy = vi.spyOn(preexisting, 'textContent', 'set')

  const wrapper = mount(mountProjectUserCssInjectorHarness())
  await wrapper.vm.$nextTick()

  store.applyRoot({
    css: cssText,
    frame: null,
    schemaVersion: 1
  })
  await wrapper.vm.$nextTick()

  expect(setSpy.mock.calls.length).toBe(0)

  wrapper.unmount()
})
