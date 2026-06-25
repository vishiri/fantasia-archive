/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsWorldAvailableTemplatesList from '../DialogProjectSettingsWorldAvailableTemplatesList.vue'
import {
  buildDialogProjectSettingsSingularPluralMissingTooltip,
  mergeDialogProjectSettingsVitestGlobal
} from 'app/helpers/dialogProjectSettingsVitestI18n'
import { buildDialogProjectSettingsDocumentTemplateDraft } from './dialogProjectSettingsDocumentTemplateDraftFixtures'

const templateFixture = buildDialogProjectSettingsDocumentTemplateDraft({
  icon: 'mdi-account',
  worldAppendixTranslations: { 'en-US': 'sheet' }
})

const listStubs = {
  QIcon: defineComponent({ template: '<span class="q-icon-stub" />' }),
  QItem: defineComponent({
    inheritAttrs: true,
    template: '<div class="q-item-stub" v-bind="$attrs" @click="$emit(\'click\')" @contextmenu="$emit(\'contextmenu\', $event)"><slot /></div>'
  }),
  QItemLabel: defineComponent({ template: '<span><slot /></span>' }),
  QItemSection: defineComponent({ template: '<div><slot /></div>' }),
  QList: defineComponent({ template: '<div class="q-list-stub"><slot /></div>' })
}

const listMountGlobal = mergeDialogProjectSettingsVitestGlobal({
  stubs: listStubs
})

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
    global: listMountGlobal
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
    global: listMountGlobal
  })

  await w
    .find('[data-test-locator="dialogProjectSettings-worldAvailableTemplate-7c9e6679-7425-40de-944b-e07fc1f90ae7"]')
    .trigger('click')
  expect(w.emitted('addTemplate')?.[0]!).toEqual(['7c9e6679-7425-40de-944b-e07fc1f90ae7'])
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
    global: listMountGlobal
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
    global: listMountGlobal
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-worldAvailableTemplatesFilterEmpty"]').exists()).toBe(true)
  expect(w.text()).toContain('dialogs.projectSettings.fields.worldTemplateLayout.emptyFilteredAvailableTemplates')
})

test('Test that DialogProjectSettingsWorldAvailableTemplatesList shows missing translations warning for active locale', () => {
  const w = mount(DialogProjectSettingsWorldAvailableTemplatesList, {
    props: {
      currentLanguageCode: 'de',
      templates: [
        buildDialogProjectSettingsDocumentTemplateDraft({
          titlePluralTranslations: { 'en-US': 'Character' },
          titleSingularTranslations: {}
        })
      ]
    },
    global: mergeDialogProjectSettingsVitestGlobal({
      stubs: {
        ...listStubs,
        QTooltip: { template: '<span><slot /></span>' }
      }
    })
  })

  const warningIcon = w.find('[data-test-locator="dialogProjectSettings-worldAvailableTemplates-missingTranslationsWarning"]')
  expect(warningIcon.exists()).toBe(true)
  expect(warningIcon.attributes('data-test-tooltip-text')).toBe(
    buildDialogProjectSettingsSingularPluralMissingTooltip({
      fallbackLanguageCode: 'en-US',
      missingForm: 'both'
    })
  )
})

test('Test that DialogProjectSettingsWorldAvailableTemplatesList hides missing translations warning when active locale is present', () => {
  const w = mount(DialogProjectSettingsWorldAvailableTemplatesList, {
    props: {
      currentLanguageCode: 'de',
      templates: [
        buildDialogProjectSettingsDocumentTemplateDraft({
          titlePluralTranslations: {
            de: 'Charakter',
            'en-US': 'Character'
          },
          titleSingularTranslations: {
            de: 'Charakter'
          }
        })
      ]
    },
    global: listMountGlobal
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-worldAvailableTemplates-missingTranslationsWarning"]').exists()).toBe(
    false
  )
})

/**
 * DialogProjectSettingsWorldAvailableTemplatesList
 * Renders multiline tooltip body for missing translation warnings.
 */
test('Test that DialogProjectSettingsWorldAvailableTemplatesList renders multiline missing translation tooltip', () => {
  const w = mount(DialogProjectSettingsWorldAvailableTemplatesList, {
    props: {
      currentLanguageCode: 'de',
      templates: [
        buildDialogProjectSettingsDocumentTemplateDraft({
          titlePluralTranslations: { 'en-US': 'Character' },
          titleSingularTranslations: {}
        })
      ]
    },
    global: mergeDialogProjectSettingsVitestGlobal({
      stubs: {
        ...listStubs,
        QIcon: defineComponent({ template: '<span class="q-icon-stub"><slot /></span>' }),
        FaMultilineTooltipBody: defineComponent({
          props: {
            text: {
              type: String,
              required: true
            }
          },
          template: '<span class="multiline-tooltip-stub">{{ text }}</span>'
        }),
        QTooltip: { template: '<span><slot /></span>' }
      }
    })
  })

  expect(w.find('.multiline-tooltip-stub').exists()).toBe(true)
})

/**
 * DialogProjectSettingsWorldAvailableTemplatesList
 * Clears hover focus state when a row receives context menu.
 */
test('Test that DialogProjectSettingsWorldAvailableTemplatesList clears hover focus on context menu', async () => {
  const w = mount(DialogProjectSettingsWorldAvailableTemplatesList, {
    props: {
      currentLanguageCode: 'en-US',
      templates: [templateFixture]
    },
    global: listMountGlobal
  })

  const row = w.find(
    '[data-test-locator="dialogProjectSettings-worldAvailableTemplate-7c9e6679-7425-40de-944b-e07fc1f90ae7"]'
  )
  row.element.classList.add('q-hoverable', 'q-manual-focusable--focused')
  await row.trigger('contextmenu')
  expect(row.element.classList.contains('q-manual-focusable--focused')).toBe(false)
})
