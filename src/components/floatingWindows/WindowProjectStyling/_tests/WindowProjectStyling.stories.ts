import type { Decorator, Meta, StoryObj } from '@storybook/vue3-vite'

import { S_FaProjectStyling } from 'app/src/stores/S_FaProjectStyling'

import WindowProjectStyling from '../WindowProjectStyling.vue'

const seedProjectCss: Decorator = (story) => {
  const store = S_FaProjectStyling()
  store.applyRoot({
    css: `/* Storybook: sample project CSS */
body {
  color: #000000;
}`,
    frame: null,
    schemaVersion: 1
  })
  return {
    components: { story },
    template: `
      <div class="fa-storybook-windowProjectStyling-stage" style="min-height: 85vh; position: relative;">
        <story />
      </div>
    `
  }
}

const meta = {
  title: 'Components/floatingWindows/WindowProjectStyling',
  component: WindowProjectStyling,
  tags: ['autodocs'],
  decorators: [seedProjectCss],
  argTypes: {
    directInput: {
      control: 'select',
      options: ['', 'WindowProjectStyling']
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
          'Custom project CSS editor (Monaco) in a movable, resizable floating window. The decorator seeds CSS in S_FaProjectStyling; en-US strings come from the Storybook locale mock. The frame teleports to document.body; set directInput to WindowProjectStyling for an open preview.'
      }
    }
  }
} satisfies Meta<typeof WindowProjectStyling>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    directInput: 'WindowProjectStyling'
  }
}
