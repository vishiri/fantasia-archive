import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettingsWorldColorPaletteSwatch from '../DialogProjectSettingsWorldColorPaletteSwatch.vue'

const meta = {
  component: DialogProjectSettingsWorldColorPaletteSwatch,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsWorldColorPaletteSwatch'
} satisfies Meta<typeof DialogProjectSettingsWorldColorPaletteSwatch>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    duplicateDisabled: false,
    duplicateHexKeys: new Set<string>(),
    entryId: 'entry-a',
    hex: '#112233',
    index: 0,
    isBeingDragged: false,
    isListDragging: false,
    pickerOpen: false,
    worldPickerPalette: ['#112233', '#445566']
  }
}

export const Duplicate: StoryObj<typeof meta> = {
  args: {
    duplicateDisabled: false,
    duplicateHexKeys: new Set(['#112233']),
    entryId: 'entry-a',
    hex: '#112233',
    index: 0,
    isBeingDragged: false,
    isListDragging: false,
    pickerOpen: false,
    worldPickerPalette: []
  }
}

export const PickerOpen: StoryObj<typeof meta> = {
  args: {
    duplicateDisabled: false,
    duplicateHexKeys: new Set<string>(),
    entryId: 'entry-a',
    hex: '#112233',
    index: 0,
    isBeingDragged: false,
    isListDragging: false,
    pickerOpen: true,
    worldPickerPalette: ['#112233']
  }
}
