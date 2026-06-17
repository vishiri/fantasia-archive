/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsWorldsDetailPanel from '../DialogProjectSettingsWorldsDetailPanel.vue'

const worldFixture = {
  color: '',
  colorPallete: '',
  displayName: 'Realm',
  documentCount: 0,
  templateLayout: {
    groups: [],
    placements: []
  },
  id: '550e8400-e29b-41d4-a716-446655440000'
}

const qInputStub = defineComponent({
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
    onInput (event: Event): void {
      const target = event.target
      const value = target instanceof HTMLInputElement ? target.value : ''
      this.$emit('update:modelValue', value)
    }
  },
  template: `
    <div class="q-input-stub-host">
      <input
        class="q-input-stub"
        :value="modelValue"
        v-bind="$attrs"
        @input="onInput"
      />
    </div>
  `
})

const qIconStub = defineComponent({
  inheritAttrs: true,
  template: '<span class="q-icon-stub" v-bind="$attrs"><slot /></span>'
})

const deleteButtonStub = defineComponent({
  props: {
    removeDisabled: {
      type: Boolean,
      default: false
    },
    removeDisabledReason: {
      type: String,
      default: null
    }
  },
  emits: ['confirm'],
  template: `
    <div>
      <button
        type="button"
        data-test-locator="dialogProjectSettings-worlds-removeButton"
        :disabled="removeDisabled"
        @click="$emit('confirm')"
      />
      <span
        v-if="removeDisabled"
        class="q-tooltip-stub"
      >
        {{
          removeDisabledReason === 'hasDocuments'
            ? 'dialogs.projectSettings.panels.worlds.removeDisabledHasDocuments'
            : 'dialogs.projectSettings.panels.worlds.removeDisabledLastWorld'
        }}
      </span>
    </div>
  `
})

const paletteEditorStub = defineComponent({
  name: 'DialogProjectSettingsWorldColorPaletteEditor',
  props: {
    colorPallete: {
      type: String,
      default: ''
    }
  },
  emits: ['update:colorPallete'],
  template: `
    <button
      type="button"
      data-test-locator="dialogProjectSettings-worlds-colorPaletteEditor"
      @click="$emit('update:colorPallete', '#112233;#445566')"
    />
  `
})

const faColorPickerInputStub = defineComponent({
  name: 'FaColorPickerInput',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    palette: {
      type: Array,
      default: () => []
    },
    testLocator: {
      type: String,
      required: true
    }
  },
  emits: ['update:modelValue'],
  template: `
    <div class="fa-color-picker-input-stub">
      <span
        :data-test-locator="testLocator + '-swatch'"
        :style="{ backgroundColor: modelValue.trim() || '#808080' }"
      />
      <input
        class="fa-color-picker-input-stub-field"
        :data-test-locator="testLocator"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <button
        type="button"
        class="fa-color-picker-input-stub-picker"
        @click="$emit('update:modelValue', '#aabbcc')"
      />
    </div>
  `
})

/**
 * DialogProjectSettingsWorldsDetailPanel
 * Emits display-name and color updates from the detail inputs.
 */
test('Test that DialogProjectSettingsWorldsDetailPanel emits field updates', async () => {
  const w = mount(DialogProjectSettingsWorldsDetailPanel, {
    props: {
      nameHasError: false,
      removeDisabled: false,
      removeDisabledReason: null,
      documentTemplates: [],
      world: worldFixture
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsWorldColorPaletteEditor: paletteEditorStub,
        DialogProjectSettingsWorldsDeleteButton: deleteButtonStub,
        FaColorPickerInput: faColorPickerInputStub,
        QBtn: defineComponent({
          inheritAttrs: true,
          template: '<button type="button" v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>'
        }),
        QIcon: qIconStub,
        QInput: qInputStub,
        QTooltip: defineComponent({ template: '<span><slot /></span>' })
      }
    }
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-worlds-nameLabel"]').text()).toBe(
    'dialogs.projectSettings.fields.worldName.label'
  )
  expect(w.find('[data-test-locator="dialogProjectSettings-worlds-colorLabel"]').text()).toBe(
    'dialogs.projectSettings.fields.worldColor.label'
  )
  expect(w.find('[data-test-locator="dialogProjectSettings-worlds-colorTooltipIcon"]').attributes('data-test-tooltip-text')).toBe(
    'dialogs.projectSettings.fields.worldColor.tooltip'
  )
  expect(w.find('[data-test-locator="dialogProjectSettings-worlds-colorPaletteLabel"]').text()).toBe(
    'dialogs.projectSettings.fields.worldColorPalette.label'
  )
  expect(w.find('[data-test-locator="dialogProjectSettings-worlds-colorPaletteTooltipIcon"]').attributes('data-test-tooltip-text')).toBe(
    [
      'dialogs.projectSettings.fields.worldColorPalette.tooltipIntro',
      '',
      'dialogs.projectSettings.fields.worldColorPalette.tooltipRightClickIntro',
      '- dialogs.projectSettings.fields.worldColorPalette.tooltipRightClickDeletion',
      '- dialogs.projectSettings.fields.worldColorPalette.tooltipRightClickDuplication'
    ].join('\n')
  )

  await w.find('input.q-input-stub').setValue('Renamed')
  await w.find('.fa-color-picker-input-stub-field').setValue('#112233')
  expect(w.emitted('update:displayName')?.[0]).toEqual(['Renamed'])
  expect(w.emitted('update:color')?.[0]).toEqual(['#112233'])

  await w.setProps({
    world: {
      ...worldFixture,
      color: '#112233',
      colorPallete: '',
      displayName: 'Renamed'
    }
  })
  expect(w.find('[data-test-locator="dialogProjectSettings-worlds-colorInput-swatch"]').attributes('style')).toContain(
    'background-color: rgb(17, 34, 51)'
  )

  await w.find('.fa-color-picker-input-stub-picker').trigger('click')
  expect(w.emitted('update:color')?.slice(-1)[0]).toEqual(['#aabbcc'])

  await w.find('[data-test-locator="dialogProjectSettings-worlds-colorPaletteEditor"]').trigger('click')
  expect(w.emitted('update:colorPallete')?.[0]).toEqual(['#112233;#445566'])

  const colorPicker = w.findComponent({ name: 'FaColorPickerInput' })
  expect(colorPicker.props('palette')).toEqual([])

  await w.setProps({
    world: {
      ...worldFixture,
      color: '#112233',
      colorPallete: '#112233;#445566',
      displayName: 'Renamed'
    }
  })
  expect(colorPicker.props('palette')).toEqual(['#112233', '#445566'])

  await w.find('[data-test-locator="dialogProjectSettings-worlds-removeButton"]').trigger('click')
  expect(w.emitted('remove')).toBeTruthy()
})

/**
 * DialogProjectSettingsWorldsDetailPanel
 * Normalizes null model updates to empty strings.
 */
test('Test that DialogProjectSettingsWorldsDetailPanel normalizes null field updates', async () => {
  const nullEmitColorPickerStub = defineComponent({
    name: 'FaColorPickerInput',
    emits: ['update:modelValue'],
    template: `
      <button
        type="button"
        class="fa-color-picker-input-null-stub"
        @click="$emit('update:modelValue', '')"
      />
    `
  })

  const nullEmitInputStub = defineComponent({
    name: 'QInput',
    inheritAttrs: true,
    template: `
      <button
        type="button"
        class="q-input-null-stub"
        v-bind="$attrs"
        @click="$emit('update:modelValue', null)"
      />
    `
  })

  const w = mount(DialogProjectSettingsWorldsDetailPanel, {
    props: {
      nameHasError: false,
      removeDisabled: false,
      removeDisabledReason: null,
      documentTemplates: [],
      world: worldFixture
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsWorldsDeleteButton: deleteButtonStub,
        FaColorPickerInput: nullEmitColorPickerStub,
        QIcon: qIconStub,
        QInput: nullEmitInputStub,
        QTooltip: true
      }
    }
  })

  await w.find('.q-input-null-stub').trigger('click')
  await w.find('.fa-color-picker-input-null-stub').trigger('click')

  expect(w.emitted('update:displayName')?.[0]).toEqual([''])
  expect(w.emitted('update:color')?.[0]).toEqual([''])
})

/**
 * DialogProjectSettingsWorldsDetailPanel
 * Shows validation styling and remove-disabled tooltips when configured.
 */
test('Test that DialogProjectSettingsWorldsDetailPanel reflects validation and remove-disabled state', () => {
  const w = mount(DialogProjectSettingsWorldsDetailPanel, {
    props: {
      nameHasError: true,
      removeDisabled: true,
      removeDisabledReason: 'hasDocuments',
      documentTemplates: [],
      world: {
        ...worldFixture,
        color: '  '
      }
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsWorldColorPaletteEditor: true,
        DialogProjectSettingsWorldsDeleteButton: deleteButtonStub,
        FaColorPickerInput: true,
        QIcon: qIconStub,
        QInput: qInputStub,
        QTooltip: true
      }
    }
  })

  expect(
    w.find('[data-test-locator="dialogProjectSettings-worlds-nameInput"]').attributes('data-test-validation-error')
  ).toBe('true')
  expect(
    w.find('[data-test-locator="dialogProjectSettings-worlds-removeButton"]').attributes('disabled')
  ).toBeDefined()
  expect(w.find('.q-tooltip-stub').text()).toContain(
    'dialogs.projectSettings.panels.worlds.removeDisabledHasDocuments'
  )
})
