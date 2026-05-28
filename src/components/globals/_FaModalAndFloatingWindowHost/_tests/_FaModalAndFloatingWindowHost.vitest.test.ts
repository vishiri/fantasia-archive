/** @vitest-environment jsdom */
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { expect, test } from 'vitest'

import FaModalAndFloatingWindowHost from '../_FaModalAndFloatingWindowHost.vue'

const hostChildStub = defineComponent({
  name: 'HostChildStub',
  template: '<div class="host-child-stub" />'
})

const hostMount = {
  global: {
    stubs: {
      DialogAboutFantasiaArchive: hostChildStub,
      DialogActionMonitor: hostChildStub,
      DialogAppSettings: hostChildStub,
      DialogImportExportAppConfig: hostChildStub,
      DialogKeybindSettings: hostChildStub,
      DialogMarkdownDocument: hostChildStub,
      DialogNewProject: hostChildStub,
      DialogProjectSettings: hostChildStub,
      WindowAppNoteboard: hostChildStub,
      WindowAppStyling: hostChildStub,
      WindowProjectNoteboard: hostChildStub,
      WindowProjectStyling: hostChildStub
    }
  }
} as const

/**
 * _FaModalAndFloatingWindowHost
 * Host root uses display:contents wrapper and mounts dialog/window children.
 */
test('Test that _FaModalAndFloatingWindowHost mounts modal and floating window children', async () => {
  const w = mount(FaModalAndFloatingWindowHost, hostMount)

  await flushPromises()

  expect(w.find('._faModalAndFloatingWindowHost').exists()).toBe(true)
  expect(w.findAll('.host-child-stub')).toHaveLength(12)
  w.unmount()
})
