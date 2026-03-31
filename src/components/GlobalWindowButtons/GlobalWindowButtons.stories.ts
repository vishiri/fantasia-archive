import type { Meta, StoryObj } from '@storybook/vue3'

import GlobalWindowButtons from './GlobalWindowButtons.vue'

const meta = {
  title: 'Components/GlobalWindowButtons',
  component: GlobalWindowButtons
} satisfies Meta<typeof GlobalWindowButtons>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
