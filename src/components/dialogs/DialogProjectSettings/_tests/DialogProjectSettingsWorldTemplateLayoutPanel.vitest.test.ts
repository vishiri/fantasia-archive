/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsWorldTemplateLayoutPanel from '../DialogProjectSettingsWorldTemplateLayoutPanel.vue'
import { dialogProjectSettingsWorldDraftFixture } from './dialogProjectSettingsWorldDraftFixtures'

const documentTemplateFixture = {
  displayName: 'Character',
  documentCount: 0,
  icon: 'mdi-account',
  id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  worldAppendix: ''
}

const layoutTreeStub = defineComponent({
  name: 'DialogProjectSettingsWorldTemplateLayoutTree',
  emits: ['update:templateLayout'],
  template: '<div data-test-locator="dialogProjectSettings-worldTemplateLayoutTree-stub" />'
})

const availableListStub = defineComponent({
  name: 'DialogProjectSettingsWorldAvailableTemplatesList',
  emits: ['addTemplate'],
  template: '<div data-test-locator="dialogProjectSettings-worldAvailableTemplatesList-stub" />'
})

/**
 * DialogProjectSettingsWorldTemplateLayoutPanel
 * Renders layout and available-template columns with section titles.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutPanel renders layout panel chrome', () => {
  const w = mount(DialogProjectSettingsWorldTemplateLayoutPanel, {
    props: {
      documentTemplates: [documentTemplateFixture],
      world: dialogProjectSettingsWorldDraftFixture()
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
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
  expect(w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutAddGroup"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectSettings-worldTemplateLayoutTree-stub"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectSettings-worldAvailableTemplatesList-stub"]').exists()).toBe(true)
})

/**
 * DialogProjectSettingsWorldTemplateLayoutPanel
 * Emits update:templateLayout when add-group is clicked.
 */
test('Test that DialogProjectSettingsWorldTemplateLayoutPanel emits update:templateLayout on add group', async () => {
  const w = mount(DialogProjectSettingsWorldTemplateLayoutPanel, {
    props: {
      documentTemplates: [documentTemplateFixture],
      world: dialogProjectSettingsWorldDraftFixture()
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
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
        displayName: 'dialogs.projectSettings.fields.worldTemplateLayout.defaultNewGroupName'
      })
    ])
  })
})
