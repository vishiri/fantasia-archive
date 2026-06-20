import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettingsWorldColorPaletteEditor from '../DialogProjectSettingsWorldColorPaletteEditor.vue'

const meta = {
  component: DialogProjectSettingsWorldColorPaletteEditor,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsWorldColorPaletteEditor'
} satisfies Meta<typeof DialogProjectSettingsWorldColorPaletteEditor>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    colorPallete: '#112233;#445566;#AABBCC'
  }
}

export const Empty: StoryObj<typeof meta> = {
  args: {
    colorPallete: ''
  }
}
