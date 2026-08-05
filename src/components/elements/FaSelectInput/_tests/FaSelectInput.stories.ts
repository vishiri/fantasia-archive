import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

import FaSelectInput from '../FaSelectInput.vue'

const simpleOptions = [
  'test 1',
  'test 2',
  'test 3',
  'test 4',
  'test 5'
]

const meta = {
  title: 'Components/elements/FaSelectInput',
  component: FaSelectInput,
  tags: ['autodocs'],
  args: {
    mode: 'simple',
    modelValue: '',
    options: simpleOptions,
    testLocator: 'faSelectInput-story'
  }
} satisfies Meta<typeof FaSelectInput>

export default meta

export const SimpleSingle: StoryObj<typeof meta> = {
  render: (args) => ({
    components: {
      FaSelectInput
    },
    setup () {
      const value = ref(args.modelValue)
      return {
        args,
        value
      }
    },
    template: `
      <div class="q-pa-md" style="max-width: 420px;">
        <FaSelectInput
          v-model="value"
          :mode="args.mode"
          :options="args.options"
          :test-locator="args.testLocator"
          label="Simple single"
        />
      </div>
    `
  })
}

export const SimpleMulti: StoryObj<typeof meta> = {
  args: {
    modelValue: ['test 1'],
    multiple: true
  },
  render: (args) => ({
    components: {
      FaSelectInput
    },
    setup () {
      const value = ref(args.modelValue)
      return {
        args,
        value
      }
    },
    template: `
      <div class="q-pa-md" style="max-width: 420px;">
        <FaSelectInput
          v-model="value"
          mode="simple"
          multiple
          :options="args.options"
          :test-locator="args.testLocator"
          label="Simple multi"
          clear-input-on-select
        />
      </div>
    `
  })
}

export const DocumentWithIsNew: StoryObj<typeof meta> = {
  args: {
    mode: 'document',
    modelValue: {
      id: 'new-1',
      name: 'Draft hero',
      icon: 'mdi-account',
      isNew: true
    },
    options: [
      {
        id: '1',
        name: 'Existing',
        icon: 'mdi-file-outline'
      },
      {
        id: 'new-1',
        name: 'Draft hero',
        icon: 'mdi-account',
        isNew: true
      }
    ],
    allowCreateNew: true
  },
  render: (args) => ({
    components: {
      FaSelectInput
    },
    setup () {
      const value = ref(args.modelValue)
      return {
        args,
        value
      }
    },
    template: `
      <div class="q-pa-md" style="max-width: 420px;">
        <FaSelectInput
          v-model="value"
          mode="document"
          allow-create-new
          clear-input-on-select
          :options="args.options"
          :test-locator="args.testLocator"
          label="Document select"
        />
      </div>
    `
  })
}
