/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { expect, test } from 'vitest'

import DialogProjectSettingsDocumentTemplatesDetailPanel from '../DialogProjectSettingsDocumentTemplatesDetailPanel.vue'
import { buildDialogProjectSettingsDocumentTemplateDraft } from './dialogProjectSettingsDocumentTemplateDraftFixtures'

const detailPanelI18n = createI18n({
  legacy: false,
  locale: 'en-US',
  messages: {
    'en-US': {
      dialogs: {
        projectSettings: {
          fields: {
            documentTemplateIcon: {
              label: 'Icon'
            },
            documentTemplateName: {
              errorRequired: 'At least one document template title translation is required.',
              label: 'Document template name'
            },
            documentTemplateWorldAppendix: {
              label: 'World appendix',
              tooltip: 'World appendix tooltip'
            }
          }
        }
      }
    }
  }
})

const detailPanelMountGlobal = {
  plugins: [detailPanelI18n],
  stubs: {
    DialogProjectSettingsDocumentTemplatesDeleteButton: defineComponent({
      template: '<button data-test-locator="delete-stub" />'
    }),
    FaIconPickerInput: defineComponent({
      inheritAttrs: false,
      props: {
        modelValue: {
          type: String,
          default: ''
        },
        testLocator: {
          type: String,
          required: true
        }
      },
      emits: ['update:modelValue'],
      template: `
        <div :data-test-locator="testLocator">
          <button
            :data-test-locator="testLocator + '-trigger'"
            type="button"
            @click="$emit('update:modelValue', 'mdi-pencil')"
          />
        </div>
      `
    }),
    FaLocaleTranslationsInput: defineComponent({
      inheritAttrs: false,
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
        <div
          :data-test-locator="testLocator"
          :data-test-current-language-code="currentLanguageCode"
        />
      `
    }),
    QInput: defineComponent({
      inheritAttrs: true,
      props: {
        modelValue: {
          type: String,
          default: ''
        }
      },
      emits: ['update:modelValue'],
      template: `
        <div v-bind="$attrs">
          <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
        </div>
      `
    }),
    QIcon: defineComponent({
      inheritAttrs: true,
      template: '<span v-bind="$attrs"><slot /></span>'
    }),
    QTooltip: defineComponent({
      template: '<span><slot /></span>'
    })
  }
}

/**
 * DialogProjectSettingsDocumentTemplatesDetailPanel
 * Renders name, world appendix, and icon inputs for the selected template.
 */
test('Test that DialogProjectSettingsDocumentTemplatesDetailPanel renders template fields', () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesDetailPanel, {
    props: {
      currentLanguageCode: 'en-US',
      nameHasError: false,
      removeDisabled: false,
      template: buildDialogProjectSettingsDocumentTemplateDraft({
        icon: 'mdi-account',
        worldAppendixTranslations: { 'en-US': 'Notes' }
      })
    },
    global: detailPanelMountGlobal
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-documentTemplates-nameInput"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectSettings-documentTemplates-worldAppendixInput"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectSettings-documentTemplates-worldAppendixTooltipIcon"]').attributes('data-test-tooltip-text')).toBe(
    'World appendix tooltip'
  )
  expect(w.find('[data-test-locator="dialogProjectSettings-documentTemplates-iconInput"]').exists()).toBe(true)
})

test('Test that DialogProjectSettingsDocumentTemplatesDetailPanel wires locale translations input to current language', () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesDetailPanel, {
    props: {
      currentLanguageCode: 'de',
      nameHasError: false,
      removeDisabled: false,
      template: buildDialogProjectSettingsDocumentTemplateDraft()
    },
    global: detailPanelMountGlobal
  })

  expect(
    w.find('[data-test-locator="dialogProjectSettings-documentTemplates-nameInput"]').attributes('data-test-current-language-code')
  ).toBe('de')
})

/**
 * DialogProjectSettingsDocumentTemplatesDetailPanel
 * Forwards title, appendix, icon, and remove events from child inputs.
 */
test('Test that DialogProjectSettingsDocumentTemplatesDetailPanel forwards field updates and remove', async () => {
  const emitFaLocaleTranslationsInputStub = defineComponent({
    name: 'FaLocaleTranslationsInput',
    inheritAttrs: false,
    props: {
      modelValue: {
        type: Object,
        required: true
      },
      testLocator: {
        type: String,
        required: true
      },
      translationForms: {
        type: String,
        default: 'single'
      }
    },
    emits: ['update:modelValue'],
    template: `
      <button
        type="button"
        :data-test-locator="testLocator + '-emit'"
        @click="
          $emit(
            'update:modelValue',
            translationForms === 'singularPlural'
              ? { plural: { 'en-US': 'Hero' }, singular: {} }
              : { 'en-US': 'Notes' }
          )
        "
      />
    `
  })

  const emitIconPickerStub = defineComponent({
    name: 'FaIconPickerInput',
    emits: ['update:modelValue'],
    template: '<button type="button" data-test-locator="emit-icon" @click="$emit(\'update:modelValue\', null)" />'
  })

  const w = mount(DialogProjectSettingsDocumentTemplatesDetailPanel, {
    props: {
      currentLanguageCode: 'en-US',
      nameHasError: true,
      removeDisabled: false,
      template: buildDialogProjectSettingsDocumentTemplateDraft()
    },
    global: {
      plugins: [detailPanelI18n],
      stubs: {
        DialogProjectSettingsDocumentTemplatesDeleteButton: defineComponent({
          emits: ['confirm'],
          template: '<button type="button" data-test-locator="emit-remove" @click="$emit(\'confirm\')" />'
        }),
        FaIconPickerInput: emitIconPickerStub,
        FaLocaleTranslationsInput: emitFaLocaleTranslationsInputStub,
        QIcon: defineComponent({
          inheritAttrs: true,
          template: '<span v-bind="$attrs"><slot /></span>'
        }),
        QTooltip: defineComponent({ template: '<span><slot /></span>' })
      }
    }
  })

  await w.find('[data-test-locator="dialogProjectSettings-documentTemplates-nameInput-emit"]').trigger('click')
  expect(w.emitted('update:title-translations')?.[0]).toEqual([
    {
      plural: { 'en-US': 'Hero' },
      singular: {}
    }
  ])

  await w.find('[data-test-locator="dialogProjectSettings-documentTemplates-worldAppendixInput-emit"]').trigger('click')
  expect(w.emitted('update:worldAppendixTranslations')?.[0]).toEqual([{ 'en-US': 'Notes' }])

  await w.find('[data-test-locator="emit-icon"]').trigger('click')
  expect(w.emitted('update:icon')?.[0]).toEqual([''])

  await w.find('[data-test-locator="emit-remove"]').trigger('click')
  expect(w.emitted('remove')).toBeTruthy()
})
