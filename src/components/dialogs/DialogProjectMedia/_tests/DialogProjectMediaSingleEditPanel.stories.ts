import type { Meta, StoryObj } from '@storybook/vue3-vite'

import type { I_faProjectMediaMassEditRow } from 'app/types/I_faProjectMediaDomain'

import DialogProjectMediaSingleEditPanel from '../DialogProjectMediaSingleEditPanel.vue'

const sampleRow: I_faProjectMediaMassEditRow = {
  createdAtMs: 0,
  displayName: 'bar',
  externalEmbed: '',
  externalLink: 'https://cdn.example.com/foo/bar.png',
  externalType: 'linked',
  id: '550e8400-e29b-41d4-a716-446655440001',
  internalEmbed: null,
  internalLink: '',
  internalType: 'linked_outside',
  isNew: false,
  type: 'external',
  updatedAtMs: 0
}

const meta = {
  component: DialogProjectMediaSingleEditPanel,
  parameters: {
    docs: {
      description: {
        component:
          'Project Media single-edit tab: heading Project Media - Single Medium Edit, stacked form when a row is loaded, Close and Save and Close. Save and Close stays disabled while no medium is loaded.'
      },
      story: {
        iframeHeight: '420px'
      }
    },
    layout: 'padded'
  },
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/dialogs/DialogProjectMediaSingleEditPanel'
} satisfies Meta<typeof DialogProjectMediaSingleEditPanel>

export default meta

export const Empty: StoryObj<typeof meta> = {
  args: {
    isSaveDisabled: true,
    row: null
  }
}

export const Loaded: StoryObj<typeof meta> = {
  args: {
    isSaveDisabled: false,
    row: sampleRow
  }
}
