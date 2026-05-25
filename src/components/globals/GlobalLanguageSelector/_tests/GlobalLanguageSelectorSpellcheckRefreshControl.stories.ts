import type { Meta, StoryObj } from '@storybook/vue3-vite'

import GlobalLanguageSelectorSpellcheckRefreshControl from '../GlobalLanguageSelectorSpellcheckRefreshControl.vue'

const meta = {
  component: GlobalLanguageSelectorSpellcheckRefreshControl,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/globals/GlobalLanguageSelectorSpellcheckRefreshControl'
} satisfies Meta<typeof GlobalLanguageSelectorSpellcheckRefreshControl>

export default meta

export const Visible: StoryObj<typeof meta> = {
  args: {
    show: true
  }
}
