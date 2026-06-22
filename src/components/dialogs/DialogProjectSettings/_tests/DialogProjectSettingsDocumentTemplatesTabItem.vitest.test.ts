import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsDocumentTemplatesTabItem from '../DialogProjectSettingsDocumentTemplatesTabItem.vue'
import { buildDialogProjectSettingsDocumentTemplateDraft } from './dialogProjectSettingsDocumentTemplateDraftFixtures'

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
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
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
 * Shows trimmed world appendix under the tab title when present.
 */
test('Test that DialogProjectSettingsDocumentTemplatesTabItem renders world appendix under tab label', () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesTabItem, {
    props: {
      currentLanguageCode: 'en-US',
      isSelected: false,
      tabHasError: false,
      template: buildDialogProjectSettingsDocumentTemplateDraft({
        titleTranslations: { 'en-US': 'Lalala' },
        worldAppendixTranslations: { 'en-US': 'Some world' }
      })
    },
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
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
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  const tabIcon = w.find('[data-test-locator="dialogProjectSettings-documentTemplates-tabIcon"]')
  expect(tabIcon.exists()).toBe(true)
  expect(tabIcon.attributes('data-test-icon-name')).toBe('mdi-account')
  expect(w.find('.dialogProjectSettingsDocumentTemplatesTabItem__labelRow').exists()).toBe(true)
})

test('Test that DialogProjectSettingsDocumentTemplatesTabItem shows missing translations warning for active locale', () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesTabItem, {
    props: {
      currentLanguageCode: 'de',
      isSelected: false,
      tabHasError: false,
      template: buildDialogProjectSettingsDocumentTemplateDraft({
        titleTranslations: { 'en-US': 'Races' }
      })
    },
    global: {
      mocks: {
        $t: (key: string) => {
          if (key === 'dialogs.projectSettings.panels.documentTemplates.missingTranslationsTabTooltip') {
            return 'Some of the translations for the currently selected language are missing from this document template.'
          }
          return key
        }
      },
      stubs: {
        QTooltip: { template: '<span><slot /></span>' }
      }
    }
  })

  const warningIcon = w.find('[data-test-locator="dialogProjectSettings-documentTemplates-tabMissingTranslationsWarning"]')
  expect(warningIcon.exists()).toBe(true)
  expect(warningIcon.attributes('data-test-tooltip-text')).toBe(
    'Some of the translations for the currently selected language are missing from this document template.'
  )
})

test('Test that DialogProjectSettingsDocumentTemplatesTabItem hides missing translations warning when active locale is present', () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesTabItem, {
    props: {
      currentLanguageCode: 'de',
      isSelected: false,
      tabHasError: false,
      template: buildDialogProjectSettingsDocumentTemplateDraft({
        titleTranslations: {
          de: 'Rassen',
          'en-US': 'Races'
        }
      })
    },
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-documentTemplates-tabMissingTranslationsWarning"]').exists()).toBe(
    false
  )
})
