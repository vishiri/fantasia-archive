/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, nextTick } from 'vue'
import { expect, test, vi, beforeEach } from 'vitest'

import { S_DialogComponent } from 'app/src/stores/S_Dialog'

import DialogNewProject from '../DialogNewProject.vue'

vi.mock('../scripts/dialogNewProjectSubmit', () => {
  return {
    runDialogNewProjectCreate: vi.fn(
      async (_projectName: string, closeDialog: () => void) => {
        closeDialog()
      }
    )
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
  emits: ['update:modelValue', 'show'],
  watch: {
    modelValue: {
      immediate: true,
      handler (v: boolean) {
        if (v) {
          void this.$nextTick(() => {
            this.$emit('show')
          })
        }
      }
    }
  },
  template: '<div class="q-dialog-stub"><div v-show="modelValue" class="q-dialog-stub-inner"><slot /></div></div>'
})

const dialogNewProjectQInputFocusMock = vi.fn()

const dialogNewProjectQInputStub = defineComponent({
  name: 'QInput',
  inheritAttrs: true,
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  methods: {
    focus (): void {
      dialogNewProjectQInputFocusMock()
      ;(this.$el as HTMLInputElement).focus()
    },
    onInput (e: Event): void {
      const v = (e.target as HTMLInputElement).value
      this.$emit('update:modelValue', v)
    }
  },
  template: `
    <input
      class="dialog-new-project-qinput-mock"
      :value="modelValue"
      v-bind="$attrs"
      @input="onInput"
    />
  `
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

beforeEach(() => {
  dialogNewProjectQInputFocusMock.mockClear()
})

/**
 * DialogNewProject
 * Name field focuses when the dialog shows so typing can start without an extra click.
 */
test('Test that DialogNewProject focuses name input when dialog opens', async () => {
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
  await nextTick()
  await nextTick()
  await flushPromises()
  expect(dialogNewProjectQInputFocusMock).toHaveBeenCalledTimes(1)
  w.unmount()
})

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
 * Enter on the name field matches create; with a blank trimmed name it returns before invoking submit.
 */
test('Test that DialogNewProject treats enter on blank name like a gated create action', async () => {
  const submit = vi.mocked(runDialogNewProjectCreate)
  submit.mockClear()
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

  await w.get('.dialog-new-project-qinput-mock').trigger('keyup.enter')
  await flushPromises()

  expect(submit).not.toHaveBeenCalled()
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

/**
 * DialogNewProject
 * S_DialogComponent UUID watch should open when dialogToOpen is NewProject.
 */
test('Test that DialogNewProject opens from S_DialogComponent when dialogToOpen is NewProject', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = S_DialogComponent()

  const w = mount(DialogNewProject, {
    global: {
      components: { ...dialogNewProjectStubs },
      mocks: {
        $t: (k: string) => k
      },
      plugins: [pinia]
    },
    props: {}
  })

  await flushPromises()
  const dlgClosed = w.findComponent({ name: 'QDialog' })
  expect(dlgClosed.props('modelValue')).toBe(false)

  store.dialogToOpen = 'NewProject'
  store.generateDialogUUID()
  await flushPromises()
  await nextTick()

  const dlgOpen = w.findComponent({ name: 'QDialog' })
  expect(dlgOpen.props('modelValue')).toBe(true)
  w.unmount()
})

/**
 * DialogNewProject
 * Store UUID churn for other routed dialogs leaves the sheet closed unless the target is NewProject.
 */
test('Test that DialogNewProject skips open when routed dialog differs from NewProject', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = S_DialogComponent()

  const w = mount(DialogNewProject, {
    global: {
      components: { ...dialogNewProjectStubs },
      mocks: {
        $t: (k: string) => k
      },
      plugins: [pinia]
    },
    props: {}
  })

  await flushPromises()

  store.dialogToOpen = 'KeybindSettings'
  store.generateDialogUUID()
  await flushPromises()
  await nextTick()

  expect(w.findComponent({ name: 'QDialog' }).props('modelValue')).toBe(false)

  w.unmount()
})

/**
 * DialogNewProject
 * directInput prop watch only opens for the NewProject shell so other dialog ids stay ignored.
 */
test('Test that DialogNewProject ignores directInput values other than NewProject', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)

  const w = mount(DialogNewProject, {
    global: {
      components: { ...dialogNewProjectStubs },
      mocks: {
        $t: (k: string) => k
      },
      plugins: [pinia]
    },
    props: {
      directInput: ''
    }
  })

  await flushPromises()
  expect(w.findComponent({ name: 'QDialog' }).props('modelValue')).toBe(false)

  await w.setProps({ directInput: 'AppSettings' })
  await flushPromises()
  await nextTick()

  expect(w.findComponent({ name: 'QDialog' }).props('modelValue')).toBe(false)

  w.unmount()
})

/**
 * DialogNewProject
 * directInput watch should open the dialog when the prop is set to NewProject after mount.
 */
test('Test that DialogNewProject opens when directInput becomes NewProject after mount', async () => {
  const pinia = createPinia()
  setActivePinia(pinia)

  const w = mount(DialogNewProject, {
    global: {
      components: { ...dialogNewProjectStubs },
      mocks: {
        $t: (k: string) => k
      },
      plugins: [pinia]
    },
    props: {}
  })

  await flushPromises()
  expect(w.findComponent({ name: 'QDialog' }).props('modelValue')).toBe(false)

  await w.setProps({ directInput: 'NewProject' })
  await flushPromises()
  await nextTick()

  expect(w.findComponent({ name: 'QDialog' }).props('modelValue')).toBe(true)
  w.unmount()
})
