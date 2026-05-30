import type { Decorator, Meta, StoryObj } from '@storybook/vue3-vite'

import { FA_KEYBINDS_STORE_DEFAULTS } from 'app/src-electron/mainScripts/keybinds/keybinds_managerDefaults'
import { S_FaAppNoteboard } from 'app/src/stores/S_FaAppNoteboard'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'

import WindowAppNoteboard from '../WindowAppNoteboard.vue'

const seedNoteboardStoryState: Decorator = (story) => {
  const noteboardStore = S_FaAppNoteboard()

  noteboardStore.text = 'Storybook: sample noteboard text.\nSecond line.'

  const keybindStore = S_FaKeybinds()

  keybindStore.snapshot = {
    platform: 'win32',
    store: {
      ...FA_KEYBINDS_STORE_DEFAULTS
    }
  }

  return {
    components: { story },
    template: `
      <div class="fa-storybook-windowAppNoteboard-stage" style="min-height: 85vh; position: relative;">
        <story />
      </div>
    `
  }
}

const meta = {
  title: 'Components/floatingWindows/WindowAppNoteboard',
  component: WindowAppNoteboard,
  tags: ['autodocs'],
  decorators: [seedNoteboardStoryState],
  argTypes: {
    directInput: {
      control: 'select',
      options: ['', 'WindowAppNoteboard']
    }
  },
  parameters: {
    docs: {
      story: {
        iframeHeight: '720px',
        inline: false
      },
      description: {
        component:
          'App noteboard in a movable, resizable floating window. The Storybook decorator seeds sample text plus a pinned **Win32** keybind snapshot so **Close** can show the same parenthesized shortcut hint as menus; en-US copy comes from the Storybook locale mock. The frame teleports to document.body; set directInput to WindowAppNoteboard for the window to open.'
      }
    }
  }
} satisfies Meta<typeof WindowAppNoteboard>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    directInput: 'WindowAppNoteboard'
  }
}
