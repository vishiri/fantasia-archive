import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ErrorCard from '../ErrorCard.vue'

const meta = {
  title: 'Components/elements/ErrorCard',
  component: ErrorCard,
  decorators: [
    (story) => ({
      components: {
        story
      },
      template: '<div class="bg-dark q-pa-xl flex flex-center" style="min-height: 420px"><story /></div>'
    })
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Centered cream error or empty-state card with a negative title, optional description between title and mascot, Fantasia mascot, and optional details below the image.'
      }
    }
  },
  tags: ['autodocs']
} satisfies Meta<typeof ErrorCard>

export default meta

export const ProgramSettingsSearchEmpty: StoryObj<typeof meta> = {
  args: {
    description:
      'Fantasia sadly did not find any setting you were looking for. Perhaps try a different search term?',
    imageName: 'reading',
    title: 'No search match',
    width: 500
  }
}

export const ErrorPage: StoryObj<typeof meta> = {
  args: {
    details: 'Something broke horribly somewhere\nFantasia is trying her best to fix it!',
    imageName: 'error',
    title: 'ERROR/NOT FOUND',
    width: 500
  }
}
