import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettingsWorldTemplateLayoutPanel from '../DialogProjectSettingsWorldTemplateLayoutPanel.vue'
import { appendDialogProjectSettingsWorldTemplatePlacementDraft } from '../scripts/dialogProjectSettingsWorldTemplateLayoutDraft'
import { createEmptyDialogProjectSettingsWorldTemplateLayoutDraft } from '../scripts/dialogProjectSettingsWorldTemplateLayoutDraft'
import { dialogProjectSettingsWorldDraftFixture } from './dialogProjectSettingsWorldDraftFixtures'

const meta = {
  component: DialogProjectSettingsWorldTemplateLayoutPanel,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsWorldTemplateLayoutPanel'
} satisfies Meta<typeof DialogProjectSettingsWorldTemplateLayoutPanel>

export default meta

const documentTemplates = [{
  displayName: 'Character',
  documentCount: 0,
  icon: 'mdi-account',
  id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  worldAppendix: ' sheet'
}, {
  displayName: 'Location',
  documentCount: 0,
  icon: 'mdi-map-marker',
  id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  worldAppendix: ''
}]

const layoutWithPlacement = appendDialogProjectSettingsWorldTemplatePlacementDraft(
  createEmptyDialogProjectSettingsWorldTemplateLayoutDraft(),
  {
    displayName: 'Character',
    documentTemplateId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    icon: 'mdi-account',
    worldAppendix: ' sheet'
  }
)

export const Default: StoryObj<typeof meta> = {
  args: {
    documentTemplates,
    world: dialogProjectSettingsWorldDraftFixture({
      templateLayout: layoutWithPlacement
    })
  }
}

export const EmptyLayout: StoryObj<typeof meta> = {
  args: {
    documentTemplates,
    world: dialogProjectSettingsWorldDraftFixture()
  }
}
