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
