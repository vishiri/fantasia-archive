/** @vitest-environment jsdom */

import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, expect, test } from 'vitest'

import { registerDialogComponentOpenLease } from 'app/src/scripts/appInfo/registerDialogComponentOpenLease'
import { S_DialogComponent } from 'app/src/stores/S_Dialog'

afterEach(() => {
  setActivePinia(createPinia())
})

test('registerDialogComponentOpenLease tracks open and close counts', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const dialogModel = ref(false)
  const Comp = defineComponent({
    setup () {
      registerDialogComponentOpenLease(dialogModel)
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
