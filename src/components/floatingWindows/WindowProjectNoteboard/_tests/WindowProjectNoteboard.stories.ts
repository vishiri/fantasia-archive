import type { Decorator, Meta, StoryObj } from '@storybook/vue3-vite'

import { FA_KEYBINDS_STORE_DEFAULTS } from 'app/src-electron/mainScripts/keybinds/faKeybindsStoreDefaults'
import { S_FaProjectNoteboard } from 'app/src/stores/S_FaProjectNoteboard'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'

import WindowProjectNoteboard from '../WindowProjectNoteboard.vue'

const seedNoteboardStoryState: Decorator = (story) => {
  const noteboardStore = S_FaProjectNoteboard()

  noteboardStore.text = 'Storybook: sample project noteboard text.\nSecond line.'

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
      <div class="fa-storybook-windowProjectNoteboard-stage" style="min-height: 85vh; position: relative;">
        <story />
      </div>
    `
  }
}

const meta = {
  title: 'Components/floatingWindows/WindowProjectNoteboard',
  component: WindowProjectNoteboard,
  tags: ['autodocs'],
  decorators: [seedNoteboardStoryState],
  argTypes: {
    directInput: {
      control: 'select',
      options: ['', 'WindowProjectNoteboard']
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
          'Project noteboard in a movable, resizable floating window. The Storybook decorator seeds sample text plus a pinned **Win32** keybind snapshot so **Close** can show the same parenthesized shortcut hint as menus; en-US copy comes from the Storybook locale mock. The frame teleports to document.body; set directInput to WindowProjectNoteboard for the window to open.'
      }
    }
  }
} satisfies Meta<typeof WindowProjectNoteboard>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    directInput: 'WindowProjectNoteboard'
  }
}
