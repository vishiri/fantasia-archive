import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogMarkdownDocumentContent from '../DialogMarkdownDocumentContent.vue'

/**
 * DialogMarkdownDocumentContent
 * Renders the markdown wrapper and content region for a named document.
 */
test('Test that DialogMarkdownDocumentContent renders markdown region for documentName', () => {
  const w = mount(DialogMarkdownDocumentContent, {
    props: {
      documentName: 'changeLog'
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        QMarkdown: defineComponent({
          inheritAttrs: false,
          props: {
            src: {
              type: String,
              default: ''
            }
          },
          template: '<div data-test-locator="q-markdown-stub" v-bind="$attrs" />'
        })
      }
    }
  })

  expect(w.find('[data-test-locator="dialogMarkdownDocument-markdown-wrapper"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogMarkdownDocument-markdown-content"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogMarkdownDocument-markdown-content"]').classes()).toContain('changeLog')
})
