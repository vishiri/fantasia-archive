import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettingsWorldTemplateLayoutTree from '../DialogProjectSettingsWorldTemplateLayoutTree.vue'
import {
  appendDialogProjectSettingsWorldTemplateGroupDraft,
  appendDialogProjectSettingsWorldTemplatePlacementDraft,
  createEmptyDialogProjectSettingsWorldTemplateLayoutDraft
} from '../scripts/dialogProjectSettingsWorldTemplateLayoutDraft'

const meta = {
  component: DialogProjectSettingsWorldTemplateLayoutTree,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsWorldTemplateLayoutTree'
} satisfies Meta<typeof DialogProjectSettingsWorldTemplateLayoutTree>

export default meta

const layoutWithGroupAndTemplate = appendDialogProjectSettingsWorldTemplatePlacementDraft(
  appendDialogProjectSettingsWorldTemplateGroupDraft(
    createEmptyDialogProjectSettingsWorldTemplateLayoutDraft(),
    'Group A'
  ),
  {
    displayName: 'Character',
    documentTemplateId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    icon: 'mdi-account',
    worldAppendix: ' sheet'
  }
)

export const Default: StoryObj<typeof meta> = {
  args: {
    templateLayout: layoutWithGroupAndTemplate
  }
}

export const Empty: StoryObj<typeof meta> = {
  args: {
    templateLayout: createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  }
}
