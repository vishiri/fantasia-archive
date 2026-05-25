import type { Meta, StoryObj } from '@storybook/vue3-vite'

import { applyAppSettingsStorybookDisplayTitlesPatch } from './appSettingsStorybookLocalePatch'
import DialogAppSettingsSettingBlock from '../DialogAppSettingsSettingBlock.vue'

const meta = {
  component: DialogAppSettingsSettingBlock,
  decorators: [
    (story) => {
      applyAppSettingsStorybookDisplayTitlesPatch()
      return story()
    }
  ],
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/dialogs/DialogAppSettingsSettingBlock'
} satisfies Meta<typeof DialogAppSettingsSettingBlock>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    displayMode: 'tab',
    settingKey: 'darkMode',
    setting: {
      description: 'Toggle dark mode for the app shell.',
      tags: '',
      title: 'Dark mode',
      value: false
    }
  }
}
