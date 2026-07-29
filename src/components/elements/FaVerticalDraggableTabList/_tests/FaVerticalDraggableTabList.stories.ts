import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

import FaVerticalDraggableTabList from '../FaVerticalDraggableTabList.vue'

const meta = {
  component: FaVerticalDraggableTabList,
  parameters: {
    docs: {
      description: {
        component:
          'Reusable vertical tab strip with filter, vue-draggable-plus reorder, pointer-hover, and add button.'
      }
    }
  },
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/elements/FaVerticalDraggableTabList'
} satisfies Meta<typeof FaVerticalDraggableTabList>

export default meta

type T_storyTabItem = {
  id: string
  label: string
}

const storyItems: T_storyTabItem[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    label: 'Falala'
  },
  {
    id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    label: 'Gungala'
  },
  {
    id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    label: 'Eldoria'
  }
]

function cloneStoryList (list: T_storyTabItem[]): T_storyTabItem[] {
  return list.map((item) => ({ ...item }))
}

function filterStoryItems (list: T_storyTabItem[], query: string): T_storyTabItem[] {
  const normalized = query.trim().toLowerCase()
  if (normalized.length === 0) {
    return list
  }
  return list.filter((item) => item.label.toLowerCase().includes(normalized))
}

export const Default: StoryObj<typeof meta> = {
  render: () => ({
    components: {
      FaVerticalDraggableTabList
    },
    setup () {
      const items = ref(cloneStoryList(storyItems))
      const selectedId = ref(storyItems[0]?.id ?? '')
      return {
        cloneStoryList,
        filterStoryItems,
        items,
        selectedId
      }
    },
    template: `
      <div class="q-pa-md bg-dark" style="height: 360px; width: 220px;">
        <FaVerticalDraggableTabList
          add-button-label-key="dialogs.projectSettings.panels.worlds.addWorldButton"
          block-class-suffix="dialogProjectSettingsWorldsTabList"
          :clone-list="cloneStoryList"
          current-language-code="en-US"
          drag-id-data-attribute="data-test-world-id"
          empty-filtered-key="dialogs.projectSettings.panels.worlds.emptyFilteredWorlds"
          filter-aria-label-key="dialogs.projectSettings.panels.worlds.filterAriaLabel"
          filter-clear-aria-label-key="dialogs.projectSettings.panels.worlds.filterClearAriaLabel"
          :filter-items="filterStoryItems"
          filter-placeholder-key="dialogs.projectSettings.panels.worlds.filterPlaceholder"
          :items="items"
          test-locator-add-button="faVerticalDraggableTabList-story-add"
          test-locator-filter-clear="faVerticalDraggableTabList-story-filterClear"
          test-locator-filter-empty="faVerticalDraggableTabList-story-filterEmpty"
          test-locator-filter-input="faVerticalDraggableTabList-story-filterInput"
          test-locator-list="faVerticalDraggableTabList-story-list"
          @add="items = cloneStoryList([...items, { id: String(Date.now()), label: 'New world' }])"
          @update:items="items = $event"
        >
          <template #tab="{ item, isPointerHovered }">
            <button
              type="button"
              class="faVerticalDraggableTabs__tab full-width text-left q-px-sm q-py-xs"
              :class="{ 'faVerticalDraggableTabs__tab--pointerHover': isPointerHovered }"
              :data-test-world-id="item.id"
              @click="selectedId = item.id"
            >
              {{ item.label }}
            </button>
          </template>
        </FaVerticalDraggableTabList>
      </div>
    `
  })
}
