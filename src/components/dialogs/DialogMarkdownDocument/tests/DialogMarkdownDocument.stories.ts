import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogMarkdownDocument from '../DialogMarkdownDocument.vue'

const meta = {
  title: 'Components/DialogMarkdownDocument',
  component: DialogMarkdownDocument,
  tags: ['autodocs'],
  parameters: {
    docs: {
      /**
       * One Docs page renders every story; 'inline: true' mounts them all at once and each opens
       * 'q-dialog' on mount → overlapping modals. A per-story iframe isolates a single instance.
       */
      story: {
        inline: false,
        iframeHeight: '760px'
      },
      description: {
        component: 'Markdown-backed dialog for in-app documents. Data contract: directInput must be one of the documented T_documentName keys.'
      }
    }
  }
} satisfies Meta<typeof DialogMarkdownDocument>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    directInput: 'changeLog'
  }
}

export const StatesLicense: StoryObj<typeof meta> = {
  name: 'States/License',
  args: {
    directInput: 'license'
  }
}

export const StatesTipsTricksTrivia: StoryObj<typeof meta> = {
  name: 'States/TipsTricksTrivia',
  args: {
    directInput: 'tipsTricksTrivia'
  }
}

export const StatesAdvancedSearchGuide: StoryObj<typeof meta> = {
  name: 'States/AdvancedSearchGuide',
  args: {
    directInput: 'advancedSearchGuide'
  }
}
export const I18nStressLongStrings: StoryObj<typeof meta> = {
  name: 'I18nStress/LongStrings',
  args: {
    directInput: 'advancedSearchGuide'
  },
  parameters: {
    i18nScenario: 'longStrings'
  }
}

export const I18nStressMarkdownHeavy: StoryObj<typeof meta> = {
  name: 'I18nStress/MarkdownHeavy',
  args: {
    directInput: 'test'
  },
  parameters: {
    i18nScenario: 'markdownHeavy'
  }
}
