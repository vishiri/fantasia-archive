import { flushPromises, mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogAboutFantasiaArchive from '../DialogAboutFantasiaArchive.vue'

/**
 * DialogAboutFantasiaArchive
 * directInput should open the about dialog and surface i18n title key via mocked translator.
 */
test('Test that DialogAboutFantasiaArchive renders about dialog shell for AboutFantasiaArchive input', async () => {
  const w = mount(DialogAboutFantasiaArchive, {
    props: { directInput: 'AboutFantasiaArchive' },
    global: {
      mocks: { $t: (k: string) => k },
      stubs: {
        SocialContactButtons: { template: '<div data-test-locator="stub-social-contact-buttons" />' }
      }
    }
  })

  await flushPromises()

  const html = w.html()
  expect(html).toContain('dialogComponent')
  expect(html).toContain('AboutFantasiaArchive')
  expect(w.text()).toContain('dialogs.aboutFantasiaArchive.title')
  w.unmount()
})
