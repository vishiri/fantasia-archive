import type { Meta, StoryObj } from '@storybook/vue3-vite'

import { getSocialContactButtonListForCurrentLocale } from '../../components/other/SocialContactButtons/scripts/getSocialContactButtonListForCurrentLocale'
import StoryRouterShell from '../../../.storybook-workspace/.storybook/components/StoryRouterShell.vue'

const buttonList = getSocialContactButtonListForCurrentLocale()

const meta = {
  title: 'Layouts/ComponentTestingLayout',
  component: StoryRouterShell,
  parameters: {
    docs: { disable: true },
    contentBridgeOverrides: {
      extraEnvVariables: {
        COMPONENT_PROPS: { dataInput: buttonList.buttonWebsite }
      }
    }
  },
  args: {
    initialPath: '/componentTesting/SocialContactSingleButton'
  }
} satisfies Meta<typeof StoryRouterShell>

export default meta

/** Mirrors '/componentTesting/:componentName' with 'SocialContactSingleButton' + sample 'dataInput'. */
export const WithSocialContactSingleButton: StoryObj<typeof meta> = {
  name: 'With Single Component Test',
  args: { initialPath: '/componentTesting/SocialContactSingleButton' }
}
