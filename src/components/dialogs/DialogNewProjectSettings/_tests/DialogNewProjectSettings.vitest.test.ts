/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { expect, test, vi } from 'vitest'

import DialogNewProjectSettings from '../DialogNewProjectSettings.vue'

vi.mock('../scripts/dialogNewProjectSettingsSubmit', () => {
  return {
    runDialogNewProjectSettingsCreate: vi.fn(async () => undefined)
  }
})

import { runDialogNewProjectSettingsCreate } from '../scripts/dialogNewProjectSettingsSubmit'

const dialogNewProjectSettingsQDialogStub = defineComponent({
  name: 'QDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  template: '<div class="q-dialog-stub"><div v-show="modelValue" class="q-dialog-stub-inner"><slot /></div></div>'
})

const dialogNewProjectSettingsQInputStub = defineComponent({
  name: 'QInput',
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  methods: {
    onInput (e: Event): void {
      const v = (e.target as HTMLInputElement).value
      this.$emit('update:modelValue', v)
    }
  },
  template: '<input class="dialog-new-project-settings-qinput-mock" :value="modelValue" @input="onInput" />'
})

const dialogNewProjectSettingsQBtnStub = defineComponent({
  name: 'QBtn',
  inheritAttrs: true,
  props: {
    disable: {
      type: Boolean,
      default: false
    }
  },
  template: '<button type="button" v-bind="$attrs" :disabled="disable" @click="$emit(\'click\')"><slot /></button>'
})

const dialogNewProjectSettingsStubs = {
  QBtn: dialogNewProjectSettingsQBtnStub,
  QDialog: dialogNewProjectSettingsQDialogStub,
  QInput: dialogNewProjectSettingsQInputStub
}

/**
 * DialogNewProjectSettings
 * Create stays disabled until the name is non-empty after trim.
 */
test('Test that DialogNewProjectSettings disables create for blank name', async () => {
  const w = mount(DialogNewProjectSettings, {
    global: {
      components: { ...dialogNewProjectSettingsStubs },
      mocks: {
        $t: (k: string) => k
      }
    },
    props: {
      directInput: 'NewProjectSettings'
    }
  })
  await flushPromises()
  const create = w.get('[data-test-locator="dialogNewProjectSettings-button-create"]')
  expect((create.element as HTMLButtonElement).disabled).toBe(true)
  await w.get('.dialog-new-project-settings-qinput-mock').setValue('World')
  await flushPromises()
  expect((create.element as HTMLButtonElement).disabled).toBe(false)
  w.unmount()
})

/**
 * DialogNewProjectSettings
 * Closing without create leaves no stale text on the next open because the field resets whenever the sheet opens.
 */
test('Test that DialogNewProjectSettings clears project name when dialog reopens', async () => {
  const w = mount(DialogNewProjectSettings, {
    global: {
      components: { ...dialogNewProjectSettingsStubs },
      mocks: {
        $t: (k: string) => k
      }
    },
    props: {
      directInput: 'NewProjectSettings'
    }
  })
  await flushPromises()
  const inputSel = '.dialog-new-project-settings-qinput-mock'
  await w.get(inputSel).setValue('partial')
  await flushPromises()
  const dlg = w.findComponent({ name: 'QDialog' })
  await dlg.vm.$emit('update:modelValue', false)
  await flushPromises()
  await dlg.vm.$emit('update:modelValue', true)
  await flushPromises()
  expect((w.get(inputSel).element as HTMLInputElement).value).toBe('')
  w.unmount()
})

/**
 * DialogNewProjectSettings
 * Create invokes submit helper with trimmed name.
 */
test('Test that DialogNewProjectSettings calls submit on create', async () => {
  const submit = vi.mocked(runDialogNewProjectSettingsCreate)
  submit.mockReset()
  const w = mount(DialogNewProjectSettings, {
    global: {
      components: { ...dialogNewProjectSettingsStubs },
      mocks: {
        $t: (k: string) => k
      }
    },
    props: {
      directInput: 'NewProjectSettings'
    }
  })
  await flushPromises()
  await w.get('.dialog-new-project-settings-qinput-mock').setValue('  Hi  ')
  await w.get('[data-test-locator="dialogNewProjectSettings-button-create"]').trigger('click')
  await flushPromises()
  expect(submit).toHaveBeenCalled()
  const firstArg = submit.mock.calls[0]?.[0]
  expect(firstArg).toBe('Hi')
  w.unmount()
})
