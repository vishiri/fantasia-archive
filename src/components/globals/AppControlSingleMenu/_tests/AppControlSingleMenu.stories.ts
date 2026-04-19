import type { Decorator, Meta, StoryObj } from '@storybook/vue3-vite'
import type { I_appMenuList } from 'app/types/I_appMenusDataList'
import { expect, userEvent, waitFor } from 'storybook/test'

import {
  faMenuItem,
  faMenuSeparator
} from 'app/src/components/globals/AppControlMenus/_data/menuDataHelpers'
import { FA_KEYBINDS_STORE_DEFAULTS } from 'app/src-electron/mainScripts/keybinds/faKeybindsStoreDefaults'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'

import AppControlSingleMenu from '../AppControlSingleMenu.vue'

/**
 * Seeds Pinia keybind snapshot so rows with `keybindCommandId` show the same parenthesized hints as the desktop app.
 */
const withFaKeybindsSnapshot: Decorator = (Story) => {
  const keybinds = S_FaKeybinds()
  keybinds.snapshot = {
    platform: 'win32',
    store: { ...FA_KEYBINDS_STORE_DEFAULTS }
  }
  return Story()
}

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
          text: 'Nested row with keybind hint',
          icon: 'mdi-keyboard-settings',
          conditions: true,
          keybindCommandId: 'openKeybindSettings'
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

const dataToolsAndHelpStyleWithHints: I_appMenuList = {
  title: 'Tools (storybook fixture)',
  data: [
    faMenuItem('appControlMenus.tools.items.quickAddNewDocument', 'mdi-text-box-plus-outline'),
    faMenuSeparator(),
    faMenuItem('appControlMenus.tools.items.keybindSettings', 'mdi-keyboard-settings', {
      keybindCommandId: 'openKeybindSettings'
    }),
    faMenuItem('appControlMenus.tools.items.programSettings', 'mdi-tune', {
      keybindCommandId: 'openProgramSettings'
    }),
    faMenuSeparator(),
    faMenuItem('appControlMenus.helpInfo.items.advancedSearchGuide', 'mdi-file-question', {
      keybindCommandId: 'openAdvancedSearchGuide'
    }),
    faMenuItem('appControlMenus.helpInfo.items.actionMonitor', 'mdi-pulse', {
      keybindCommandId: 'openActionMonitor'
    }),
    faMenuItem('appControlMenus.helpInfo.items.toggleDeveloperTools', 'mdi-code-tags', {
      keybindCommandId: 'toggleDeveloperTools'
    })
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
  title: 'Components/globals/AppControlSingleMenu',
  component: AppControlSingleMenu,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Single dropdown menu renderer used by app control menu groups. Data contract: `dataInput` must follow `I_appMenuList` shape. Optional `keybindCommandId` on items or submenu rows shows a parenthesized shortcut when `S_FaKeybinds.snapshot` is loaded (see Stories that use the `withFaKeybindsSnapshot` decorator).'
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
  decorators: [withFaKeybindsSnapshot],
  args: {
    dataInput: dataWithSubmenu
  }
}

export const StatesWithKeybindHints: StoryObj<typeof meta> = {
  name: 'States/WithKeybindHints',
  decorators: [withFaKeybindsSnapshot],
  args: {
    dataInput: dataToolsAndHelpStyleWithHints
  }
}

export const InteractionsOpensMenuOnClick: StoryObj<typeof meta> = {
  name: 'Interactions/OpensMenuOnClick',
  play: async ({ canvasElement }) => {
    const wrapperButton = canvasElement.querySelector('[data-test-locator="AppControlSingleMenu-wrapper"]')
    await expect(wrapperButton).toBeTruthy()
    await userEvent.click(wrapperButton as HTMLElement)
    await waitFor(async () => {
      const menuItemNode = canvasElement.querySelector('[data-test-locator="AppControlSingleMenu-menuItem"]') ??
        document.body.querySelector('[data-test-locator="AppControlSingleMenu-menuItem"]')
      await expect(menuItemNode).toBeTruthy()
    })
  }
}

export const InteractionsKeybindHintsWhenMenuOpen: StoryObj<typeof meta> = {
  name: 'Interactions/KeybindHintsWhenMenuOpen',
  decorators: [withFaKeybindsSnapshot],
  args: {
    dataInput: dataToolsAndHelpStyleWithHints
  },
  play: async ({ canvasElement }) => {
    const wrapperButton = canvasElement.querySelector('[data-test-locator="AppControlSingleMenu-wrapper"]')
    await expect(wrapperButton).toBeTruthy()
    await userEvent.click(wrapperButton as HTMLElement)
    await waitFor(async () => {
      const hints = document.body.querySelectorAll('[data-test-locator="AppControlSingleMenu-menuItem-keybind"]')
      await expect(hints.length).toBeGreaterThanOrEqual(3)
    })
  }
}

export const I18nStressLongLabels: StoryObj<typeof meta> = {
  name: 'I18nStress/LongLabels',
  args: {
    dataInput: longLabelsDataInput
  }
}
