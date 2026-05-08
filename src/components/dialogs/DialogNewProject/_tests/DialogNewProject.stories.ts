import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogNewProject from '../DialogNewProject.vue'

const meta = {
  title: 'Components/dialogs/DialogNewProject',
  component: DialogNewProject,
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
} satisfies Meta<typeof DialogNewProject>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    directInput: 'NewProject'
  }
}
