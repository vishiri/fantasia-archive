/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent, h, ref, watch } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsWorldTemplateLayoutPanel from '../DialogProjectSettingsWorldTemplateLayoutPanel.vue'
import { dialogProjectSettingsWorldDraftFixture } from './dialogProjectSettingsWorldDraftFixtures'
import { buildDialogProjectSettingsDocumentTemplateDraft } from './dialogProjectSettingsDocumentTemplateDraftFixtures'

const documentTemplateFixture = buildDialogProjectSettingsDocumentTemplateDraft({
  icon: 'mdi-account'
})

const layoutTreeStub = defineComponent({
  name: 'DialogProjectSettingsWorldTemplateLayoutTree',
  emits: ['update:templateLayout'],
  template: '<div data-test-locator="dialogProjectSettings-worldTemplateLayoutTree-stub" />'
})

const availableListProps = ref<{
  showFilterEmpty?: boolean
  templates: typeof documentTemplateFixture[]
}>({
  templates: []
})

const availableListStub = defineComponent({
  name: 'DialogProjectSettingsWorldAvailableTemplatesList',
  props: {
    showFilterEmpty: Boolean,
    templates: {
      required: true,
      type: Array
    }
  },
  emits: ['addTemplate'],
  setup (props) {
    watch(() => [props.showFilterEmpty, props.templates] as const, () => {
      availableListProps.value = {
        showFilterEmpty: props.showFilterEmpty,
        templates: props.templates as typeof documentTemplateFixture[]
      }
    }, {
      deep: true,
      immediate: true
    })
    return () => h('div', {
      'data-test-locator': 'dialogProjectSettings-worldAvailableTemplatesList-stub'
    })
  }
})

const filterInputStub = defineComponent({
  name: 'DialogProjectSettingsVerticalTabListFilterInput',
  props: {
    modelValue: {
      default: '',
      type: String
    }
  },
  emits: ['update:modelValue'],
  template: '<input class="available-templates-filter-stub" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
})

/**
 * DialogProjectSettingsWorldTemplateLayoutPanel
 * Renders layout and available-template columns with section titles.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutPanel renders layout panel chrome', () => {
  const w = mount(DialogProjectSettingsWorldTemplateLayoutPanel, {
    props: {
      currentLanguageCode: 'en-US',
      documentTemplates: [documentTemplateFixture],
      world: dialogProjectSettingsWorldDraftFixture()
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsVerticalTabListFilterInput: filterInputStub,
        DialogProjectSettingsWorldAvailableTemplatesList: availableListStub,
        DialogProjectSettingsWorldTemplateLayoutTree: layoutTreeStub,
        QBtn: defineComponent({
          inheritAttrs: true,
          template: '<button type="button" v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>'
        }),
        QSeparator: defineComponent({ template: '<hr />' })
      }
    }
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutPanel"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTitle"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectSettings-worldAvailableTemplatesTitle"]').exists()).toBe(true)
  expect(w.find('.available-templates-filter-stub').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutAddGroup"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTree-stub"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectSettings-worldAvailableTemplatesList-stub"]').exists()).toBe(true)
})

test('Test that DialogProjectSettingsWorldTemplateLayoutPanel filters available templates by query', async () => {
  const w = mount(DialogProjectSettingsWorldTemplateLayoutPanel, {
    props: {
      currentLanguageCode: 'en-US',
      documentTemplates: [
        documentTemplateFixture,
        buildDialogProjectSettingsDocumentTemplateDraft({
          icon: 'mdi-map',
          id: 'template-b',
          titlePluralTranslations: { 'en-US': 'Locations' },
          titleSingularTranslations: {},
          worldAppendixTranslations: { 'en-US': 'atlas' }
        })
      ],
      world: dialogProjectSettingsWorldDraftFixture()
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsVerticalTabListFilterInput: filterInputStub,
        DialogProjectSettingsWorldAvailableTemplatesList: availableListStub,
        DialogProjectSettingsWorldTemplateLayoutTree: layoutTreeStub,
        QBtn: true,
        QSeparator: true
      }
    }
  })

  expect(availableListProps.value.templates).toHaveLength(2)

  await w.find('.available-templates-filter-stub').setValue('atlas')
  expect(availableListProps.value.templates).toEqual([
    expect.objectContaining({
      titlePluralTranslations: { 'en-US': 'Locations' },
      titleSingularTranslations: {},
    })
  ])
  expect(availableListProps.value.showFilterEmpty).toBe(false)

  await w.find('.available-templates-filter-stub').setValue('missing')
  expect(availableListProps.value.templates).toEqual([])
  expect(availableListProps.value.showFilterEmpty).toBe(true)
})

/**
 * DialogProjectSettingsWorldTemplateLayoutPanel
 * Emits update:templateLayout when add-group is clicked.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutPanel emits update:templateLayout on add group', async () => {
  const w = mount(DialogProjectSettingsWorldTemplateLayoutPanel, {
    props: {
      currentLanguageCode: 'en-US',
      documentTemplates: [documentTemplateFixture],
      world: dialogProjectSettingsWorldDraftFixture()
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsVerticalTabListFilterInput: filterInputStub,
        DialogProjectSettingsWorldAvailableTemplatesList: availableListStub,
        DialogProjectSettingsWorldTemplateLayoutTree: layoutTreeStub,
        QBtn: defineComponent({
          inheritAttrs: true,
          template: '<button type="button" v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>'
        }),
        QSeparator: true
      }
    }
  })

  await w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutAddGroup"]').trigger('click')
  expect(w.emitted('update:templateLayout')?.[0]?.[0]).toMatchObject({
    groups: expect.arrayContaining([
      expect.objectContaining({
        displayNameTranslations: {
          'en-US': 'dialogs.projectSettings.fields.worldTemplateLayout.defaultNewGroupName'
        }
      })
    ])
  })
})
