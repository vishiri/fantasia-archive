/** @vitest-environment jsdom */

import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import {
  afterEach,
  beforeEach,
  expect,
  test,
  vi
} from 'vitest'

import * as faUserCssHostDocument from 'app/src/components/globals/_FaUserCssInjector/scripts/functions/faUserCssInjectorHostAndCssPayload'
import { S_FaProjectStyling } from 'app/src/stores/S_FaProjectStyling'

import FaProjectUserCssInjector from '../_FaProjectUserCssInjector.vue'

import * as projectUserCssDom from 'app/src/components/globals/_FaProjectUserCssInjector/scripts/functions/faProjectUserCssStyleElement'

const FA_PROJECT_USER_CSS_ELEMENT_ID = projectUserCssDom.FA_PROJECT_USER_CSS_ELEMENT_ID

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  const lingering = document.getElementById(FA_PROJECT_USER_CSS_ELEMENT_ID)

  if (lingering !== null && lingering.parentNode !== null) {
    lingering.parentNode.removeChild(lingering)
  }

  vi.restoreAllMocks()
})

test('FaProjectUserCssInjector mounts style element with persisted project css', async () => {
  const store = S_FaProjectStyling()

  store.applyRoot({
    css: ':root .fa-proj-css-test { outline: none; }',

    frame: null,

    schemaVersion: 1
  })

  const w = mount(FaProjectUserCssInjector)

  await flushPromises()

  const styleEl = document.getElementById(FA_PROJECT_USER_CSS_ELEMENT_ID)

  expect(styleEl).not.toBeNull()

  expect(styleEl!.textContent).toBe(':root .fa-proj-css-test { outline: none; }')
  w.unmount()
})

test('FaProjectUserCssInjector mirrors cssLivePreview over persisted css', async () => {
  const store = S_FaProjectStyling()

  store.applyRoot({
    css: 'body { margin: 0; }',

    frame: null,

    schemaVersion: 1
  })

  store.setCssLivePreview('html { opacity: 0.95; }')

  const w = mount(FaProjectUserCssInjector)

  await flushPromises()

  const styleEl = document.getElementById(FA_PROJECT_USER_CSS_ELEMENT_ID)

  expect(styleEl!.textContent).toBe('html { opacity: 0.95; }')

  store.clearCssLivePreview()
  await flushPromises()

  expect(styleEl!.textContent).toBe('body { margin: 0; }')

  w.unmount()
})

test('FaProjectUserCssInjector removes empty css style node until content returns', async () => {
  const store = S_FaProjectStyling()

  store.applyRoot({
    css: ' ',

    frame: null,

    schemaVersion: 1
  })

  const w = mount(FaProjectUserCssInjector)

  await flushPromises()

  expect(document.getElementById(FA_PROJECT_USER_CSS_ELEMENT_ID)).toBeNull()

  store.applyRoot({
    css: 'p { padding: 0; }',

    frame: null,

    schemaVersion: 1
  })

  await flushPromises()

  expect(document.getElementById(FA_PROJECT_USER_CSS_ELEMENT_ID)?.textContent).toBe('p { padding: 0; }')
  w.unmount()
})

test('FaProjectUserCssInjector detaches injected style on unmount', async () => {
  const store = S_FaProjectStyling()

  store.applyRoot({
    css: '* { cursor: inherit; }',

    frame: null,

    schemaVersion: 1
  })

  const w = mount(FaProjectUserCssInjector)

  await flushPromises()

  expect(document.getElementById(FA_PROJECT_USER_CSS_ELEMENT_ID)).not.toBeNull()
  w.unmount()

  expect(document.getElementById(FA_PROJECT_USER_CSS_ELEMENT_ID)).toBeNull()
})

test('FaProjectUserCssInjector stays dormant while host resolution skips document adapters', async () => {
  vi.spyOn(faUserCssHostDocument, 'resolveFaUserCssInjectorHostDocument').mockReturnValue(undefined)

  const store = S_FaProjectStyling()

  store.applyRoot({
    css: ':root {}',

    frame: null,

    schemaVersion: 1
  })

  const w = mount(FaProjectUserCssInjector)

  await flushPromises()

  expect(document.getElementById(FA_PROJECT_USER_CSS_ELEMENT_ID)).toBeNull()
  w.unmount()
})

test('FaProjectUserCssInjector tolerates head insertion refusal while payloads stay nonempty', async () => {
  const ensureSpy = vi.spyOn(projectUserCssDom, 'ensureProjectUserCssStyleElementInHead').mockReturnValue(null)

  const store = S_FaProjectStyling()

  store.applyRoot({
    css: 'section { opacity: 0.96; }',

    frame: null,

    schemaVersion: 1
  })

  const w = mount(FaProjectUserCssInjector)

  await flushPromises()

  expect(document.getElementById(FA_PROJECT_USER_CSS_ELEMENT_ID)).toBeNull()
  ensureSpy.mockRestore()

  store.applyRoot({
    css: 'main { outline: none; }',

    frame: null,

    schemaVersion: 1
  })

  await flushPromises()

  expect(document.getElementById(FA_PROJECT_USER_CSS_ELEMENT_ID)?.textContent).toBe('main { outline: none; }')
  w.unmount()
})

test('FaProjectUserCssInjector drops orphaned inserts when trimming empties payloads without DOM parents', async () => {
  const store = S_FaProjectStyling()

  store.applyRoot({
    css: ':root {}',

    frame: null,

    schemaVersion: 1
  })

  const w = mount(FaProjectUserCssInjector)

  await flushPromises()

  const orphaned = document.getElementById(FA_PROJECT_USER_CSS_ELEMENT_ID)

  expect(orphaned).not.toBeNull()

  if (orphaned !== null && orphaned.parentNode !== null) {
    orphaned.parentNode.removeChild(orphaned)
  }

  store.applyRoot({
    css: ' ',

    frame: null,

    schemaVersion: 1
  })

  await flushPromises()

  expect(document.getElementById(FA_PROJECT_USER_CSS_ELEMENT_ID)).toBeNull()
  w.unmount()
})
