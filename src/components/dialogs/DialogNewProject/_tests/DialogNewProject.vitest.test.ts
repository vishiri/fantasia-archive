/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { expect, test, vi } from 'vitest'

import DialogNewProject from '../DialogNewProject.vue'

vi.mock('../scripts/dialogNewProjectSubmit', () => {
  return {
    runDialogNewProjectCreate: vi.fn(async () => undefined)
  }
})

import { runDialogNewProjectCreate } from '../scripts/dialogNewProjectSubmit'

const dialogNewProjectQDialogStub = defineComponent({
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

const dialogNewProjectQInputStub = defineComponent({
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
  template: '<input class="dialog-new-project-qinput-mock" :value="modelValue" @input="onInput" />'
})

const dialogNewProjectQBtnStub = defineComponent({
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

const dialogNewProjectStubs = {
  QBtn: dialogNewProjectQBtnStub,
  QDialog: dialogNewProjectQDialogStub,
  QInput: dialogNewProjectQInputStub
}

/**
 * DialogNewProject
 * Create stays disabled until the name is non-empty after trim.
 */
test('Test that DialogNewProject disables create for blank name', async () => {
  const w = mount(DialogNewProject, {
    global: {
      components: { ...dialogNewProjectStubs },
      mocks: {
        $t: (k: string) => k
      }
    },
    props: {
      directInput: 'NewProject'
    }
  })
  await flushPromises()
  const create = w.get('[data-test-locator="dialogNewProject-button-create"]')
  expect((create.element as HTMLButtonElement).disabled).toBe(true)
  await w.get('.dialog-new-project-qinput-mock').setValue('World')
  await flushPromises()
  expect((create.element as HTMLButtonElement).disabled).toBe(false)
  w.unmount()
})

/**
 * DialogNewProject
 * Closing without create leaves no stale text on the next open because the field resets whenever the sheet opens.
 */
test('Test that DialogNewProject clears project name when dialog reopens', async () => {
  const w = mount(DialogNewProject, {
    global: {
      components: { ...dialogNewProjectStubs },
      mocks: {
        $t: (k: string) => k
      }
    },
    props: {
      directInput: 'NewProject'
    }
  })
  await flushPromises()
  const inputSel = '.dialog-new-project-qinput-mock'
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
 * DialogNewProject
 * Create invokes submit helper with trimmed name.
 */
test('Test that DialogNewProject calls submit on create', async () => {
  const submit = vi.mocked(runDialogNewProjectCreate)
  submit.mockReset()
  const w = mount(DialogNewProject, {
    global: {
      components: { ...dialogNewProjectStubs },
      mocks: {
        $t: (k: string) => k
      }
    },
    props: {
      directInput: 'NewProject'
    }
  })
  await flushPromises()
  await w.get('.dialog-new-project-qinput-mock').setValue('  Hi  ')
  await w.get('[data-test-locator="dialogNewProject-button-create"]').trigger('click')
  await flushPromises()
  expect(submit).toHaveBeenCalled()
  const firstArg = submit.mock.calls[0]?.[0]
  expect(firstArg).toBe('Hi')
  w.unmount()
})
