import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsWorldTemplateLayoutTreeNodeMissingTranslationsWarning from '../DialogProjectSettingsWorldTemplateLayoutTreeNodeMissingTranslationsWarning.vue'

test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNodeMissingTranslationsWarning renders warning icon', () => {
  const wrapper = mount(DialogProjectSettingsWorldTemplateLayoutTreeNodeMissingTranslationsWarning, {
    props: {
      testLocator: 'treeNode-missingTranslations',
      tooltipText: 'Missing translations for current language:\n- Singular form missing'
    }
  })

  expect(wrapper.find('[data-test-locator="treeNode-missingTranslations"]').exists()).toBe(true)
  expect(wrapper.attributes('data-test-tooltip-text')).toContain('Missing translations')
})
