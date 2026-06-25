/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent, h, ref, watch } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsWorldTemplateLayoutPanel from '../DialogProjectSettingsWorldTemplateLayoutPanel.vue'
import { dialogProjectSettingsWorldDraftFixture } from './dialogProjectSettingsWorldDraftFixtures'
import { buildDialogProjectSettingsDocumentTemplateDraft } from './dialogProjectSettingsDocumentTemplateDraftFixtures'
import {
  appendDialogProjectSettingsWorldTemplatePlacementDraft,
  createEmptyDialogProjectSettingsWorldTemplateLayoutDraft
} from '../scripts/dialogProjectSettingsWorldTemplateLayoutDraft'

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

/**
 * DialogProjectSettingsWorldTemplateLayoutPanel
 * Binds world template layout props on the embedded layout tree.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutPanel binds layout tree props', () => {
  const capturedTreeProps = ref<Record<string, unknown> | null>(null)
  const capturingTreeStub = defineComponent({
    name: 'DialogProjectSettingsWorldTemplateLayoutTree',
    props: {
      blankGroupIds: {
        type: Object,
        default: undefined
      },
      currentLanguageCode: {
        type: String,
        required: true
      },
      documentTemplates: {
        type: Array,
        required: true
      },
      duplicateDocumentTemplateIds: {
        type: Object,
        default: undefined
      },
      invalidDocumentTemplateIds: {
        type: Object,
        default: undefined
      },
      templateLayout: {
        type: Object,
        required: true
      }
    },
    setup (props) {
      capturedTreeProps.value = props
      return () => h('div', { 'data-test-locator': 'dialogProjectSettings-worldTemplateLayoutTree-capture' })
    }
  })

  const world = dialogProjectSettingsWorldDraftFixture()
  const invalidTemplate = buildDialogProjectSettingsDocumentTemplateDraft({
    titlePluralTranslations: {},
    titleSingularTranslations: {}
  })

  const w = mount(DialogProjectSettingsWorldTemplateLayoutPanel, {
    props: {
      currentLanguageCode: 'en-US',
      documentTemplates: [documentTemplateFixture, invalidTemplate],
      world
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsVerticalTabListFilterInput: filterInputStub,
        DialogProjectSettingsWorldAvailableTemplatesList: availableListStub,
        DialogProjectSettingsWorldTemplateLayoutTree: capturingTreeStub,
        QBtn: defineComponent({
          inheritAttrs: true,
          template: '<button type="button" v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>'
        }),
        QSeparator: defineComponent({ template: '<hr />' })
      }
    }
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTree-capture"]').exists()).toBe(true)
  expect(capturedTreeProps.value?.currentLanguageCode).toBe('en-US')
  expect(capturedTreeProps.value?.templateLayout).toEqual(world.templateLayout)
  expect(capturedTreeProps.value?.invalidDocumentTemplateIds).toEqual(
    new Set([invalidTemplate.id])
  )
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
  expect(w.emitted('update:templateLayout')?.[0]?.[0]!).toMatchObject({
    groups: expect.arrayContaining([
      expect.objectContaining({
        displayNameTranslations: {
          'en-US': 'dialogs.projectSettings.fields.worldTemplateLayout.defaultNewGroupName'
        }
      })
    ])
  })
})

/**
 * DialogProjectSettingsWorldTemplateLayoutPanel
 * Forwards tree mutations and available-template add events.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutPanel forwards tree and available template events', async () => {
  const treeEventStub = defineComponent({
    name: 'DialogProjectSettingsWorldTemplateLayoutTree',
    emits: [
      'deleteGroup',
      'removePlacement',
      'renamePlacementNickname',
      'renameGroup',
      'update:templateLayout'
    ],
    template: `
      <div>
        <button type="button" data-test-locator="emit-delete-group" @click="$emit('deleteGroup', 'group-a')" />
        <button type="button" data-test-locator="emit-remove-placement" @click="$emit('removePlacement', 'placement-a')" />
        <button type="button" data-test-locator="emit-rename-group" @click="$emit('renameGroup', 'group-a', { 'en-US': 'Renamed' })" />
        <button
          type="button"
          data-test-locator="emit-rename-placement"
          @click="$emit('renamePlacementNickname', 'placement-a', { plural: { 'en-US': 'Alias' }, singular: {} })"
        />
        <button type="button" data-test-locator="emit-layout" @click="$emit('update:templateLayout', { groups: [], placements: [] })" />
      </div>
    `
  })

  const availableListEventStub = defineComponent({
    name: 'DialogProjectSettingsWorldAvailableTemplatesList',
    emits: ['addTemplate'],
    template: '<button type="button" data-test-locator="emit-add-template" @click="$emit(\'addTemplate\', \'7c9e6679-7425-40de-944b-e07fc1f90ae7\')" />'
  })

  const invalidTemplate = buildDialogProjectSettingsDocumentTemplateDraft({
    id: 'template-invalid',
    titlePluralTranslations: {},
    titleSingularTranslations: {}
  })

  const w = mount(DialogProjectSettingsWorldTemplateLayoutPanel, {
    props: {
      currentLanguageCode: 'en-US',
      documentTemplates: [documentTemplateFixture, invalidTemplate],
      world: dialogProjectSettingsWorldDraftFixture()
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsVerticalTabListFilterInput: filterInputStub,
        DialogProjectSettingsWorldAvailableTemplatesList: availableListEventStub,
        DialogProjectSettingsWorldTemplateLayoutTree: treeEventStub,
        QBtn: true,
        QSeparator: true
      }
    }
  })

  await w.find('[data-test-locator="emit-delete-group"]').trigger('click')
  await w.find('[data-test-locator="emit-remove-placement"]').trigger('click')
  await w.find('[data-test-locator="emit-rename-group"]').trigger('click')
  await w.find('[data-test-locator="emit-rename-placement"]').trigger('click')
  await w.find('[data-test-locator="emit-layout"]').trigger('click')
  await w.find('[data-test-locator="emit-add-template"]').trigger('click')

  expect(w.emitted('update:templateLayout')?.length).toBeGreaterThanOrEqual(5)
  const appendedLayout = w.emitted('update:templateLayout')?.at(-1)?.[0] as {
    placements: { documentTemplateId: string }[]
  }
  expect(appendedLayout.placements.some((placement) => {
    return placement.documentTemplateId === documentTemplateFixture.id
  })).toBe(true)
})

/**
 * DialogProjectSettingsWorldTemplateLayoutPanel
 * Excludes assigned templates from the available-templates column.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutPanel filters assigned templates from available list', () => {
  const world = dialogProjectSettingsWorldDraftFixture({
    templateLayout: appendDialogProjectSettingsWorldTemplatePlacementDraft(
      createEmptyDialogProjectSettingsWorldTemplateLayoutDraft(),
      {
        documentTemplateId: documentTemplateFixture.id,
        icon: documentTemplateFixture.icon,
        templateDisplayName: 'Character',
        worldAppendix: 'sheet'
      }
    )
  })

  const w = mount(DialogProjectSettingsWorldTemplateLayoutPanel, {
    props: {
      currentLanguageCode: 'en-US',
      documentTemplates: [
        documentTemplateFixture,
        buildDialogProjectSettingsDocumentTemplateDraft({
          id: 'template-b',
          titlePluralTranslations: { 'en-US': 'Locations' }
        })
      ],
      world
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

  expect(w.exists()).toBe(true)
  expect(availableListProps.value.templates).toEqual([
    expect.objectContaining({ id: 'template-b' })
  ])
})

/**
 * DialogProjectSettingsWorldTemplateLayoutPanel
 * Ignores add-template requests for unknown document template ids.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutPanel ignores unknown template ids', async () => {
  const unknownTemplateListStub = defineComponent({
    name: 'DialogProjectSettingsWorldAvailableTemplatesList',
    emits: ['addTemplate'],
    template: '<button type="button" data-test-locator="emit-unknown-template" @click="$emit(\'addTemplate\', \'missing-template-id\')" />'
  })

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
        DialogProjectSettingsWorldAvailableTemplatesList: unknownTemplateListStub,
        DialogProjectSettingsWorldTemplateLayoutTree: layoutTreeStub,
        QBtn: true,
        QSeparator: true
      }
    }
  })

  await w.find('[data-test-locator="emit-unknown-template"]').trigger('click')
  expect(w.emitted('update:templateLayout')).toBeUndefined()
})
