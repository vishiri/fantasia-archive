import { flushPromises, mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogMarkdownDocument from '../DialogMarkdownDocument.vue'

/**
 * DialogMarkdownDocument
 * directInput should open dialog styling for the named document on mount.
 */
test('Test that DialogMarkdownDocument activates license layout when directInput is license', async () => {
  const w = mount(DialogMarkdownDocument, {
    props: { directInput: 'license' },
    global: { mocks: { $t: (k: string) => k } }
  })

  await flushPromises()

  const html = w.html()
  expect(html).toContain('dialogMarkdownDocument')
  expect(html).toContain('license')
  expect(w.find('[data-test-locator="dialogMarkdownDocument-markdown-wrapper"]').exists()).toBe(true)
  w.unmount()
})
