import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

import FaIconPickerInput from '../FaIconPickerInput.vue'

const meta = {
  title: 'Components/elements/FaIconPickerInput',
  component: FaIconPickerInput,
  parameters: {
    docs: {
      disable: true
    }
  },
  args: {
    modelValue: 'mdi-account',
    testLocator: 'faIconPickerInput-story'
  }
} satisfies Meta<typeof FaIconPickerInput>

export default meta

export const WithIcon: StoryObj<typeof meta> = {
  render: (args) => ({
    components: {
      FaIconPickerInput
    },
    setup () {
      const icon = ref(args.modelValue)
      return {
        args,
        icon
      }
    },
    template: `
      <div class="q-pa-md" style="max-width: 720px;">
        <FaIconPickerInput
          v-model="icon"
          :test-locator="args.testLocator"
        />
      </div>
    `
  })
}

export const EmptyValue: StoryObj<typeof meta> = {
  args: {
    modelValue: ''
  },
  render: WithIcon.render
}
