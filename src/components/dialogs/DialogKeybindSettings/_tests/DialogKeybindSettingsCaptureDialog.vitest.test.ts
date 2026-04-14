import { flushPromises, mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogKeybindSettingsCaptureDialog from '../DialogKeybindSettingsCaptureDialog.vue'

/**
 * DialogKeybindSettingsCaptureDialog
 * Smoke-check capture UI strings and the action title with Quasar nodes stubbed.
 */
test('DialogKeybindSettingsCaptureDialog shows action title and placeholder i18n key when empty', async () => {
  const w = mount(DialogKeybindSettingsCaptureDialog, {
    global: {
      mocks: { $t: (k: string) => k },
      stubs: {
        QBtn: {
          props: {
            disable: {
              default: false,
              type: Boolean
            }
          },
          template: '<button class="q-btn-stub" type="button" :disabled="disable"><slot /></button>'
        },
        QCard: { template: '<div><slot /></div>' },
        QCardActions: { template: '<div><slot /></div>' },
        QDialog: { template: '<div><slot /></div>' },
        QIcon: true,
        QTooltip: { template: '<div><slot /></div>' }
      }
    },
    props: {
      actionName: 'Open program settings',
      captureError: false,
      captureErrorMessage: '',
      captureInfoMessage: '',
      captureLabel: '',
      hasPendingChord: false,
      modelValue: true
    }
  })

  await flushPromises()

  expect(w.text()).toContain('Open program settings')
  expect(w.html()).toContain('dialogs.keybindSettings.captureHint')
  const clearBtn = w.find('[data-test-locator="dialogKeybindSettings-capture-clear"]')
  expect(clearBtn.attributes('disabled')).toBeDefined()
  w.unmount()
})

test('DialogKeybindSettingsCaptureDialog enables clear keybind when captureLabel shows a chord', async () => {
  const w = mount(DialogKeybindSettingsCaptureDialog, {
    global: {
      mocks: { $t: (k: string) => k },
      stubs: {
        QBtn: {
          props: {
            disable: {
              default: false,
              type: Boolean
            }
          },
          template: '<button class="q-btn-stub" type="button" :disabled="disable"><slot /></button>'
        },
        QCard: { template: '<div><slot /></div>' },
        QCardActions: { template: '<div><slot /></div>' },
        QDialog: { template: '<div><slot /></div>' },
        QIcon: true,
        QTooltip: { template: '<div><slot /></div>' }
      }
    },
    props: {
      actionName: 'Open program settings',
      captureError: false,
      captureErrorMessage: '',
      captureInfoMessage: '',
      captureLabel: 'Ctrl + ,',
      hasPendingChord: true,
      modelValue: true
    }
  })

  await flushPromises()

  const clearBtn = w.find('[data-test-locator="dialogKeybindSettings-capture-clear"]')
  expect(clearBtn.attributes('disabled')).toBeUndefined()
  w.unmount()
})
