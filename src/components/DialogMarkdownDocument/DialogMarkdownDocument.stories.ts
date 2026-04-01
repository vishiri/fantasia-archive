import type { Meta, StoryObj } from '@storybook/vue3'

import DialogMarkdownDocument from './DialogMarkdownDocument.vue'

const meta = {
  title: 'Components/DialogMarkdownDocument',
  component: DialogMarkdownDocument,
  tags: ['autodocs'],
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: '760px'
      },
      description: {
        component: 'Markdown-backed dialog for in-app documents. Data contract: `directInput` must be one of the documented `T_documentName` keys.'
      }
    }
  }
} satisfies Meta<typeof DialogMarkdownDocument>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    directInput: 'changeLog'
  }
}

export const StatesLicense: Story = {
  name: 'States/License',
  args: {
    directInput: 'license'
  }
}

export const StatesTipsTricksTrivia: Story = {
  name: 'States/TipsTricksTrivia',
  args: {
    directInput: 'tipsTricksTrivia'
  }
}

export const StatesAdvancedSearchGuide: Story = {
  name: 'States/AdvancedSearchGuide',
  args: {
    directInput: 'advancedSearchGuide'
  }
}
export const I18nStressLongStrings: Story = {
  name: 'I18nStress/LongStrings',
  args: {
    directInput: 'advancedSearchGuide'
  },
  parameters: {
    i18nScenario: 'longStrings'
  }
}

export const I18nStressMarkdownHeavy: Story = {
  name: 'I18nStress/MarkdownHeavy',
  args: {
    directInput: 'tipsTricksTrivia'
  },
  parameters: {
    i18nScenario: 'markdownHeavy'
  }
}
