import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectMediaSlideTitle from '../DialogProjectMediaSlideTitle.vue'

const meta = {
  component: DialogProjectMediaSlideTitle,
  parameters: {
    docs: {
      description: {
        component:
          'Project Media dialog heading that lives on each inner slide and moves with the tab panel.'
      }
    },
    layout: 'padded'
  },
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/dialogs/DialogProjectMediaSlideTitle'
} satisfies Meta<typeof DialogProjectMediaSlideTitle>

export default meta

export const List: StoryObj<typeof meta> = {
  args: {
    label: 'Project Media - Media List',
    testLocator: 'dialogProjectMedia-title-mediaList'
  }
}

export const AddNewMedia: StoryObj<typeof meta> = {
  args: {
    label: 'Project Media - Add New Media',
    testLocator: 'dialogProjectMedia-title-mediaAdd'
  }
}

export const AddOnlineMedia: StoryObj<typeof meta> = {
  args: {
    label: 'Project Media - Add Online Media',
    testLocator: 'dialogProjectMedia-title-mediaAddOnlineUrls'
  }
}

export const MassEdit: StoryObj<typeof meta> = {
  args: {
    label: 'Project Media - Mass Edit / Add Media',
    testLocator: 'dialogProjectMedia-title-mediaMassEdit'
  }
}
