import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettingsGeneralPanel from '../DialogProjectSettingsGeneralPanel.vue'

const meta = {
  component: DialogProjectSettingsGeneralPanel,
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsGeneralPanel'
} satisfies Meta<typeof DialogProjectSettingsGeneralPanel>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    projectName: 'Storybook Sample Project'
  }
}
