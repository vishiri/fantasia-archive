import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ProjectAppControlBarFixedStripLeft from '../ProjectAppControlBarFixedStripLeft.vue'

const meta = {
  component: ProjectAppControlBarFixedStripLeft,
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/projectUI/ProjectAppControlBarFixedStripLeft'
} satisfies Meta<typeof ProjectAppControlBarFixedStripLeft>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    advancedSearchGuideKeybindLabel: null,
    advancedSearchGuideTooltip: 'Advanced search guide',
    keyboardShortcutsKeybindLabel: null,
    keyboardShortcutsTooltip: 'Keyboard shortcuts',
    onAdvancedSearchGuideClick: () => {},
    onKeyboardShortcutsClick: () => {},
    onQuickAddClick: () => {},
    onQuickSearchClick: () => {},
    onTipsTricksTriviaClick: () => {},
    onToggleAppNoteboardClick: () => {},
    onToggleHierarchyTreeClick: () => {},
    onToggleProjectNoteboardClick: () => {},
    quickAddTooltip: 'Quick add',
    quickSearchTooltip: 'Quick search',
    showAppNoteboardContentDot: true,
    showContentButtons: true,
    showFunctionButtons: true,
    showGuideButtons: true,
    showProjectNoteboardContentDot: false,
    tipsTricksTriviaTooltip: 'Tips',
    toggleAppNoteboardKeybindLabel: null,
    toggleAppNoteboardTooltip: 'Toggle app noteboard',
    toggleHierarchyTreeKeybindLabel: null,
    toggleHierarchyTreeTooltip: 'Toggle hierarchy tree',
    toggleProjectNoteboardKeybindLabel: null,
    toggleProjectNoteboardTooltip: 'Toggle project noteboard'
  },
  render: (args) => ({
    components: {
      ProjectAppControlBarFixedStripLeft
    },
    setup () {
      return {
        args
      }
    },
    template: `
      <div class="bg-dark q-pa-md" style="display: flex;">
        <ProjectAppControlBarFixedStripLeft v-bind="args" />
      </div>
    `
  })
}
