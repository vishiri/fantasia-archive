import { flushPromises, mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogKeybindSettingsCaptureField from '../DialogKeybindSettingsCaptureField.vue'

/**
 * DialogKeybindSettingsCaptureField
 * Ensures the capture field label and validation wiring match the capture dialog contract.
 */
test('DialogKeybindSettingsCaptureField shows capture hint key when label is empty', async () => {
  const w = mount(DialogKeybindSettingsCaptureField, {
    global: {
      mocks: { $t: (k: string) => k },
      stubs: {
        QBtn: { template: '<button type="button"><slot /></button>' },
        QIcon: true,
        QTooltip: { template: '<div><slot /></div>' }
      }
    },
    props: {
      captureError: false,
      captureErrorMessage: '',
      captureInfoMessage: '',
      captureLabel: '',
      statusRegionId: 'capture-status-test'
    }
  })

  await flushPromises()

  const field = w.find('[data-test-locator="dialogKeybindSettings-capture-qfield"]')
  expect(field.exists()).toBe(true)
  expect(field.attributes('data-test-keybind-field-has-error')).toBe('false')
  w.unmount()
})

test('DialogKeybindSettingsCaptureField treats need modifier as a field error', async () => {
  const w = mount(DialogKeybindSettingsCaptureField, {
    global: {
      mocks: { $t: (k: string) => k },
      stubs: {
        QBtn: { template: '<button type="button"><slot /></button>' },
        QIcon: true,
        QTooltip: { template: '<div><slot /></div>' }
      }
    },
    props: {
      captureError: true,
      captureErrorMessage: 'dialogs.keybindSettings.validationNeedModifier',
      captureInfoMessage: '',
      captureLabel: '',
      statusRegionId: 'capture-status-test'
    }
  })

  await flushPromises()

  const field = w.find('[data-test-locator="dialogKeybindSettings-capture-qfield"]')
  expect(field.attributes('data-test-keybind-field-has-error')).toBe('true')
  const msg = w.find('[data-test-locator="dialogKeybindSettings-capture-field-message"]')
  expect(msg.text()).toContain('dialogs.keybindSettings.validationNeedModifier')
  w.unmount()
})

test('DialogKeybindSettingsCaptureField prefers conflict message when captureError', async () => {
  const w = mount(DialogKeybindSettingsCaptureField, {
    global: {
      mocks: { $t: (k: string) => k },
      stubs: {
        QBtn: { template: '<button type="button"><slot /></button>' },
        QIcon: true,
        QTooltip: { template: '<div><slot /></div>' }
      }
    },
    props: {
      captureError: true,
      captureErrorMessage: 'dialogs.keybindSettings.validationConflict',
      captureInfoMessage: 'dialogs.keybindSettings.validationNeedModifier',
      captureLabel: '',
      statusRegionId: 'capture-status-test'
    }
  })

  await flushPromises()

  const msg = w.find('[data-test-locator="dialogKeybindSettings-capture-field-message"]')
  expect(msg.exists()).toBe(true)
  expect(msg.text()).toContain('dialogs.keybindSettings.validationConflict')
  expect(msg.text()).not.toContain('validationNeedModifier')
  const field = w.find('[data-test-locator="dialogKeybindSettings-capture-qfield"]')
  expect(field.attributes('data-test-keybind-field-has-error')).toBe('true')
  w.unmount()
})

/**
 * DialogKeybindSettingsCaptureField
 * Help icon slot should render capture help line keys through the tooltip template.
 */
test('DialogKeybindSettingsCaptureField renders tooltip help lines from captureHelpLineKeys', async () => {
  const w = mount(DialogKeybindSettingsCaptureField, {
    global: {
      mocks: { $t: (k: string) => k },
      stubs: {
        QField: {
          inheritAttrs: true,
          template: `
            <div v-bind="$attrs">
              <slot name="after" />
              <slot name="control" />
            </div>
          `
        },
        QIcon: { template: '<span class="q-icon-stub"><slot /></span>' },
        QTooltip: { template: '<div class="q-tooltip-stub"><slot /></div>' }
      }
    },
    props: {
      captureError: false,
      captureErrorMessage: '',
      captureInfoMessage: '',
      captureLabel: 'Ctrl + B',
      statusRegionId: 'capture-status-test'
    }
  })

  await flushPromises()

  const html = w.html()
  expect(html).toContain('dialogs.keybindSettings.captureHelpLineCtrl')
  expect(html).toContain('dialogs.keybindSettings.captureHelpFootnote')
  expect(w.text()).toContain('Ctrl + B')

  w.unmount()
})
