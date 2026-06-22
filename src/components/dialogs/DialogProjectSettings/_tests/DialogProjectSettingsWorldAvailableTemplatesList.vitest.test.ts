/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsWorldAvailableTemplatesList from '../DialogProjectSettingsWorldAvailableTemplatesList.vue'
import { buildDialogProjectSettingsDocumentTemplateDraft } from './dialogProjectSettingsDocumentTemplateDraftFixtures'

const templateFixture = buildDialogProjectSettingsDocumentTemplateDraft({
  icon: 'mdi-account',
  worldAppendixTranslations: { 'en-US': 'sheet' }
})

const listStubs = {
  QIcon: defineComponent({ template: '<span class="q-icon-stub" />' }),
  QItem: defineComponent({
    inheritAttrs: true,
    template: '<div class="q-item-stub" v-bind="$attrs" @click="$emit(\'click\')"><slot /></div>'
  }),
  QItemLabel: defineComponent({ template: '<span><slot /></span>' }),
  QItemSection: defineComponent({ template: '<div><slot /></div>' }),
  QList: defineComponent({ template: '<div class="q-list-stub"><slot /></div>' })
}

/**
 * DialogProjectSettingsWorldAvailableTemplatesList
 * Renders clickable rows with hover-only highlight for each available template.
 */
test('Test that DialogProjectSettingsWorldAvailableTemplatesList renders template rows', async () => {
  const w = mount(DialogProjectSettingsWorldAvailableTemplatesList, {
    props: {
      currentLanguageCode: 'en-US',
      templates: [templateFixture]
    },
    global: {
      stubs: listStubs
    }
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-worldAvailableTemplatesList"]').exists()).toBe(true)
  expect(
    w.find('[data-test-locator="dialogProjectSettings-worldAvailableTemplate-7c9e6679-7425-40de-944b-e07fc1f90ae7"]').exists()
  ).toBe(true)
  expect(w.text()).toContain('Character')
  expect(w.text()).toContain('(sheet)')
})

/**
 * DialogProjectSettingsWorldAvailableTemplatesList
 * Emits addTemplate when a template row is clicked.
 */
test('Test that DialogProjectSettingsWorldAvailableTemplatesList emits addTemplate on row click', async () => {
  const w = mount(DialogProjectSettingsWorldAvailableTemplatesList, {
    props: {
      currentLanguageCode: 'en-US',
      templates: [templateFixture]
    },
    global: {
      stubs: listStubs
    }
  })

  await w
    .find('[data-test-locator="dialogProjectSettings-worldAvailableTemplate-7c9e6679-7425-40de-944b-e07fc1f90ae7"]')
    .trigger('click')
  expect(w.emitted('addTemplate')?.[0]).toEqual(['7c9e6679-7425-40de-944b-e07fc1f90ae7'])
})

/**
 * DialogProjectSettingsWorldAvailableTemplatesList
 * Shows empty-state copy when no templates are available.
 */
test('Test that DialogProjectSettingsWorldAvailableTemplatesList shows empty state', () => {
  const w = mount(DialogProjectSettingsWorldAvailableTemplatesList, {
    props: {
      currentLanguageCode: 'en-US',
      templates: []
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: listStubs
    }
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-worldAvailableTemplatesEmpty"]').exists()).toBe(true)
  expect(w.text()).toContain('dialogs.projectSettings.fields.worldTemplateLayout.emptyAvailableTemplates')
})

test('Test that DialogProjectSettingsWorldAvailableTemplatesList shows filter empty state', () => {
  const w = mount(DialogProjectSettingsWorldAvailableTemplatesList, {
    props: {
      currentLanguageCode: 'en-US',
      showFilterEmpty: true,
      templates: []
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: listStubs
    }
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-worldAvailableTemplatesFilterEmpty"]').exists()).toBe(true)
  expect(w.text()).toContain('dialogs.projectSettings.fields.worldTemplateLayout.emptyFilteredAvailableTemplates')
})
