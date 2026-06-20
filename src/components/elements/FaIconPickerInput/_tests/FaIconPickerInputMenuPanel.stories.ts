import type { Meta, StoryObj } from '@storybook/vue3-vite'

import FaIconPickerInputMenuPanel from '../FaIconPickerInputMenuPanel.vue'

const meta = {
  component: FaIconPickerInputMenuPanel,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/elements/FaIconPickerInputMenuPanel'
} satisfies Meta<typeof FaIconPickerInputMenuPanel>

export default meta

export const WithCatalogRows: StoryObj<typeof meta> = {
  args: {
    catalogLoadError: null,
    catalogRows: [
      ['mdi-account', 'mdi-home', 'mdi-map-marker'],
      ['mdi-pencil', 'mdi-delete', 'mdi-cog']
    ],
    hasCatalogRows: true,
    isCatalogLoading: false,
    menuTestLocator: 'faIconPickerInputMenuPanel-story',
    modelValue: 'mdi-account',
    searchQuery: ''
  }
}

export const Loading: StoryObj<typeof meta> = {
  args: {
    catalogLoadError: null,
    catalogRows: [],
    hasCatalogRows: false,
    isCatalogLoading: true,
    menuTestLocator: 'faIconPickerInputMenuPanel-story',
    modelValue: '',
    searchQuery: ''
  }
}

export const EmptyResults: StoryObj<typeof meta> = {
  args: {
    catalogLoadError: null,
    catalogRows: [],
    hasCatalogRows: false,
    isCatalogLoading: false,
    menuTestLocator: 'faIconPickerInputMenuPanel-story',
    modelValue: '',
    searchQuery: 'no-match-query'
  }
}
