import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import FaLocaleTranslationsInputMenuPanel from '../FaLocaleTranslationsInputMenuPanel.vue'
import type { I_faLocaleTranslationsInputLocaleRow } from 'app/types/I_faLocaleTranslationsInput'

const localeRows: I_faLocaleTranslationsInputLocaleRow[] = [
  {
    code: 'en-US',
    displayName: 'English'
  }
]

const qInputStub = defineComponent({
  inheritAttrs: true,
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  template: `
    <div class="q-input-stub" v-bind="$attrs">
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </div>
  `
})

test('Test that FaLocaleTranslationsInputMenuPanel renders locale translation rows', () => {
  const wrapper = mount(FaLocaleTranslationsInputMenuPanel, {
    props: {
      autogrow: false,
      isMultilineInput: false,
      localeRows,
      readLocaleValue: () => 'Character',
      rows: 1,
      setPreferredLanguageInputRef: () => {},
      testLocator: 'faLocaleTranslationsInput-menuPanel',
      updateLocaleValue: () => {}
    },
    global: {
      stubs: {
        QInput: qInputStub
      }
    }
  })

  expect(wrapper.find('[data-test-locator="faLocaleTranslationsInput-menuPanel-translationsInput-en-US"]').exists()).toBe(true)
})
