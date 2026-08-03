import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ProjectAppControlBarTabContextMenuCloseRows from '../ProjectAppControlBarTabContextMenuCloseRows.vue'

const meta = {
  component: ProjectAppControlBarTabContextMenuCloseRows,
  parameters: {
    docs: {
      story: {
        inline: false
      }
    }
  },
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/projectUI/ProjectAppControlBarTabContextMenuCloseRows'
} satisfies Meta<typeof ProjectAppControlBarTabContextMenuCloseRows>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    closeAllTabsWithoutChangesExceptThisOneLabel: 'Close all except this one',
    closeAllTabsWithoutChangesLabel: 'Close all without changes',
    closeThisTabLabel: 'Close this tab',
    onCloseAllTabsWithoutChangesClick: () => {},
    onCloseAllTabsWithoutChangesExceptThisOneClick: () => {},
    onCloseThisTabClick: () => {}
  },
  render: (args) => ({
    components: {
      ProjectAppControlBarTabContextMenuCloseRows
    },
    setup () {
      return {
        args
      }
    },
    template: `
      <q-list dark style="max-width: 280px; background: #1d1d1d;">
        <ProjectAppControlBarTabContextMenuCloseRows v-bind="args" />
      </q-list>
    `
  })
}
