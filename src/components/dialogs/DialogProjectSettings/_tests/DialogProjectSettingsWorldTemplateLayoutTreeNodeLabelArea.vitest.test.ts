import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { expect, test } from 'vitest'

import DialogProjectSettingsWorldTemplateLayoutTreeNodeLabelArea from '../DialogProjectSettingsWorldTemplateLayoutTreeNodeLabelArea.vue'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

const placementCountI18n = createI18n({
  legacy: false,
  locale: 'en-US',
  messages: {
    'en-US': {
      projectUI: {
        projectHierarchyTree: {
          placementCountTooltip: {
            categoryCount: 'Category count:',
            documentCount: 'Document count:',
            totalCount: 'Document & Category count:'
          }
        }
      }
    }
  }
})

const templateNode: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode = {
  children: [],
  documentCountInWorld: 2,
  categoryCountInWorld: 0,
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

test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNodeLabelArea renders label and docs|cats count', () => {
  const wrapper = mount(DialogProjectSettingsWorldTemplateLayoutTreeNodeLabelArea, {
    global: {
      plugins: [placementCountI18n],
      stubs: {
        QTooltip: true
      }
    },
    props: {
      displayIconName: 'mdi-account',
      node: templateNode,
      nodeTestLocator: 'treeNode-a'
    }
  })

  expect(wrapper.find('[data-test-locator="treeNode-a-labelArea"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="treeNode-a-count"]').text()).toBe('(2 | 0)')
  expect(wrapper.find('[data-test-locator="treeNode-a-count-document"]').text()).toBe('2')
  expect(wrapper.find('[data-test-locator="treeNode-a-count-category"]').text()).toBe('0')
  expect(wrapper.text()).toContain('Character')
})

test('Test that DialogProjectSettingsWorldTemplateLayoutTreeNodeLabelArea shows both segments', () => {
  const wrapper = mount(DialogProjectSettingsWorldTemplateLayoutTreeNodeLabelArea, {
    global: {
      plugins: [placementCountI18n],
      stubs: {
        QTooltip: true
      }
    },
    props: {
      displayIconName: 'mdi-account',
      node: {
        ...templateNode,
        categoryCountInWorld: 5,
        documentCountInWorld: 3
      },
      nodeTestLocator: 'treeNode-b'
    }
  })

  expect(wrapper.find('[data-test-locator="treeNode-b-count"]').text()).toBe('(3 | 5)')
})
