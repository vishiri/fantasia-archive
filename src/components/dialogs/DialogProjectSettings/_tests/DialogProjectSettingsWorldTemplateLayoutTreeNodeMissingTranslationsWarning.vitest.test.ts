import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsWorldTemplateLayoutTreeNodeMissingTranslationsWarning from '../DialogProjectSettingsWorldTemplateLayoutTreeNodeMissingTranslationsWarning.vue'

test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNodeMissingTranslationsWarning renders warning icon', async () => {
  const wrapper = mount(DialogProjectSettingsWorldTemplateLayoutTreeNodeMissingTranslationsWarning, {
    props: {
      testLocator: 'treeNode-missingTranslations',
      tooltipText: 'Missing translations for current language:\n- Singular form missing'
    },
    global: {
      stubs: {
        FaMultilineTooltipBody: { template: '<span><slot /></span>' },
        QTooltip: { template: '<span><slot /></span>' }
      }
    }
  })

  const warningIcon = wrapper.find('[data-test-locator="treeNode-missingTranslations"]')
  expect(warningIcon.exists()).toBe(true)
  expect(warningIcon.attributes('data-test-tooltip-text')).toContain('Missing translations')
  await warningIcon.trigger('click')
})
