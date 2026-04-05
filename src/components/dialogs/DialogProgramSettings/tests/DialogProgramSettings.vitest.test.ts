import { flushPromises, mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProgramSettings from '../DialogProgramSettings.vue'

/**
 * DialogProgramSettings
 * directInput should open the program settings dialog shell for ProgramSettings input.
 */
test('Test that DialogProgramSettings renders dialog shell for ProgramSettings input', async () => {
  const w = mount(DialogProgramSettings, {
    props: { directInput: 'ProgramSettings' },
    global: {
      mocks: { $t: (k: string) => k }
    }
  })

  await flushPromises()

  const html = w.html()
  expect(html).toContain('dialogComponent')
  expect(html).toContain('ProgramSettings')
  expect(w.text()).toContain('dialogs.programSettings.title')
  w.unmount()
})
