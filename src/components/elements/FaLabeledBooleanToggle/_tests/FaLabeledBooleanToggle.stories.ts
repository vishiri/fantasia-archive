import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

import FaLabeledBooleanToggle from '../FaLabeledBooleanToggle.vue'

const meta = {
  component: FaLabeledBooleanToggle,
  parameters: {
    docs: {
      description: {
        component:
          'Labeled boolean toggle with optional leading icon and FaHelpTooltipIcon description.'
      }
    }
  },
  tags: ['autodocs'],
  title: 'Components/elements/FaLabeledBooleanToggle'
} satisfies Meta<typeof FaLabeledBooleanToggle>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    description: 'When enabled, this document acts as a category folder in the hierarchy tree.',
    disabled: false,
    icon: 'mdi-folder',
    modelValue: false,
    testLocator: 'faLabeledBooleanToggle-story',
    title: 'Is a category'
  },
  render: (args) => ({
    components: {
      FaLabeledBooleanToggle
    },
    setup () {
      const enabled = ref(args.modelValue)
      return {
        args,
        enabled
      }
    },
    template: `
      <div class="q-pa-md bg-dark" style="max-width: 360px;">
        <FaLabeledBooleanToggle
          v-model="enabled"
          :description="args.description"
          :disabled="args.disabled"
          :icon="args.icon"
          :test-locator="args.testLocator"
          :title="args.title"
        />
      </div>
    `
  })
}

export const Checked: StoryObj<typeof meta> = {
  args: {
    ...Default.args,
    modelValue: true
  },
  render: Default.render
}

export const DisabledState: StoryObj<typeof meta> = {
  args: {
    ...Default.args,
    disabled: true,
    modelValue: true
  },
  render: Default.render
}
