/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
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

/**
 * DialogKeybindSettingsCaptureDialog
 * Close should emit update:modelValue false and capture set should emit captureSet when enabled.
 */
test('DialogKeybindSettingsCaptureDialog close and set buttons emit expected events', async () => {
  const w = mount(DialogKeybindSettingsCaptureDialog, {
    global: {
      mocks: { $t: (k: string) => k },
      stubs: {
        DialogKeybindSettingsCaptureField: defineComponent({
          name: 'DialogKeybindSettingsCaptureFieldStub',
          template: '<div data-test-locator="capture-field-stub" />'
        }),
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
        QDialog: defineComponent({
          name: 'QDialog',
          props: {
            modelValue: {
              type: Boolean,
              default: false
            }
          },
          emits: ['update:modelValue'],
          template: '<div><slot /></div>'
        }),
        QIcon: true,
        QTooltip: { template: '<div><slot /></div>' }
      }
    },
    props: {
      actionName: 'Capture action',
      captureError: false,
      captureErrorMessage: '',
      captureInfoMessage: '',
      captureLabel: 'Ctrl + A',
      hasPendingChord: true,
      modelValue: true
    }
  })

  await flushPromises()

  await w.get('[data-test-locator="dialogKeybindSettings-capture-close"]').trigger('click')
  expect(w.emitted('update:modelValue')?.[0]).toEqual([false])

  const w2 = mount(DialogKeybindSettingsCaptureDialog, {
    global: {
      mocks: { $t: (k: string) => k },
      stubs: {
        DialogKeybindSettingsCaptureField: defineComponent({
          name: 'DialogKeybindSettingsCaptureFieldStub',
          template: '<div />'
        }),
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
      actionName: 'Capture action',
      captureError: false,
      captureErrorMessage: '',
      captureInfoMessage: '',
      captureLabel: 'Ctrl + A',
      hasPendingChord: true,
      modelValue: true
    }
  })

  await flushPromises()
  await w2.get('[data-test-locator="dialogKeybindSettings-capture-set"]').trigger('click')
  expect(w2.emitted('captureSet')).toHaveLength(1)

  w.unmount()
  w2.unmount()
})

/**
 * DialogKeybindSettingsCaptureDialog
 * Clear should emit captureClear when the clear control is enabled.
 */
test('DialogKeybindSettingsCaptureDialog emits captureClear when clear is clicked', async () => {
  const w = mount(DialogKeybindSettingsCaptureDialog, {
    global: {
      mocks: { $t: (k: string) => k },
      stubs: {
        DialogKeybindSettingsCaptureField: { template: '<div />' },
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
      actionName: 'A',
      captureError: false,
      captureErrorMessage: '',
      captureInfoMessage: '',
      captureLabel: 'Ctrl + ,',
      hasPendingChord: false,
      modelValue: true
    }
  })

  await flushPromises()
  await w.get('[data-test-locator="dialogKeybindSettings-capture-clear"]').trigger('click')

  expect(w.emitted('captureClear')).toHaveLength(1)
  w.unmount()
})

/**
 * DialogKeybindSettingsCaptureDialog
 * aria-describedby should point at the status region when info or error text is present.
 */
test('DialogKeybindSettingsCaptureDialog wires aria-describedby for info and error messages', async () => {
  const wInfo = mount(DialogKeybindSettingsCaptureDialog, {
    global: {
      mocks: { $t: (k: string) => k },
      stubs: {
        DialogKeybindSettingsCaptureField: { template: '<div />' },
        QBtn: {
          props: {
            disable: {
              default: false,
              type: Boolean
            }
          },
          template: '<button type="button" :disabled="disable"><slot /></button>'
        },
        QCard: { template: '<div><slot /></div>' },
        QCardActions: { template: '<div><slot /></div>' },
        QDialog: defineComponent({
          name: 'QDialog',
          inheritAttrs: false,
          props: {
            modelValue: {
              type: Boolean,
              default: false
            }
          },
          template: '<div v-bind="$attrs"><slot /></div>'
        }),
        QIcon: true,
        QTooltip: { template: '<div><slot /></div>' }
      }
    },
    props: {
      actionName: 'A',
      captureError: false,
      captureErrorMessage: '',
      captureInfoMessage: 'info text',
      captureLabel: '',
      hasPendingChord: false,
      modelValue: true
    }
  })

  await flushPromises()

  expect(wInfo.find('[aria-describedby]').attributes('aria-describedby')).toBeTruthy()

  const wErr = mount(DialogKeybindSettingsCaptureDialog, {
    global: {
      mocks: { $t: (k: string) => k },
      stubs: {
        DialogKeybindSettingsCaptureField: { template: '<div />' },
        QBtn: {
          props: {
            disable: {
              default: false,
              type: Boolean
            }
          },
          template: '<button type="button" :disabled="disable"><slot /></button>'
        },
        QCard: { template: '<div><slot /></div>' },
        QCardActions: { template: '<div><slot /></div>' },
        QDialog: defineComponent({
          name: 'QDialog',
          inheritAttrs: false,
          props: {
            modelValue: {
              type: Boolean,
              default: false
            }
          },
          template: '<div v-bind="$attrs"><slot /></div>'
        }),
        QIcon: true,
        QTooltip: { template: '<div><slot /></div>' }
      }
    },
    props: {
      actionName: 'A',
      captureError: true,
      captureErrorMessage: 'err',
      captureInfoMessage: '',
      captureLabel: 'x',
      hasPendingChord: false,
      modelValue: true
    }
  })

  await flushPromises()

  expect(wErr.find('[aria-describedby]').attributes('aria-describedby')).toBeTruthy()

  const wBare = mount(DialogKeybindSettingsCaptureDialog, {
    global: {
      mocks: { $t: (k: string) => k },
      stubs: {
        DialogKeybindSettingsCaptureField: { template: '<div />' },
        QBtn: {
          props: {
            disable: {
              default: false,
              type: Boolean
            }
          },
          template: '<button type="button" :disabled="disable"><slot /></button>'
        },
        QCard: { template: '<div><slot /></div>' },
        QCardActions: { template: '<div><slot /></div>' },
        QDialog: defineComponent({
          name: 'QDialog',
          inheritAttrs: false,
          props: {
            modelValue: {
              type: Boolean,
              default: false
            }
          },
          template: '<div v-bind="$attrs"><slot /></div>'
        }),
        QIcon: true,
        QTooltip: { template: '<div><slot /></div>' }
      }
    },
    props: {
      actionName: 'A',
      captureError: false,
      captureErrorMessage: '',
      captureInfoMessage: '',
      captureLabel: '',
      hasPendingChord: false,
      modelValue: true
    }
  })

  await flushPromises()

  expect(wBare.find('[aria-describedby]').exists()).toBe(false)

  wInfo.unmount()
  wErr.unmount()
  wBare.unmount()
})
