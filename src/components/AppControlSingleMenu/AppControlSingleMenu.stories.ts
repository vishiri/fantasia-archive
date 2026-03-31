import type { Meta, StoryObj } from '@storybook/vue3'
import type { I_appMenuList } from 'app/types/I_appMenusDataList'

import AppControlSingleMenu from './AppControlSingleMenu.vue'

const dataInput: I_appMenuList = {
  title: 'Storybook Menu',
  data: [
    {
      mode: 'item',
      text: 'Open item',
      icon: 'mdi-book-open-page-variant',
      conditions: true
    },
    {
      mode: 'separator'
    },
    {
      mode: 'item',
      text: 'Disabled item',
      icon: 'mdi-cancel',
      conditions: false
    }
  ]
}

const meta = {
  title: 'Components/AppControlSingleMenu',
  component: AppControlSingleMenu,
  args: {
    dataInput
  }
} satisfies Meta<typeof AppControlSingleMenu>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
