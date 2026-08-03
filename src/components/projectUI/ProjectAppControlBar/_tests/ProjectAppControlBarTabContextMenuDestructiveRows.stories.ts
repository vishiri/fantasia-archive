import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ProjectAppControlBarTabContextMenuDestructiveRows from '../ProjectAppControlBarTabContextMenuDestructiveRows.vue'

const meta = {
  component: ProjectAppControlBarTabContextMenuDestructiveRows,
  parameters: {
    docs: {
      story: {
        inline: false
      }
    }
  },
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/projectUI/ProjectAppControlBarTabContextMenuDestructiveRows'
} satisfies Meta<typeof ProjectAppControlBarTabContextMenuDestructiveRows>

export default meta

function renderDestructiveRows (args: Record<string, unknown>) {
  return {
    components: {
      ProjectAppControlBarTabContextMenuDestructiveRows
    },
    setup () {
      return {
        args
      }
    },
    template: `
      <q-list dark style="max-width: 280px; background: #1d1d1d;">
        <ProjectAppControlBarTabContextMenuDestructiveRows v-bind="args" />
      </q-list>
    `
  }
}

export const WithDelete: StoryObj<typeof meta> = {
  args: {
    deleteThisDocumentLabel: 'Delete this document',
    forceCloseAllTabsExceptThisOneLabel: 'Force close all except this one',
    forceCloseAllTabsLabel: 'Force close all tabs',
    onDeleteThisDocumentClick: () => {},
    onForceCloseAllTabsClick: () => {},
    onForceCloseAllTabsExceptThisOneClick: () => {},
    showDeleteThisDocument: true
  },
  render: (args) => renderDestructiveRows(args)
}

export const WithoutDelete: StoryObj<typeof meta> = {
  args: {
    deleteThisDocumentLabel: 'Delete this document',
    forceCloseAllTabsExceptThisOneLabel: 'Force close all except this one',
    forceCloseAllTabsLabel: 'Force close all tabs',
    onDeleteThisDocumentClick: () => {},
    onForceCloseAllTabsClick: () => {},
    onForceCloseAllTabsExceptThisOneClick: () => {},
    showDeleteThisDocument: false
  },
  render: (args) => renderDestructiveRows(args)
}
