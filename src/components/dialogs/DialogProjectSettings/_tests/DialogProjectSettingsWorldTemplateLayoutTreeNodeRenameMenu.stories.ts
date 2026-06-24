import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenu from '../DialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenu.vue'

const meta = {
  component: DialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenu,
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenu'
} satisfies Meta<typeof DialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenu>

export default meta

export const Open: StoryObj<typeof meta> = {
  args: {
    contextMenuTestLocator: 'storybook-treeNode-renameMenu',
    currentLanguageCode: 'en-US',
    errorMessage: undefined,
    hasError: false,
    inputTestLocator: 'storybook-treeNode-renameInput',
    maxLength: 120,
    menuOffset: [0, 4],
    menuPinnedAsideLabel: 'Template title',
    menuPinnedAsideTestLocator: 'storybook-treeNode-pinnedAside',
    menuPinnedAsideTooltip: 'Canonical template title',
    menuPinnedAsideValue: 'Character',
    menuTarget: null,
    renameMenuOpen: true,
    translationForms: 'single',
    translationsDraft: {
      'en-US': 'Character'
    }
  }
}
