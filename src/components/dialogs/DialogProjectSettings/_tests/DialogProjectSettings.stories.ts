import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettings from '../DialogProjectSettings.vue'

const meta = {
  title: 'Components/dialogs/DialogProjectSettings',
  component: DialogProjectSettings,
  tags: ['autodocs', 'skip-visual'],
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: '760px'
      }
    }
  }
} satisfies Meta<typeof DialogProjectSettings>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    directInput: 'ProjectSettings',
    directSettingsSnapshot: {
      projectName: 'Storybook Sample Project',
      schemaVersion: 1
    }
  }
}
