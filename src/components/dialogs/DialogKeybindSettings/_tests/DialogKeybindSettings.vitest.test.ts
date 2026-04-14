import { flushPromises, mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogKeybindSettings from '../DialogKeybindSettings.vue'

/**
 * DialogKeybindSettings
 * directInput should open the keybind dialog shell and surface i18n title key via mocked translator.
 */
test('Test that DialogKeybindSettings renders keybind dialog shell for KeybindSettings input', async () => {
  const w = mount(DialogKeybindSettings, {
    global: {
      mocks: { $t: (k: string) => k }
    },
    props: { directInput: 'KeybindSettings' }
  })

  await flushPromises()

  const html = w.html()
  expect(html).toContain('dialogComponent')
  expect(html).toContain('KeybindSettings')
  expect(w.text()).toContain('dialogs.keybindSettings.title')
  w.unmount()
})
