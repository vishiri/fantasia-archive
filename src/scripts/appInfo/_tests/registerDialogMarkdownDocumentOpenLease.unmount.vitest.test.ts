/** @vitest-environment jsdom */

import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, expect, test } from 'vitest'

import { registerDialogMarkdownDocumentOpenLease } from 'app/src/scripts/appInfo/registerDialogMarkdownDocumentOpenLease'
import { S_DialogMarkdown } from 'app/src/stores/S_Dialog'

afterEach(() => {
  setActivePinia(createPinia())
})

test('registerDialogMarkdownDocumentOpenLease calls hidden on unmount when still open', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const dialogModel = ref(true)
  const Comp = defineComponent({
    setup () {
      registerDialogMarkdownDocumentOpenLease(dialogModel)
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
