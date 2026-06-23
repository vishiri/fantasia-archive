import type { Decorator, Meta, StoryObj } from '@storybook/vue3-vite'

import SplashControlsStoryStage from './SplashControlsStoryStage.vue'
import {
  configureSplashControlsStorybookRecentProjects,
  SPLASH_CONTROLS_STORYBOOK_RECENT_PROJECTS
} from './splashControlsStorybookHarness'

const splashStoryStageCanvasDecorator: Decorator = (story) => {
  return {
    components: {
      story
    },
    template: '<story />'
  }
}

const withSplashControlsRecentProjects: Decorator = (story) => {
  configureSplashControlsStorybookRecentProjects(SPLASH_CONTROLS_STORYBOOK_RECENT_PROJECTS)
  return story()
}

const meta = {
  component: SplashControlsStoryStage,
  decorators: [splashStoryStageCanvasDecorator],
  parameters: {
    layout: 'fullscreen'
  },
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/other/SplashControlsStoryStage'
} satisfies Meta<typeof SplashControlsStoryStage>

export default meta

export const Default: StoryObj<typeof meta> = {
  decorators: [withSplashControlsRecentProjects]
}

export const ResumeMenuOpen: StoryObj<typeof meta> = {
  decorators: [withSplashControlsRecentProjects],
  args: {
    openResumeMenuOnMount: true
  }
}
