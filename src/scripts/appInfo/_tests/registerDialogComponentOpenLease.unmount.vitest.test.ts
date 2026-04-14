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

test('registerDialogComponentOpenLease decrements when unmounted while open', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const dialogModel = ref(true)
  const Comp = defineComponent({
    setup () {
      registerDialogComponentOpenLease(dialogModel)
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
