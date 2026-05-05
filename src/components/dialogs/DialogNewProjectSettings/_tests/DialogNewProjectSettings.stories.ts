import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogNewProjectSettings from '../DialogNewProjectSettings.vue'

const meta = {
  title: 'Components/dialogs/DialogNewProjectSettings',
  component: DialogNewProjectSettings,
  tags: ['autodocs'],
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: '520px'
      },
      description: {
        component:
          'New Fantasia Archive project (.faproject). Storybook opens via directInput; create uses the stub bridge (cancels unless overridden).'
      }
    }
  }
} satisfies Meta<typeof DialogNewProjectSettings>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    directInput: 'NewProjectSettings'
  }
}
