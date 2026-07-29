import type { Meta, StoryObj } from '@storybook/vue3-vite'

import FaDeleteConfirmButton from '../FaDeleteConfirmButton.vue'

const meta = {
  component: FaDeleteConfirmButton,
  parameters: {
    docs: {
      description: {
        component:
          'Outline delete trigger with confirm menu and countdown before the confirm action enables.'
      }
    }
  },
  /**
   * Countdown timer animates confirm label; VRT baselines would thrash.
   */
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/elements/FaDeleteConfirmButton'
} satisfies Meta<typeof FaDeleteConfirmButton>

export default meta

const sharedArgs = {
  confirmButtonTestLocator: 'faDeleteConfirmButton-story-confirm',
  confirmMenuTestLocator: 'faDeleteConfirmButton-story-menu',
  confirmMessageTestLocator: 'faDeleteConfirmButton-story-message',
  countdownTestLocator: 'faDeleteConfirmButton-story-countdown',
  deleteButtonLabelKey: 'dialogs.projectSettings.panels.worlds.deleteWorldButton',
  deleteConfirmConfirmButtonKey: 'dialogs.projectSettings.panels.worlds.deleteConfirm.confirmDeleteButton',
  deleteConfirmMessageKey: 'dialogs.projectSettings.panels.worlds.deleteConfirm.message',
  removeButtonTestLocator: 'faDeleteConfirmButton-story-remove',
  removeDisabled: false
} as const

export const Default: StoryObj<typeof meta> = {
  args: {
    ...sharedArgs
  },
  render: (args) => ({
    components: {
      FaDeleteConfirmButton
    },
    setup () {
      return {
        args
      }
    },
    template: `
      <div class="q-pa-md bg-dark">
        <FaDeleteConfirmButton
          v-bind="args"
          @confirm="() => undefined"
        />
      </div>
    `
  })
}

export const Disabled: StoryObj<typeof meta> = {
  args: {
    ...sharedArgs,
    removeDisabled: true,
    removeDisabledTooltipKey: 'dialogs.projectSettings.panels.worlds.removeDisabledHasDocuments'
  },
  render: Default.render
}
