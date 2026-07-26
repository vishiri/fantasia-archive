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
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/dialogs/DialogAppSettingsSettingBlock'
} satisfies Meta<typeof DialogAppSettingsSettingBlock>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    displayMode: 'tab',
    settingKey: 'showDocumentID',
    setting: {
      description: 'Show the document ID in the document body.',
      tags: '',
      title: 'Show document ID',
      control: 'toggle',
      value: false
    }
  }
}

export const AppThemeSelect: StoryObj<typeof meta> = {
  args: {
    displayMode: 'tab',
    settingKey: 'appTheme',
    setting: {
      description: 'Choose a visual theme for the app to use.',
      tags: 'theme',
      title: 'App theme',
      control: 'select',
      value: 'darkThemeFantasy',
      options: [
        {
          label: 'Flat theme, Light',
          value: 'lightThemeFlat'
        },
        {
          label: 'Dark, flat theme',
          value: 'darkThemeFlat'
        },
        {
          label: 'Light, fantasy theme',
          value: 'lightThemeFantasy'
        },
        {
          label: 'Fantasy theme, Dark',
          value: 'darkThemeFantasy'
        }
      ]
    }
  }
}
