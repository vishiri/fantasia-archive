import type { Meta, StoryObj } from '@storybook/vue3-vite'

import type { I_faProjectMediaMassEditRow } from 'app/types/I_faProjectMediaDomain'

import DialogProjectMediaSingleEditSlide from '../DialogProjectMediaSingleEditSlide.vue'

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
  component: DialogProjectMediaSingleEditSlide,
  parameters: {
    docs: {
      description: {
        component:
          'Project Media list single-edit slide-out: 700px right panel (max-width 100%) over a blocking dim backdrop, Previous/Next (body duplicates; Previous incoming from the left, Next from the right; footer stays; ArrowLeft/Right match those buttons unless an edit field is focused; same dirty/animating/end locks as clicks), Close, Save Without Close, and Save and Close, no heading. Escape blurs a focused field first, then closes the slide when clean, and does not bounce the sticky dialog. Preview is full-width 300px (contain image, playable video/audio, raw embed HTML).'
      }
    },
    layout: 'padded'
  },
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/dialogs/DialogProjectMediaSingleEditSlide'
} satisfies Meta<typeof DialogProjectMediaSingleEditSlide>

export default meta

export const OpenWithRow: StoryObj<typeof meta> = {
  args: {
    nextDisabled: false,
    previousDisabled: true,
    row: sampleRow
  }
}
