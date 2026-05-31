import type { Decorator, Meta, StoryObj } from '@storybook/vue3-vite'

import {
  withStorybookWorkspaceHomePreview,
  withStorybookWorkspaceHomePreviewTipsHidden
} from '../../../../../.storybook-workspace/.storybook/decorators/withStorybookWorkspaceHomePreview'

import ProjectOverview from '../ProjectOverview.vue'

const projectOverviewCanvasDecorator: Decorator = (story) => {
  return {
    components: {
      story
    },
    template: `
      <div class="bg-dark flex flex-center" style="min-height: 520px; padding: 24px; width: 100%;">
        <story />
      </div>
    `
  }
}

const meta = {
  title: 'Components/projectUI/ProjectOverview',
  component: ProjectOverview,
  tags: ['autodocs'],
  decorators: [projectOverviewCanvasDecorator],
  parameters: {
    docs: {
      description: {
        component:
          'Workspace home block on /home: shows the active project name and an optional Did you know? card with a random Tips, Tricks & Trivia line (respecting App Settings hide flags).'
      }
    }
  }
} satisfies Meta<typeof ProjectOverview>

export default meta

export const Default: StoryObj<typeof meta> = {
  decorators: [withStorybookWorkspaceHomePreview]
}

export const WithActiveProject: StoryObj<typeof meta> = {
  name: 'States/WithActiveProject',
  decorators: [withStorybookWorkspaceHomePreview]
}

export const TipsCardHidden: StoryObj<typeof meta> = {
  name: 'States/TipsCardHidden',
  decorators: [withStorybookWorkspaceHomePreviewTipsHidden]
}
