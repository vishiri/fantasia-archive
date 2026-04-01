import type { Meta, StoryObj } from '@storybook/vue3'

import { buttonList } from '../components/SocialContactButtons/_data/buttons'
import StoryRouterShell from '../../.storybook-workspace/.storybook/components/StoryRouterShell.vue'

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

type Story = StoryObj<typeof meta>

/** Mirrors `/componentTesting/:componentName` with `SocialContactSingleButton` + sample `dataInput`. */
export const WithSocialContactSingleButton: Story = {
  name: 'With Single Component Test',
  args: { initialPath: '/componentTesting/SocialContactSingleButton' }
}
