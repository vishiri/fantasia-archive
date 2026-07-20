import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { expect, test, vi } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import {
  projectAppControlBarTabContextMenuSampleTab
} from './projectAppControlBarTabContextMenuListVitestMount'

import {
  resolveProjectAppControlBarTabAppearanceChrome,
  resolveProjectAppControlBarTabInlineStyle
} from '../scripts/projectAppControlBarTabAppearanceChromeWiring'
import ProjectAppControlBarTabContextMenu from '../ProjectAppControlBarTabContextMenu.vue'

const sampleTab = projectAppControlBarTabContextMenuSampleTab

const tabContextMenuI18n = createI18n({
  legacy: false,
  locale: 'en-US',
  messages: {
    'en-US': {
      projectUI: {
        projectAppControlBar: {
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
  return mount(ProjectAppControlBarTabContextMenu, {
    props: {
      activeDocumentTabName: 'doc-1',
      moveDocumentTabLeftKeybindLabel: 'Ctrl+Left',
      moveDocumentTabRightKeybindLabel: 'Ctrl+Right',
      onTabCloseAllWithoutChangesClick: vi.fn(),
      onTabCloseAllWithoutChangesExceptClick: vi.fn(),
      onTabCloseClick: vi.fn(),
      onTabCopyBackgroundColorClick: vi.fn(async () => undefined),
      onTabCopyDocumentClick: vi.fn(async () => undefined),
      onTabCopyNameClick: vi.fn(async () => undefined),
      onTabCopyTextColorClick: vi.fn(async () => undefined),
      onTabAddNewDocumentUnderThisClick: vi.fn(async () => undefined),
      onTabDeleteClick: vi.fn(),
      onTabForceCloseAllClick: vi.fn(),
      onTabForceCloseAllExceptClick: vi.fn(),
      onTabMoveClick: vi.fn(),
      openedDocumentTabs: [sampleTab],
      resolveDocumentTabAppearanceChrome: resolveProjectAppControlBarTabAppearanceChrome,
      resolveDocumentTabDisplayIcon: (tab: I_faOpenedDocumentTab) => {
        return tab.isCategoryDraft === true ? 'mdi-folder-open' : tab.templateIcon
      },
      resolveDocumentTabInlineStyle: resolveProjectAppControlBarTabInlineStyle,
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
          template: '<div data-test-locator="projectAppControlBar-tabContextMenu" :data-open="modelValue" @click="$emit(\'update:modelValue\', false)" @hide="$emit(\'hide\')"><slot /></div>'
        },
        QSeparator: { template: '<hr class="q-separator-stub" />' }
      }
    }
  })
}

test('Test that ProjectAppControlBarTabContextMenu mounts list chrome with real manager wiring', async () => {
  const wrapper = mountTabContextMenu()

  expect(wrapper.find('[data-test-locator="projectAppControlBar-tabContextMenu"]').exists()).toBe(true)
  expect(wrapper.find('.projectAppControlBarTabs__tabContextMenuMount').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectAppControlBar-tabContextMenu-copyName"]').exists()).toBe(true)

  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-copyName"]').trigger('click')

  wrapper.unmount()
})

test('Test that ProjectAppControlBarTabContextMenu recomputes keybind labels when props change', async () => {
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

  expect(wrapper.find('[data-test-locator="projectAppControlBar-tabContextMenu-moveTabLeft-keybind"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectAppControlBar-tabContextMenu-moveTabRight-keybind"]').exists()).toBe(true)

  wrapper.unmount()
})

test('Test that ProjectAppControlBarTabContextMenu forwards root menu hide to session wiring', async () => {
  const wrapper = mountTabContextMenu()

  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu"]').trigger('hide')
  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu"]').trigger('click')

  wrapper.unmount()
})
