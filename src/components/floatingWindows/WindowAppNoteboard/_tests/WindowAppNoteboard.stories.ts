import type { Decorator, Meta, StoryObj } from '@storybook/vue3-vite'

import { S_FaAppNoteboard } from 'app/src/stores/S_FaAppNoteboard'

import WindowAppNoteboard from '../WindowAppNoteboard.vue'

const seedNoteboardText: Decorator = (story) => {
  const store = S_FaAppNoteboard()
  store.text = 'Storybook: sample note board text.\nSecond line.'
  return {
    components: { story },
    template: `
      <div class="fa-storybook-windowAppNoteboard-stage" style="min-height: 85vh; position: relative;">
        <story />
      </div>
    `
  }
}

const meta = {
  title: 'Components/floatingWindows/WindowAppNoteboard',
  component: WindowAppNoteboard,
  tags: ['autodocs'],
  decorators: [seedNoteboardText],
  argTypes: {
    directInput: {
      control: 'select',
      options: ['', 'WindowAppNoteboard']
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
          'App note board in a movable, resizable floating window. The Storybook decorator seeds sample text; en-US copy comes from the Storybook locale mock. The frame teleports to document.body; set directInput to WindowAppNoteboard for the window to open.'
      }
    }
  }
} satisfies Meta<typeof WindowAppNoteboard>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    directInput: 'WindowAppNoteboard'
  }
}
