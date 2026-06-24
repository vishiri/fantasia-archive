import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettingsWorldTemplateLayoutTreeNodeLabelArea from '../DialogProjectSettingsWorldTemplateLayoutTreeNodeLabelArea.vue'

const meta = {
  component: DialogProjectSettingsWorldTemplateLayoutTreeNodeLabelArea,
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsWorldTemplateLayoutTreeNodeLabelArea'
} satisfies Meta<typeof DialogProjectSettingsWorldTemplateLayoutTreeNodeLabelArea>

export default meta

export const TemplateNode: StoryObj<typeof meta> = {
  args: {
    displayIconName: 'mdi-account',
    node: {
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
    },
    nodeTestLocator: 'storybook-treeNode-labelArea'
  }
}
