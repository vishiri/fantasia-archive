import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import GlobalLanguageSelectorSpellcheckRefreshControl from '../GlobalLanguageSelectorSpellcheckRefreshControl.vue'

/**
 * GlobalLanguageSelectorSpellcheckRefreshControl
 * Hidden until 'show' is true; forwards refreshWebContents clicks.
 */
test('Test that spellcheck refresh control stays hidden when show is false', () => {
  const w = mount(GlobalLanguageSelectorSpellcheckRefreshControl, {
    props: {
      show: false
    },
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  expect(w.find('[data-test-locator="globalLanguageSelector-spellcheckRefresh"]').exists()).toBe(false)
  w.unmount()
})

test('Test that spellcheck refresh control emits refreshWebContents when shown and clicked', async () => {
  const w = mount(GlobalLanguageSelectorSpellcheckRefreshControl, {
    props: {
      show: true
    },
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  await w.find('[data-test-locator="globalLanguageSelector-spellcheckRefresh"]').trigger('click')
  expect(w.emitted('refreshWebContents')).toEqual([[]])
  w.unmount()
})
