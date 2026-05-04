import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { FA_KEYBINDS_STORE_DEFAULTS } from 'app/src-electron/mainScripts/keybinds/faKeybindsStoreDefaults'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'

import AppControlMenus from '../AppControlMenus.vue'

const meta = {
  title: 'Components/globals/AppControlMenus',
  component: AppControlMenus,
  tags: ['autodocs'],
  args: {
    embedDialogs: false
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: '320px'
      },
      description: {
        component:
          'Top menu composition: four `AppControlSingleMenu` groups (Project, Documents, Tools & Settings, Help & Info) from `_data/` builders. Documents lists quick-add, quick-search, and mass-delete rows; Tools & Settings keeps layout, note board, import/export, custom **CSS**, keybinds, and program settings. Tools and Help rows may set `keybindCommandId` for live shortcut hints when `S_FaKeybinds.snapshot` is populated (Help includes **Action monitor** and **Toggle developer tools** hints when defaults load). Set `embedDialogs` true to mount markdown and settings dialogs used by menu triggers (they stay closed until an action runs).'
      }
    }
  }
} satisfies Meta<typeof AppControlMenus>

export default meta

export const Default: StoryObj<typeof meta> = {}

export const CompositionProductionMenuContract: StoryObj<typeof meta> = {
  name: 'States/CompositionProductionMenuContract',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getAllByRole('button').length).toBeGreaterThan(0)
    await expect(canvasElement.querySelectorAll('[data-test-menu-any="appControlMenus-anyMenu"]').length).toBe(4)

    const keybinds = S_FaKeybinds()
    keybinds.snapshot = {
      platform: 'win32',
      store: { ...FA_KEYBINDS_STORE_DEFAULTS }
    }

    await userEvent.click(canvas.getByRole('button', { name: 'Help & Info' }))
    await waitFor(async () => {
      const hints = document.body.querySelectorAll('[data-test-locator="AppControlSingleMenu-menuItem-keybind"]')
      await expect(hints.length).toBeGreaterThan(0)
    })
  }
}

export const WithEmbeddedDialogs: StoryObj<typeof meta> = {
  name: 'States/WithEmbeddedDialogs',
  args: {
    embedDialogs: true
  },
  parameters: {
    docs: {
      story: {
        iframeHeight: '420px'
      }
    }
  }
}
