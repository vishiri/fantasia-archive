import { computed, ref } from 'vue'
import { expect, test } from 'vitest'

import type { I_computedRef } from 'app/types/I_vueCompositionShims'

import { createUseProjectDocumentControlBar } from '../../functions/createUseProjectDocumentControlBar'

function mountUseProjectDocumentControlBar (disableDocumentControlBar: boolean) {
  const settings = ref({ disableDocumentControlBar })

  return createUseProjectDocumentControlBar({
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    S_FaUserSettings: () => ({}) as never,
    storeToRefs: () => ({
      settings
    }) as never
  })()
}

test('Test that createUseProjectDocumentControlBar shows the bar when the setting is off', () => {
  const api = mountUseProjectDocumentControlBar(false)

  expect(api.showDocumentControlBar.value).toBe(true)
})

test('Test that createUseProjectDocumentControlBar hides the bar when disableDocumentControlBar is on', () => {
  const api = mountUseProjectDocumentControlBar(true)

  expect(api.showDocumentControlBar.value).toBe(false)
})
