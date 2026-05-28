import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettingsGeneralPanel from '../DialogProjectSettingsGeneralPanel.vue'

const meta = {
  component: DialogProjectSettingsGeneralPanel,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/dialogs/DialogProjectSettingsGeneralPanel'
} satisfies Meta<typeof DialogProjectSettingsGeneralPanel>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    projectName: 'Storybook Sample Project'
  }
}
