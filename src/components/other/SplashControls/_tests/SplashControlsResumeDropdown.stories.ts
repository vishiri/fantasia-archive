import type { Decorator, Meta, StoryObj } from '@storybook/vue3-vite'

import SplashControlsResumeDropdown from '../SplashControlsResumeDropdown.vue'
import {
  configureSplashControlsStorybookRecentProjects,
  SPLASH_CONTROLS_STORYBOOK_RECENT_PROJECTS
} from './splashControlsStorybookHarness'

const splashResumeDropdownCanvasDecorator: Decorator = (story) => {
  return {
    components: {
      story
    },
    template: `
      <div class="bg-dark flex flex-center" style="min-height: 720px; width: 100%;">
        <story />
      </div>
    `
  }
}

const withSplashControlsRecentProjects: Decorator = (story) => {
  configureSplashControlsStorybookRecentProjects(SPLASH_CONTROLS_STORYBOOK_RECENT_PROJECTS)
  return story()
}

const meta = {
  component: SplashControlsResumeDropdown,
  decorators: [splashResumeDropdownCanvasDecorator],
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/other/SplashControlsResumeDropdown'
} satisfies Meta<typeof SplashControlsResumeDropdown>

export default meta

export const WithRecentProjects: StoryObj<typeof meta> = {
  decorators: [withSplashControlsRecentProjects]
}
