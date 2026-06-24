import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsWorldTemplateLayoutTreeNodeLabelArea from '../DialogProjectSettingsWorldTemplateLayoutTreeNodeLabelArea.vue'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

const templateNode: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode = {
  children: [],
  documentCountInWorld: 2,
  documentTemplateId: 'template-a',
  displayNameTranslations: {},
  icon: 'mdi-account',
  id: 'placement-a',
  label: 'Character',
  nicknamePluralTranslations: {},
  nicknameSingularTranslations: {},
  nodeKind: 'template',
  templateDisplayName: 'Character',
  usesNickname: false,
  worldAppendix: ''
}

test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNodeLabelArea renders label and count', () => {
  const wrapper = mount(DialogProjectSettingsWorldTemplateLayoutTreeNodeLabelArea, {
    props: {
      displayIconName: 'mdi-account',
      node: templateNode,
      nodeTestLocator: 'treeNode-a'
    }
  })

  expect(wrapper.find('[data-test-locator="treeNode-a-labelArea"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="treeNode-a-count"]').text()).toBe('(2)')
  expect(wrapper.text()).toContain('Character')
})
