import type { Meta, StoryObj } from '@storybook/vue3-vite'

import DialogProjectMedia from '../DialogProjectMedia.vue'

const meta = {
  component: DialogProjectMedia,
  parameters: {
    docs: {
      description: {
        component:
          'Project Media dialog: per-tab sticky shell. Each slide carries its own heading (Project Media - Media List, Project Media - Single Medium Edit, Project Media - Add New Media, Project Media - Add Online Media, Project Media - Mass Edit / Add Media). Media list is a 150px thumbnail grid; left-click opens a 700px right slide-out editor (max-width 100%). Escape on that slide blurs a focused field first, then closes when clean, and does not bounce the sticky dialog. Media List stays sticky. Single Medium Edit is sticky only while the loaded row is dirty. Media Addition is Escape-closeable. Add any numbers of your media URLs is its own slide, resets and focuses the textarea on enter, and is sticky only while that textarea is nonempty. Close and Submit Media List sit in the right-aligned footer. Submit Media List is disabled until the box has a non-blank line. Mass Medium Edit is always sticky. Search media... lives on Media List only. Media Addition is a dashed drop zone with Add Offline Media / Add Online Media. Submit Media List appends session rows on Mass Medium Edit. Opens via directInput in Storybook; initialPanel selects the slide.'
      },
      story: {
        iframeHeight: '760px',
        inline: false
      }
    }
  },
  tags: ['autodocs'],
  title: 'Components/dialogs/DialogProjectMedia'
} satisfies Meta<typeof DialogProjectMedia>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    directInput: 'ProjectMedia',
    initialPanel: 'mediaList'
  }
}

export const MediaAddition: StoryObj<typeof meta> = {
  args: {
    directInput: 'ProjectMedia',
    initialPanel: 'mediaAdd'
  }
}

export const AddOnlineUrls: StoryObj<typeof meta> = {
  args: {
    directInput: 'ProjectMedia',
    initialPanel: 'mediaAddOnlineUrls'
  }
}

export const SingleMediumEdit: StoryObj<typeof meta> = {
  args: {
    directInput: 'ProjectMedia',
    initialPanel: 'mediaSingleEdit'
  }
}

export const MassMediumEdit: StoryObj<typeof meta> = {
  args: {
    directInput: 'ProjectMedia',
    initialPanel: 'mediaMassEdit'
  }
}
