/** @vitest-environment jsdom */
import { flushPromises, mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import FaFloatingWindowBodyTeleport from '../_FaFloatingWindowBodyTeleport.vue'

/**
 * _FaFloatingWindowBodyTeleport
 * Default slot content should render under document.body via Teleport.
 */
test('Test that _FaFloatingWindowBodyTeleport teleports slot content to body', async () => {
  const w = mount(FaFloatingWindowBodyTeleport, {
    attachTo: document.body,
    slots: {
      default: '<div data-test-locator="fa-floating-window-teleport-child">child</div>'
    }
  })

  await flushPromises()

  expect(document.body.querySelector('[data-test-locator="fa-floating-window-teleport-child"]')).not.toBeNull()
  w.unmount()
})
