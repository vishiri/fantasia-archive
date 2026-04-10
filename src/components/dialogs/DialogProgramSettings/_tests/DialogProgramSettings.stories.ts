import type { Meta, StoryObj } from '@storybook/vue3-vite'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'

import DialogProgramSettings from '../DialogProgramSettings.vue'
import { applyProgramSettingsStorybookDisplayTitlesPatch } from './programSettingsStorybookLocalePatch'

const meta = {
  title: 'Components/dialogs/DialogProgramSettings',
  component: DialogProgramSettings,
  tags: ['autodocs'],
  decorators: [
    (story) => {
      applyProgramSettingsStorybookDisplayTitlesPatch()

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
          'Program settings with the full production toggle layout. Args pass the same default booleans as the Electron persisted file through directSettingsSnapshot, and a Storybook decorator strips staging TODO prefixes from en-US setting titles via mergeLocaleMessage on the shared externalFileLoader instance.'
      }
    }
  }
} satisfies Meta<typeof DialogProgramSettings>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    directInput: 'ProgramSettings',
    directSettingsSnapshot: {
      ...FA_USER_SETTINGS_DEFAULTS
    }
  }
}
