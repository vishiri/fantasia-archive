import type { Meta, StoryObj } from '@storybook/vue3-vite'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'

import DialogAppSettings from '../DialogAppSettings.vue'
import { applyAppSettingsStorybookDisplayTitlesPatch } from './appSettingsStorybookLocalePatch'

const meta = {
  title: 'Components/dialogs/DialogAppSettings',
  component: DialogAppSettings,
  tags: ['autodocs'],
  decorators: [
    (story) => {
      applyAppSettingsStorybookDisplayTitlesPatch()

      return {
        components: {
          story
        },
        template: '<story />'
      }
    }
  ],
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: '760px'
      },
      description: {
        component:
          'App settings with the full production toggle layout. Args pass the same default booleans as the Electron persisted file through directSettingsSnapshot, and a Storybook decorator strips staging TODO prefixes from en-US setting titles via mergeLocaleMessage on the shared externalFileLoader instance.'
      }
    }
  }
} satisfies Meta<typeof DialogAppSettings>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    directInput: 'AppSettings',
    directSettingsSnapshot: {
      ...FA_USER_SETTINGS_DEFAULTS
    }
  }
}
