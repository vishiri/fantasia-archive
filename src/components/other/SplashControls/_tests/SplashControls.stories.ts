import type { Decorator, Meta, StoryObj } from '@storybook/vue3-vite'

import SplashControls from '../SplashControls.vue'
import SplashControlsStoryStage from './SplashControlsStoryStage.vue'
import {
  configureSplashControlsStorybookRecentProjects,
  SPLASH_CONTROLS_STORYBOOK_RECENT_PROJECTS
} from './splashControlsStorybookHarness'

const splashControlsCanvasDecorator: Decorator = (story) => {
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
  title: 'Components/other/SplashControls',
  component: SplashControls,
  tags: ['autodocs'],
  decorators: [splashControlsCanvasDecorator],
  parameters: {
    docs: {
      story: {
        iframeHeight: '760px',
        inline: false
      },
      description: {
        component:
          'Welcome-screen primary actions: optional **Resume Latest Project** split control (MRU from main-process recent list), **Create new project**, and **Load existing project**. Resume appears only when at least one recent entry exists; the caret opens a menu of recent display names with file paths.'
      }
    }
  }
} satisfies Meta<typeof SplashControls>

export default meta

/**
 * No recent projects — resume control hidden; create and load only.
 */
export const Default: StoryObj<typeof meta> = {}

/**
 * MRU seeded — **Resume Latest Project** split button visible above create/load.
 */
export const StatesWithResumeLatest: StoryObj<typeof meta> = {
  name: 'States/WithResumeLatest',
  decorators: [withSplashControlsRecentProjects],
  render: () => ({
    components: {
      SplashControls
    },
    template: '<SplashControls />'
  })
}

/**
 * MRU menu open with two recent rows (caret segment); stable for canvas and visual capture.
 */
export const StatesResumeMenuOpen: StoryObj<typeof meta> = {
  name: 'States/ResumeMenuOpen',
  decorators: [withSplashControlsRecentProjects],
  render: () => ({
    components: {
      SplashControlsStoryStage
    },
    template: '<SplashControlsStoryStage :open-resume-menu-on-mount="true" />'
  })
}
