import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { I_appMenuList } from 'app/types/I_appMenusDataList'
import { expect, userEvent, waitFor } from 'storybook/test'

import AppControlSingleMenu from '../AppControlSingleMenu.vue'

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

const dataWithSubmenu: I_appMenuList = {
  title: 'Storybook Menu',
  data: [
    {
      mode: 'item',
      text: 'Open item',
      icon: 'mdi-book-open-page-variant',
      conditions: true
    },
    {
      mode: 'item',
      text: 'Parent with submenu',
      icon: 'mdi-chevron-right',
      conditions: true,
      submenu: [
        {
          mode: 'item',
          text: 'Nested action',
          icon: 'mdi-star-outline',
          conditions: true
        },
        {
          mode: 'separator'
        },
        {
          mode: 'item',
          text: 'Nested secondary',
          icon: 'mdi-wrench',
          conditions: true,
          specialColor: 'secondary'
        }
      ]
    }
  ]
}

const longLabelsDataInput: I_appMenuList = {
  title: 'Storybook menu with long translation-like labels',
  data: [
    {
      mode: 'item',
      text: 'Open encyclopedia entry: The Crystal Archives of the Seventh Astral Realm',
      icon: 'mdi-book-open-page-variant',
      conditions: true
    },
    {
      mode: 'item',
      text: 'Disabled action with intentionally elongated wording for overflow resilience checks',
      icon: 'mdi-cancel',
      conditions: false
    }
  ]
}

const meta = {
  title: 'Components/AppControlSingleMenu',
  component: AppControlSingleMenu,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Single dropdown menu renderer used by app control menu groups. Data contract: `dataInput` must follow `I_appMenuList` shape.'
      }
    }
  },
  args: {
    dataInput
  }
} satisfies Meta<typeof AppControlSingleMenu>

export default meta

export const Default: StoryObj<typeof meta> = {}

export const StatesWithSubmenu: StoryObj<typeof meta> = {
  name: 'States/WithSubmenu',
  args: {
    dataInput: dataWithSubmenu
  }
}

export const InteractionsOpensMenuOnClick: StoryObj<typeof meta> = {
  name: 'Interactions/OpensMenuOnClick',
  play: async ({ canvasElement }) => {
    const wrapperButton = canvasElement.querySelector('[data-test="AppControlSingleMenu-wrapper"]')
    await expect(wrapperButton).toBeTruthy()
    await userEvent.click(wrapperButton as HTMLElement)
    await waitFor(async () => {
      const menuItemNode = canvasElement.querySelector('[data-test="AppControlSingleMenu-menuItem"]') ??
        document.body.querySelector('[data-test="AppControlSingleMenu-menuItem"]')
      await expect(menuItemNode).toBeTruthy()
    })
  }
}

export const I18nStressLongLabels: StoryObj<typeof meta> = {
  name: 'I18nStress/LongLabels',
  args: {
    dataInput: longLabelsDataInput
  }
}
