import type { Meta, StoryObj } from '@storybook/vue3-vite'

import { buttonList } from '../../components/other/SocialContactButtons/_data/buttons'
import StoryRouterShell from '../../../.storybook-workspace/.storybook/components/StoryRouterShell.vue'

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
