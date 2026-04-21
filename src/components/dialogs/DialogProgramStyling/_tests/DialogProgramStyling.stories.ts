import type { Decorator, Meta, StoryObj } from '@storybook/vue3-vite'

import { S_FaProgramStyling } from 'app/src/stores/S_FaProgramStyling'

import DialogProgramStyling from '../DialogProgramStyling.vue'

const seedUserCss: Decorator = (story) => {
  const store = S_FaProgramStyling()
  store.css = `/* Storybook: sample user CSS */
body {
  color: #000000;
}`
  return {
    components: { story },
    template: '<div class="fa-storybook-dialogProgramStyling-stage"><story /></div>'
  }
}

const meta = {
  title: 'Components/dialogs/DialogProgramStyling',
  component: DialogProgramStyling,
  tags: ['autodocs'],
  decorators: [seedUserCss],
  parameters: {
    docs: {
      story: {
        iframeHeight: '720px',
        inline: false
      },
      description: {
        component:
          'Custom program CSS editor (Monaco). The Storybook decorator seeds sample CSS in S_FaProgramStyling; en-US copy comes from the Storybook locale mock.'
      }
    }
  }
} satisfies Meta<typeof DialogProgramStyling>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    directInput: 'ProgramStyling'
  }
}
