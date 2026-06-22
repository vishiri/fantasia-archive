import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettingsWorldTemplateLayoutTreeNode from '../DialogProjectSettingsWorldTemplateLayoutTreeNode.vue'

const meta = {
  component: DialogProjectSettingsWorldTemplateLayoutTreeNode,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsWorldTemplateLayoutTreeNode'
} satisfies Meta<typeof DialogProjectSettingsWorldTemplateLayoutTreeNode>

export default meta

export const GroupNode: StoryObj<typeof meta> = {
  args: {
    node: {
      children: [],
      documentCountInWorld: 0,
      documentTemplateId: null,
      icon: 'mdi-folder-outline',
      id: 'group-a',
      label: 'Group A',
      nodeKind: 'group',
      worldAppendix: ''
    }
  }
}

export const TemplateNode: StoryObj<typeof meta> = {
  args: {
    node: {
      children: [],
      documentCountInWorld: 2,
      documentTemplateId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      icon: 'mdi-account',
      id: 'placement-a',
      label: 'Character',
      nodeKind: 'template',
      worldAppendix: 'sheet'
    }
  }
}

export const ValidationError: StoryObj<typeof meta> = {
  args: {
    blankGroupIds: new Set(['group-a']),
    node: {
      children: [],
      documentCountInWorld: 0,
      documentTemplateId: null,
      icon: 'mdi-folder-outline',
      id: 'group-a',
      label: '',
      nodeKind: 'group',
      worldAppendix: ''
    }
  }
}
