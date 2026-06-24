import type { Meta, StoryObj } from '@storybook/vue3-vite'

import FaMultilineTooltipBody from '../FaMultilineTooltipBody.vue'

const meta = {
  component: FaMultilineTooltipBody,
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/elements/FaMultilineTooltipBody'
} satisfies Meta<typeof FaMultilineTooltipBody>

export default meta

export const Multiline: StoryObj<typeof meta> = {
  args: {
    text: 'Missing translations for current language:\n- Singular form missing'
  }
}

export const SingleLine: StoryObj<typeof meta> = {
  args: {
    text: 'Missing group display name for current language.'
  }
}
