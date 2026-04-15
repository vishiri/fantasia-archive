/** @vitest-environment jsdom */
/* eslint-disable vue/one-component-per-file -- each test mounts its own inline harness component */

import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, expect, test } from 'vitest'

import {
  registerComponentDialogStackGuard,
  registerMarkdownDialogStackGuard
} from 'app/src/scripts/appGlobalManagementUI/dialogManagement'
import { S_DialogComponent, S_DialogMarkdown } from 'app/src/stores/S_Dialog'

afterEach(() => {
  setActivePinia(createPinia())
})

test('registerComponentDialogStackGuard tracks open and close counts', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const dialogModel = ref(false)
  const Comp = defineComponent({
    setup () {
      registerComponentDialogStackGuard(dialogModel)
      return {}
    },
    template: '<div />'
  })
  const w = mount(Comp, { global: { plugins: [pinia] } })
  const st = S_DialogComponent()
  expect(st.componentDialogOpenCount).toBe(0)
  dialogModel.value = true
  await nextTick()
  expect(st.componentDialogOpenCount).toBe(1)
  dialogModel.value = false
  await nextTick()
  expect(st.componentDialogOpenCount).toBe(0)
  w.unmount()
  await nextTick()
  expect(st.componentDialogOpenCount).toBe(0)
})

test('registerComponentDialogStackGuard decrements when unmounted while open', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const dialogModel = ref(true)
  const Comp = defineComponent({
    setup () {
      registerComponentDialogStackGuard(dialogModel)
      return {}
    },
    template: '<div />'
  })
  const w = mount(Comp, { global: { plugins: [pinia] } })
  const st = S_DialogComponent()
  expect(st.componentDialogOpenCount).toBe(1)
  w.unmount()
  await nextTick()
  expect(st.componentDialogOpenCount).toBe(0)
})

test('registerMarkdownDialogStackGuard decrements on close', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const dialogModel = ref(true)
  const Comp = defineComponent({
    setup () {
      registerMarkdownDialogStackGuard(dialogModel)
      return {}
    },
    template: '<div />'
  })
  const w = mount(Comp, { global: { plugins: [pinia] } })
  const st = S_DialogMarkdown()
  st.markdownDialogOpenCount = 1
  dialogModel.value = false
  await nextTick()
  expect(st.markdownDialogOpenCount).toBe(0)
  w.unmount()
})

test('registerMarkdownDialogStackGuard calls hidden on unmount when still open', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const dialogModel = ref(true)
  const Comp = defineComponent({
    setup () {
      registerMarkdownDialogStackGuard(dialogModel)
      return {}
    },
    template: '<div />'
  })
  const w = mount(Comp, { global: { plugins: [pinia] } })
  const st = S_DialogMarkdown()
  st.markdownDialogOpenCount = 1
  w.unmount()
  await nextTick()
  expect(st.markdownDialogOpenCount).toBe(0)
})
