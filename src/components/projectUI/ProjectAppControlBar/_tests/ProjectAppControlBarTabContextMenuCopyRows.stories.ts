import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ProjectAppControlBarTabContextMenuCopyRows from '../ProjectAppControlBarTabContextMenuCopyRows.vue'

const meta = {
  component: ProjectAppControlBarTabContextMenuCopyRows,
  parameters: {
    docs: {
      story: {
        inline: false
      }
    }
  },
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/projectUI/ProjectAppControlBarTabContextMenuCopyRows'
} satisfies Meta<typeof ProjectAppControlBarTabContextMenuCopyRows>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    copyBackgroundColorLabel: 'Copy background color',
    copyNameLabel: 'Copy name',
    copyTextColorLabel: 'Copy text color',
    onCopyBackgroundColorClick: () => {},
    onCopyNameClick: () => {},
    onCopyTextColorClick: () => {}
  },
  render: (args) => ({
    components: {
      ProjectAppControlBarTabContextMenuCopyRows
    },
    setup () {
      return {
        args
      }
    },
    template: `
      <q-list dark style="max-width: 280px; background: #1d1d1d;">
        <ProjectAppControlBarTabContextMenuCopyRows v-bind="args" />
      </q-list>
    `
  })
}
