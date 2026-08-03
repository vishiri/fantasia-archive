import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ProjectAppControlBarTabContextMenuDocumentRows from '../ProjectAppControlBarTabContextMenuDocumentRows.vue'

const meta = {
  component: ProjectAppControlBarTabContextMenuDocumentRows,
  parameters: {
    docs: {
      story: {
        inline: false
      }
    }
  },
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/projectUI/ProjectAppControlBarTabContextMenuDocumentRows'
} satisfies Meta<typeof ProjectAppControlBarTabContextMenuDocumentRows>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    addNewDocumentUnderThisLabel: 'Add new document under this',
    copyDocumentLabel: 'Copy document',
    onAddNewDocumentUnderThisClick: () => {},
    onCopyDocumentClick: () => {}
  },
  render: (args) => ({
    components: {
      ProjectAppControlBarTabContextMenuDocumentRows
    },
    setup () {
      return {
        args
      }
    },
    template: `
      <q-list dark style="max-width: 280px; background: #1d1d1d;">
        <ProjectAppControlBarTabContextMenuDocumentRows v-bind="args" />
      </q-list>
    `
  })
}
