import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { expect, test, vi } from 'vitest'

import {
  projectDocumentControlBarTabContextMenuSampleTab
} from './projectDocumentControlBarTabContextMenuListVitestMount'

import {
  resolveProjectDocumentControlBarTabAppearanceChrome,
  resolveProjectDocumentControlBarTabInlineStyle
} from '../scripts/projectDocumentControlBarTabAppearanceChromeWiring'
import ProjectDocumentControlBarTabContextMenu from '../ProjectDocumentControlBarTabContextMenu.vue'

const sampleTab = projectDocumentControlBarTabContextMenuSampleTab

const tabContextMenuI18n = createI18n({
  legacy: false,
  locale: 'en-US',
  messages: {
    'en-US': {
      projectUI: {
        projectDocumentControlBar: {
          browseOpenedTabs: 'Browse opened tabs',
          closeAllTabsWithoutChanges: 'Close all tabs without changes',
          closeAllTabsWithoutChangesExceptThisOne: 'Close all except this one',
          closeThisTab: 'Close this tab',
          copyBackgroundColor: 'Copy background color',
          copyName: 'Copy name',
          copyTextColor: 'Copy text color',
          deleteThisDocument: 'Delete this document',
          forceCloseAllTabs: 'Force close all tabs',
          forceCloseAllTabsExceptThisOne: 'Force close all except this one',
          moveTabLeft: 'Move tab left',
          moveTabRight: 'Move tab right'
        }
      }
    }
  }
})

function mountTabContextMenu (
  propOverrides: Partial<{
    activeDocumentTabName: string | undefined
    moveDocumentTabLeftKeybindLabel: string | null
    moveDocumentTabRightKeybindLabel: string | null
    openedDocumentTabs: typeof sampleTab[]
  }> = {}
) {
  return mount(ProjectDocumentControlBarTabContextMenu, {
    props: {
      activeDocumentTabName: 'doc-1',
      moveDocumentTabLeftKeybindLabel: 'Ctrl+Left',
      moveDocumentTabRightKeybindLabel: 'Ctrl+Right',
      onTabCloseAllWithoutChangesClick: vi.fn(),
      onTabCloseAllWithoutChangesExceptClick: vi.fn(),
      onTabCloseClick: vi.fn(),
      onTabCopyBackgroundColorClick: vi.fn(async () => undefined),
      onTabCopyNameClick: vi.fn(async () => undefined),
      onTabCopyTextColorClick: vi.fn(async () => undefined),
      onTabDeleteClick: vi.fn(),
      onTabForceCloseAllClick: vi.fn(),
      onTabForceCloseAllExceptClick: vi.fn(),
      onTabMoveClick: vi.fn(),
      openedDocumentTabs: [sampleTab],
      resolveDocumentTabAppearanceChrome: resolveProjectDocumentControlBarTabAppearanceChrome,
      resolveDocumentTabInlineStyle: resolveProjectDocumentControlBarTabInlineStyle,
      resolveDocumentTabLabel: () => 'Hero',
      resolveDocumentTabRoute: (documentId: string) => `/home/document/${documentId}`,
      resolveTabWorldIndicatorColor: () => null,
      showWorldTabIndicators: false,
      tab: sampleTab,
      ...propOverrides
    },
    global: {
      plugins: [tabContextMenuI18n],
      stubs: {
        QIcon: { template: '<span class="q-icon-stub" />' },
        QItem: {
          emits: ['click', 'mouseenter', 'mouseleave'],
          template: '<div class="q-item-stub" @click="$emit(\'click\', $event)" @mouseenter="$emit(\'mouseenter\', $event)" @mouseleave="$emit(\'mouseleave\', $event)"><slot /></div>'
        },
        QItemSection: { template: '<div class="q-item-section-stub"><slot /></div>' },
        QList: { template: '<div class="q-list-stub"><slot /></div>' },
        QMenu: {
          emits: ['hide', 'update:modelValue'],
          props: ['modelValue'],
          template: '<div data-test-locator="projectDocumentControlBar-tabContextMenu" :data-open="modelValue" @click="$emit(\'update:modelValue\', false)" @hide="$emit(\'hide\')"><slot /></div>'
        },
        QSeparator: { template: '<hr class="q-separator-stub" />' }
      }
    }
  })
}

test('Test that ProjectDocumentControlBarTabContextMenu mounts list chrome with real manager wiring', async () => {
  const wrapper = mountTabContextMenu()

  expect(wrapper.find('[data-test-locator="projectDocumentControlBar-tabContextMenu"]').exists()).toBe(true)
  expect(wrapper.find('.projectDocumentControlBarTabs__tabContextMenuMount').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectDocumentControlBar-tabContextMenu-copyName"]').exists()).toBe(true)

  await wrapper.get('[data-test-locator="projectDocumentControlBar-tabContextMenu-copyName"]').trigger('click')

  wrapper.unmount()
})

test('Test that ProjectDocumentControlBarTabContextMenu recomputes keybind labels when props change', async () => {
  const wrapper = mountTabContextMenu({
    moveDocumentTabLeftKeybindLabel: null,
    moveDocumentTabRightKeybindLabel: null
  })

  await wrapper.setProps({
    activeDocumentTabName: 'doc-2',
    moveDocumentTabLeftKeybindLabel: 'Alt+Left',
    moveDocumentTabRightKeybindLabel: 'Alt+Right',
    openedDocumentTabs: [
      sampleTab,
      {
        ...sampleTab,
        displayNameDraft: 'Villain',
        documentId: 'doc-2',
        savedDisplayName: 'Villain'
      }
    ]
  })

  expect(wrapper.find('[data-test-locator="projectDocumentControlBar-tabContextMenu-moveTabLeft-keybind"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectDocumentControlBar-tabContextMenu-moveTabRight-keybind"]').exists()).toBe(true)

  wrapper.unmount()
})

test('Test that ProjectDocumentControlBarTabContextMenu forwards root menu hide to session wiring', async () => {
  const wrapper = mountTabContextMenu()

  await wrapper.get('[data-test-locator="projectDocumentControlBar-tabContextMenu"]').trigger('hide')
  await wrapper.get('[data-test-locator="projectDocumentControlBar-tabContextMenu"]').trigger('click')

  wrapper.unmount()
})
