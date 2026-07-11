import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsDocumentTemplatesTabItem from '../DialogProjectSettingsDocumentTemplatesTabItem.vue'
import {
  buildDialogProjectSettingsSingularPluralMissingTooltip,
  mergeDialogProjectSettingsVitestGlobal
} from 'app/helpers/dialogProjectSettingsVitestI18n'
import { buildDialogProjectSettingsDocumentTemplateDraft } from './dialogProjectSettingsDocumentTemplateDraftFixtures'

const tabItemMountGlobal = mergeDialogProjectSettingsVitestGlobal({
  stubs: {
    QTooltip: { template: '<span><slot /></span>' }
  }
})

/**
 * DialogProjectSettingsDocumentTemplatesTabItem
 * Renders template tab label and validation error styling hook.
 */
test('Test that DialogProjectSettingsDocumentTemplatesTabItem renders tab label', () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesTabItem, {
    props: {
      currentLanguageCode: 'en-US',
      isSelected: true,
      tabHasError: false,
      template: buildDialogProjectSettingsDocumentTemplateDraft()
    },
    global: tabItemMountGlobal
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-documentTemplates-tab"]').exists()).toBe(true)
  expect(w.text()).toContain('Character')
  expect(w.find('[data-test-locator="dialogProjectSettings-documentTemplates-tabWorldAppendix"]').exists()).toBe(false)
  expect(w.find('[data-test-locator="dialogProjectSettings-documentTemplates-tabIcon"]').exists()).toBe(true)
  expect(
    w.find('[data-test-locator="dialogProjectSettings-documentTemplates-tabIcon"]').attributes('data-test-icon-name')
  ).toBe('mdi-file-outline')
})

/**
 * DialogProjectSettingsDocumentTemplatesTabItem
 * Falls back to the default new-template label when resolved title is empty.
 */
test('Test that DialogProjectSettingsDocumentTemplatesTabItem shows default label when title is empty', () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesTabItem, {
    props: {
      currentLanguageCode: 'de',
      isSelected: false,
      tabHasError: true,
      template: buildDialogProjectSettingsDocumentTemplateDraft({
        titlePluralTranslations: {},
        titleSingularTranslations: {}
      })
    },
    global: tabItemMountGlobal
  })

  expect(w.text()).toContain('dialogs.projectSettings.panels.documentTemplates.defaultNewTemplateName')
})

/**
 * DialogProjectSettingsDocumentTemplatesTabItem
 * Ignores keyboard events other than Enter and Space.
 */
test('Test that DialogProjectSettingsDocumentTemplatesTabItem ignores unrelated keydown events', async () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesTabItem, {
    props: {
      currentLanguageCode: 'en-US',
      isSelected: false,
      tabHasError: false,
      template: buildDialogProjectSettingsDocumentTemplateDraft()
    },
    global: tabItemMountGlobal
  })

  await w.find('[data-test-locator="dialogProjectSettings-documentTemplates-tab"]').trigger('keydown', { key: 'a' })
  expect(w.emitted('select')).toBeUndefined()
})

/**
 * DialogProjectSettingsDocumentTemplatesTabItem
 * Shows trimmed world appendix under the tab title when present.
 */
test('Test that DialogProjectSettingsDocumentTemplatesTabItem renders world appendix under tab label', () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesTabItem, {
    props: {
      currentLanguageCode: 'en-US',
      isSelected: false,
      tabHasError: false,
      template: buildDialogProjectSettingsDocumentTemplateDraft({
        titlePluralTranslations: { 'en-US': 'Lalala' },
        titleSingularTranslations: {},
        worldAppendixTranslations: { 'en-US': 'Some world' }
      })
    },
    global: tabItemMountGlobal
  })

  const appendix = w.find('[data-test-locator="dialogProjectSettings-documentTemplates-tabWorldAppendix"]')
  expect(appendix.exists()).toBe(true)
  expect(appendix.text()).toBe('(Some world)')
  expect(appendix.classes()).toContain('dialogProjectSettingsDocumentTemplatesTabItem__worldAppendix')
})

/**
 * DialogProjectSettingsDocumentTemplatesTabItem
 * Renders the template icon left of the label row when icon is set.
 */
test('Test that DialogProjectSettingsDocumentTemplatesTabItem renders tab icon beside label block', () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesTabItem, {
    props: {
      currentLanguageCode: 'en-US',
      isSelected: false,
      tabHasError: false,
      template: buildDialogProjectSettingsDocumentTemplateDraft({
        icon: 'mdi-account',
        worldAppendixTranslations: { 'en-US': 'Notes' }
      })
    },
    global: tabItemMountGlobal
  })

  const tabIcon = w.find('[data-test-locator="dialogProjectSettings-documentTemplates-tabIcon"]')
  expect(tabIcon.exists()).toBe(true)
  expect(tabIcon.attributes('data-test-icon-name')).toBe('mdi-account')
  expect(w.find('.dialogProjectSettingsDocumentTemplatesTabItem__labelRow').exists()).toBe(true)
})

test('Test that DialogProjectSettingsDocumentTemplatesTabItem shows missing translations warning for active locale', async () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesTabItem, {
    props: {
      currentLanguageCode: 'de',
      isSelected: false,
      tabHasError: false,
      template: buildDialogProjectSettingsDocumentTemplateDraft({
        titlePluralTranslations: { 'en-US': 'Races' },
        titleSingularTranslations: {}
      })
    },
    global: tabItemMountGlobal
  })

  const warningIcon = w.find('[data-test-locator="dialogProjectSettings-documentTemplates-tabMissingTranslationsWarning"]')
  expect(warningIcon.exists()).toBe(true)
  expect(warningIcon.attributes('data-test-tooltip-text')).toBe(
    buildDialogProjectSettingsSingularPluralMissingTooltip({
      fallbackLanguageCode: 'en-US',
      missingForm: 'both'
    })
  )
  await warningIcon.trigger('click')
})

test('Test that DialogProjectSettingsDocumentTemplatesTabItem hides missing translations warning when active locale is present', () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesTabItem, {
    props: {
      currentLanguageCode: 'de',
      isSelected: false,
      tabHasError: false,
      template: buildDialogProjectSettingsDocumentTemplateDraft({
        titlePluralTranslations: {
          de: 'Rassen',
          'en-US': 'Races'
        },
        titleSingularTranslations: {
          de: 'Rasse'
        }
      })
    },
    global: tabItemMountGlobal
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-documentTemplates-tabMissingTranslationsWarning"]').exists()).toBe(
    false
  )
})

/**
 * DialogProjectSettingsDocumentTemplatesTabItem
 * Emits select on click and keyboard activation while list is not dragging.
 */
test('Test that DialogProjectSettingsDocumentTemplatesTabItem emits select on click and keyboard', async () => {
  const template = buildDialogProjectSettingsDocumentTemplateDraft()
  const w = mount(DialogProjectSettingsDocumentTemplatesTabItem, {
    props: {
      currentLanguageCode: 'en-US',
      isListDragging: false,
      isSelected: false,
      tabHasError: false,
      template
    },
    global: tabItemMountGlobal
  })

  await w.find('[data-test-locator="dialogProjectSettings-documentTemplates-tab"]').trigger('click')
  expect(w.emitted('select')?.[0]!).toEqual([template.id])

  await w.find('[data-test-locator="dialogProjectSettings-documentTemplates-tab"]').trigger('keydown', { key: 'Enter' })
  expect(w.emitted('select')?.[1]!).toEqual([template.id])

  await w.find('[data-test-locator="dialogProjectSettings-documentTemplates-tab"]').trigger('keydown', { key: ' ' })
  expect(w.emitted('select')?.[2]!).toEqual([template.id])
})

/**
 * DialogProjectSettingsDocumentTemplatesTabItem
 * Disables ripple binding while the parent list is dragging.
 */
test('Test that DialogProjectSettingsDocumentTemplatesTabItem disables ripple while list dragging', () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesTabItem, {
    props: {
      currentLanguageCode: 'en-US',
      isListDragging: true,
      isSelected: false,
      tabHasError: false,
      template: buildDialogProjectSettingsDocumentTemplateDraft()
    },
    global: tabItemMountGlobal
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-documentTemplates-tab"]').exists()).toBe(true)
})
