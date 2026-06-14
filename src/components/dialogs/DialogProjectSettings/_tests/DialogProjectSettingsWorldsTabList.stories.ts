import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettingsWorldsTabList from '../DialogProjectSettingsWorldsTabList.vue'

const meta = {
  component: DialogProjectSettingsWorldsTabList,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsWorldsTabList'
} satisfies Meta<typeof DialogProjectSettingsWorldsTabList>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    selectedWorldId: '550e8400-e29b-41d4-a716-446655440000',
    worlds: [
      {
        color: '#ff0000',
        colorPallete: '',
        displayName: 'Falala',
        documentCount: 0,
        id: '550e8400-e29b-41d4-a716-446655440000'
      },
      {
        color: '',
        colorPallete: '',
        displayName: 'Gungala',
        documentCount: 0,
        id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
      }
    ]
  }
}
