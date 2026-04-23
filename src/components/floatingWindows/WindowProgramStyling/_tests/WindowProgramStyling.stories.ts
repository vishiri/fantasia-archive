import type { Decorator, Meta, StoryObj } from '@storybook/vue3-vite'

import { S_FaProgramStyling } from 'app/src/stores/S_FaProgramStyling'

import WindowProgramStyling from '../WindowProgramStyling.vue'

const seedUserCss: Decorator = (story) => {
  const store = S_FaProgramStyling()
  store.css = `/* Storybook: sample user CSS */
body {
  color: #000000;
}`
  return {
    components: { story },
    template: '<div class="fa-storybook-windowProgramStyling-stage"><story /></div>'
  }
}

const meta = {
  title: 'Components/floatingWindows/WindowProgramStyling',
  component: WindowProgramStyling,
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
          'Custom program CSS editor (Monaco) in a movable, resizable floating window. The Storybook decorator seeds sample CSS in S_FaProgramStyling; en-US copy comes from the Storybook locale mock.'
      }
    }
  }
} satisfies Meta<typeof WindowProgramStyling>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    directInput: 'WindowProgramStyling'
  }
}
