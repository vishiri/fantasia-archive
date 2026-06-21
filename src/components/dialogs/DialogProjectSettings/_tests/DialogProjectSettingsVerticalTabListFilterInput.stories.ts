import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectSettingsVerticalTabListFilterInput from '../DialogProjectSettingsVerticalTabListFilterInput.vue'

const meta = {
  component: DialogProjectSettingsVerticalTabListFilterInput,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  title: 'Components/dialogs/DialogProjectSettingsVerticalTabListFilterInput'
} satisfies Meta<typeof DialogProjectSettingsVerticalTabListFilterInput>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {
  render: () => ({
    components: {
      DialogProjectSettingsVerticalTabListFilterInput
    },
    template: '<DialogProjectSettingsVerticalTabListFilterInput model-value="" />'
  })
}

export const WithQuery: Story = {
  render: () => ({
    components: {
      DialogProjectSettingsVerticalTabListFilterInput
    },
    template: '<DialogProjectSettingsVerticalTabListFilterInput model-value="atlas" />'
  })
}
