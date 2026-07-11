/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsWorldsDetailPanel from '../DialogProjectSettingsWorldsDetailPanel.vue'
import { mergeDialogProjectSettingsVitestGlobal } from 'app/helpers/dialogProjectSettingsVitestI18n'
import { expectInlineStyleColor } from 'app/helpers/vitestCssColorExpect'

const worldFixture = {
  color: '',
  colorPallete: '',
  displayNameTranslations: { 'en-US': 'Realm' },
  documentCount: 0,
  templateLayout: {
    groups: [],
    placements: []
  },
  id: '550e8400-e29b-41d4-a716-446655440000'
}

const faLocaleTranslationsInputStub = defineComponent({
  name: 'FaLocaleTranslationsInput',
  props: {
    currentLanguageCode: {
      type: String,
      required: true
    },
    modelValue: {
      type: Object,
      required: true
    },
    testLocator: {
      type: String,
      required: true
    }
  },
  emits: ['update:modelValue'],
  template: `
    <button
      type="button"
      class="fa-locale-translations-input-stub"
      :data-test-locator="testLocator"
      @click="$emit('update:modelValue', { 'en-US': 'Renamed' })"
    />
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
      currentLanguageCode: 'en-US',
      nameHasError: false,
      removeDisabled: false,
      removeDisabledReason: null,
      documentTemplates: [],
      world: worldFixture
    },
    global: mergeDialogProjectSettingsVitestGlobal({
      stubs: {
        DialogProjectSettingsWorldColorPaletteEditor: paletteEditorStub,
        DialogProjectSettingsWorldsDeleteButton: deleteButtonStub,
        FaColorPickerInput: faColorPickerInputStub,
        FaLocaleTranslationsInput: faLocaleTranslationsInputStub,
        QBtn: defineComponent({
          inheritAttrs: true,
          template: '<button type="button" v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>'
        }),
        QIcon: qIconStub,
        QTooltip: defineComponent({ template: '<span><slot /></span>' })
      }
    })
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

  await w.find('.fa-locale-translations-input-stub').trigger('click')
  await w.find('.fa-color-picker-input-stub-field').setValue('#112233')
  expect(w.emitted('update:displayNameTranslations')?.[0]).toEqual([{ 'en-US': 'Renamed' }])
  expect(w.emitted('update:color')?.[0]).toEqual(['#112233'])

  await w.setProps({
    world: {
      ...worldFixture,
      color: '#112233',
      colorPallete: '',
      displayNameTranslations: { 'en-US': 'Renamed' }
    }
  })
  expectInlineStyleColor(
    w.find('[data-test-locator="dialogProjectSettings-worlds-colorInput-swatch"]').attributes('style'),
    'background-color',
    '#112233'
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
      displayNameTranslations: { 'en-US': 'Renamed' }
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
  const nullEmitFaLocaleTranslationsInputStub = defineComponent({
    name: 'FaLocaleTranslationsInput',
    inheritAttrs: true,
    template: `
      <button
        type="button"
        class="fa-locale-translations-input-null-stub"
        v-bind="$attrs"
        @click="$emit('update:modelValue', { 'en-US': '' })"
      />
    `
  })

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

  const w = mount(DialogProjectSettingsWorldsDetailPanel, {
    props: {
      currentLanguageCode: 'en-US',
      nameHasError: false,
      removeDisabled: false,
      removeDisabledReason: null,
      documentTemplates: [],
      world: worldFixture
    },
    global: mergeDialogProjectSettingsVitestGlobal({
      stubs: {
        DialogProjectSettingsWorldsDeleteButton: deleteButtonStub,
        FaColorPickerInput: nullEmitColorPickerStub,
        FaLocaleTranslationsInput: nullEmitFaLocaleTranslationsInputStub,
        QIcon: qIconStub,
        QTooltip: true
      }
    })
  })

  await w.find('.fa-locale-translations-input-null-stub').trigger('click')
  await w.find('.fa-color-picker-input-null-stub').trigger('click')

  expect(w.emitted('update:displayNameTranslations')?.[0]).toEqual([{ 'en-US': '' }])
  expect(w.emitted('update:color')?.[0]).toEqual([''])
})

/**
 * DialogProjectSettingsWorldsDetailPanel
 * Shows validation styling and remove-disabled tooltips when configured.
 */
test('Test that DialogProjectSettingsWorldsDetailPanel reflects validation and remove-disabled state', () => {
  const w = mount(DialogProjectSettingsWorldsDetailPanel, {
    props: {
      currentLanguageCode: 'en-US',
      nameHasError: true,
      removeDisabled: true,
      removeDisabledReason: 'hasDocuments',
      documentTemplates: [],
      world: {
        ...worldFixture,
        color: '  '
      }
    },
    global: mergeDialogProjectSettingsVitestGlobal({
      stubs: {
        DialogProjectSettingsWorldColorPaletteEditor: true,
        DialogProjectSettingsWorldsDeleteButton: deleteButtonStub,
        FaColorPickerInput: true,
        FaLocaleTranslationsInput: faLocaleTranslationsInputStub,
        QIcon: qIconStub,
        QTooltip: true
      }
    })
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

/**
 * DialogProjectSettingsWorldsDetailPanel
 * Forwards template layout updates from the world layout panel.
 */
test('Test that DialogProjectSettingsWorldsDetailPanel forwards template layout updates', async () => {
  const layoutPanelStub = defineComponent({
    name: 'DialogProjectSettingsWorldTemplateLayoutPanel',
    emits: ['update:templateLayout'],
    template: '<button type="button" data-test-locator="emit-template-layout" @click="$emit(\'update:templateLayout\', { groups: [], placements: [] })" />'
  })

  const w = mount(DialogProjectSettingsWorldsDetailPanel, {
    props: {
      currentLanguageCode: 'en-US',
      documentTemplates: [],
      nameHasError: false,
      removeDisabled: false,
      removeDisabledReason: null,
      world: worldFixture
    },
    global: mergeDialogProjectSettingsVitestGlobal({
      stubs: {
        DialogProjectSettingsWorldColorPaletteEditor: true,
        DialogProjectSettingsWorldTemplateLayoutPanel: layoutPanelStub,
        DialogProjectSettingsWorldsDeleteButton: deleteButtonStub,
        FaColorPickerInput: true,
        FaLocaleTranslationsInput: faLocaleTranslationsInputStub,
        QIcon: qIconStub,
        QTooltip: true
      }
    })
  })

  await w.find('[data-test-locator="emit-template-layout"]').trigger('click')
  expect(w.emitted('update:templateLayout')?.[0]).toEqual([{
    groups: [],
    placements: []
  }])
})
