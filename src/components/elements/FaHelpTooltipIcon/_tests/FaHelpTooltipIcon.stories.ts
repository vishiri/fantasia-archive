import type { Meta, StoryObj } from '@storybook/vue3-vite'

import FaHelpTooltipIcon from '../FaHelpTooltipIcon.vue'

const meta = {
  component: FaHelpTooltipIcon,
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  },
  tags: ['autodocs'],
  title: 'Components/elements/FaHelpTooltipIcon'
} satisfies Meta<typeof FaHelpTooltipIcon>

export default meta

export const Default: StoryObj<typeof meta> = {
  render: () => ({
    components: { FaHelpTooltipIcon },
    template: `
      <div style="align-items: center; display: flex; gap: 8px; padding: 24px;">
        <span style="color: #e0e0e0;">World color</span>
        <FaHelpTooltipIcon
          aria-label="Help about world color"
          data-test-locator="faHelpTooltipIcon-story"
        >
          <q-tooltip>World color help copy</q-tooltip>
        </FaHelpTooltipIcon>
      </div>
    `
  })
}
