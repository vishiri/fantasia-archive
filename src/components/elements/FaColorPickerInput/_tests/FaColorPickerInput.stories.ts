import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

import FaColorPickerInput from '../FaColorPickerInput.vue'

const meta = {
  title: 'Components/elements/FaColorPickerInput',
  component: FaColorPickerInput,
  tags: ['autodocs'],
  args: {
    modelValue: '#b81212',
    testLocator: 'faColorPickerInput-story'
  }
} satisfies Meta<typeof FaColorPickerInput>

export default meta

export const Default: StoryObj<typeof meta> = {
  render: (args) => ({
    components: {
      FaColorPickerInput
    },
    setup () {
      const color = ref(args.modelValue)
      return {
        args,
        color
      }
    },
    template: `
      <div class="q-pa-md" style="max-width: 280px;">
        <FaColorPickerInput
          v-model="color"
          :test-locator="args.testLocator"
        />
      </div>
    `
  })
}

export const BlankUsesDefaultSwatch: StoryObj<typeof meta> = {
  args: {
    modelValue: ''
  },
  render: Default.render
}

export const WithProjectPalette: StoryObj<typeof meta> = {
  args: {
    modelValue: '#b81212',
    palette: ['#112233', '#445566', '#aabbcc']
  },
  render: Default.render
}

export const WithDraftPaletteAppend: StoryObj<typeof meta> = {
  args: {
    modelValue: '#86278c',
    palette: ['#112233', '#445566'],
    paletteAppend: {
      mode: 'draft',
      worldColorPalette: '#112233;#445566'
    }
  },
  render: Default.render
}
