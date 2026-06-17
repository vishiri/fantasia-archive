import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettingsWorldsDetailPanel from '../DialogProjectSettingsWorldsDetailPanel.vue'

const meta = {
  component: DialogProjectSettingsWorldsDetailPanel,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsWorldsDetailPanel'
} satisfies Meta<typeof DialogProjectSettingsWorldsDetailPanel>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    documentTemplates: [
      {
        displayName: 'Character',
        documentCount: 0,
        icon: 'person',
        id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        worldAppendix: ' sheet'
      }
    ],
    nameHasError: false,
    removeDisabled: false,
    removeDisabledReason: null,
    world: {
      color: '#112233',
      colorPallete: '#112233;#445566;#AABBCC',
      displayName: 'Falala',
      documentCount: 0,
      id: '550e8400-e29b-41d4-a716-446655440000',
      templateLayout: {
        groups: [],
        placements: []
      }
    }
  }
}

export const DuplicatePalette: StoryObj<typeof meta> = {
  args: {
    ...Default.args,
    world: {
      color: '#112233',
      colorPallete: '#112233;#AABBCC;#aabbcc',
      displayName: 'Falala',
      documentCount: 0,
      id: '550e8400-e29b-41d4-a716-446655440000',
      templateLayout: {
        groups: [],
        placements: []
      }
    }
  }
}
