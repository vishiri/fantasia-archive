import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsDocumentTemplatesTabItem from '../DialogProjectSettingsDocumentTemplatesTabItem.vue'

/**
 * DialogProjectSettingsDocumentTemplatesTabItem
 * Renders template tab label and validation error styling hook.
 */
test('Test that DialogProjectSettingsDocumentTemplatesTabItem renders tab label', () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesTabItem, {
    props: {
      isSelected: true,
      tabHasError: false,
      template: {
        displayName: 'Character',
        documentCount: 0,
        icon: '',
        id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        worldAppendix: ''
      }
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
})

/**
 * DialogProjectSettingsDocumentTemplatesTabItem
 * Shows trimmed world appendix under the tab title when present.
 */
test('Test that DialogProjectSettingsDocumentTemplatesTabItem renders world appendix under tab label', () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesTabItem, {
    props: {
      isSelected: false,
      tabHasError: false,
      template: {
        displayName: 'Lalala',
        documentCount: 0,
        icon: '',
        id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        worldAppendix: '  Some world  '
      }
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
