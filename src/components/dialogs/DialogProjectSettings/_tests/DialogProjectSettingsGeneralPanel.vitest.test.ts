import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsGeneralPanel from '../DialogProjectSettingsGeneralPanel.vue'

const qInputStub = defineComponent({
  inheritAttrs: true,
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  methods: {
    onInput (event: Event): void {
      const target = event.target
      const value = target instanceof HTMLInputElement ? target.value : ''
      this.$emit('update:modelValue', value)
    }
  },
  template: `
    <input
      class="q-input-mock"
      v-bind="$attrs"
      :value="modelValue"
      @input="onInput"
    />
  `
})

/**
 * DialogProjectSettingsGeneralPanel
 * Renders the project name field title and forwards input updates.
 */
test('Test that DialogProjectSettingsGeneralPanel emits project name updates', async () => {
  const w = mount(DialogProjectSettingsGeneralPanel, {
    props: {
      nameHasError: false,
      projectName: 'Before'
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        QInput: qInputStub
      }
    }
  })

  expect(w.find('.dialogProjectSettings__generalPanelTitle').text()).toContain(
    'dialogs.projectSettings.fields.projectName.label'
  )

  const input = w.find('[data-test-locator="dialogProjectSettings-input-projectName"]')
  await input.setValue('After')

  expect(w.emitted('update:projectName')?.[0]).toEqual(['After'])
})

/**
 * DialogProjectSettingsGeneralPanel
 * Maps null model updates to an empty project name string.
 */
test('Test that DialogProjectSettingsGeneralPanel emits empty string for null input', async () => {
  const w = mount(DialogProjectSettingsGeneralPanel, {
    props: {
      nameHasError: false,
      projectName: 'Before'
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        QInput: {
          template: '<button type="button" @click="$emit(\'update:modelValue\', null)" />'
        }
      }
    }
  })

  await w.find('button').trigger('click')

  expect(w.emitted('update:projectName')?.[0]).toEqual([''])
})

/**
 * DialogProjectSettingsGeneralPanel
 * Maps undefined model updates to an empty project name string.
 */
test('Test that DialogProjectSettingsGeneralPanel emits empty string for undefined input', async () => {
  const w = mount(DialogProjectSettingsGeneralPanel, {
    props: {
      nameHasError: false,
      projectName: 'Before'
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        QInput: {
          template: '<button type="button" @click="$emit(\'update:modelValue\', undefined)" />'
        }
      }
    }
  })

  await w.find('button').trigger('click')

  expect(w.emitted('update:projectName')?.[0]).toEqual([''])
})
