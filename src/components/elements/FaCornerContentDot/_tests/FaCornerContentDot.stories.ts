import type { Meta, StoryObj } from '@storybook/vue3-vite'

import FaCornerContentDot from '../FaCornerContentDot.vue'

const meta = {
  title: 'Components/elements/FaCornerContentDot',
  component: FaCornerContentDot,
  decorators: [
    (story) => ({
      components: {
        story
      },
      template: `
        <div
          class="bg-dark q-pa-xl"
          style="min-height: 120px; position: relative; width: 48px; height: 48px; border: 1px solid #ffd673;"
        >
          <story />
        </div>
      `
    })
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Small primary-colored corner presence dot for control-bar buttons and menu rows when a noteboard has content.'
      }
    }
  },
  tags: ['autodocs']
} satisfies Meta<typeof FaCornerContentDot>

export default meta

export const Visible: StoryObj<typeof meta> = {
  args: {
    locator: 'faCornerContentDot-story-visible',
    visible: true
  }
}

export const Hidden: StoryObj<typeof meta> = {
  args: {
    locator: 'faCornerContentDot-story-hidden',
    visible: false
  }
}
