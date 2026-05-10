import type { Decorator, Meta, StoryObj } from '@storybook/vue3-vite'

import { S_FaAppStyling } from 'app/src/stores/S_FaAppStyling'

import WindowAppStyling from '../WindowAppStyling.vue'

const seedUserCss: Decorator = (story) => {
  const store = S_FaAppStyling()
  store.css = `/* Storybook: sample user CSS */
body {
  color: #000000;
}`
  return {
    components: { story },
    /**
     * Stage sizing only; _FaFloatingWindowBodyTeleport mounts the frame under document.body (same as production).
     */
    template: `
      <div class="fa-storybook-windowAppStyling-stage" style="min-height: 85vh; position: relative;">
        <story />
      </div>
    `
  }
}

const meta = {
  title: 'Components/floatingWindows/WindowAppStyling',
  component: WindowAppStyling,
  tags: ['autodocs'],
  decorators: [seedUserCss],
  argTypes: {
    directInput: {
      control: 'select',
      options: ['', 'WindowAppStyling']
    }
  },
  parameters: {
    docs: {
      story: {
        iframeHeight: '720px',
        inline: false
      },
      description: {
        component:
          'Custom app CSS editor (Monaco) in a movable, resizable floating window. The Storybook decorator seeds sample CSS in S_FaAppStyling; en-US copy comes from the Storybook locale mock. The frame teleports to document.body; set directInput to WindowAppStyling for the window to open.'
      }
    }
  }
} satisfies Meta<typeof WindowAppStyling>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    directInput: 'WindowAppStyling'
  }
}
