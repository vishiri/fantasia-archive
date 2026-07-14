import type { CSSProperties } from 'vue'
import { mount } from '@vue/test-utils'
import { vi } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import { FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE } from 'app/types/I_faOpenedDocumentsDomain'

import {
  resolveProjectDocumentControlBarTabAppearanceChrome,
  resolveProjectDocumentControlBarTabInlineStyle
} from '../scripts/projectDocumentControlBarTabAppearanceChromeWiring'
import ProjectDocumentControlBarTabContextMenuList from '../ProjectDocumentControlBarTabContextMenuList.vue'

export const projectDocumentControlBarTabContextMenuSampleTab: I_faOpenedDocumentTab = {
  displayNameDraft: 'Hero',
  documentId: 'doc-1',
  editState: FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE,
  hasUnsavedChanges: true,
  persistenceState: 'persisted',
  savedDisplayName: 'Hero',
  documentTextColorDraft: '',
  savedDocumentTextColor: '',
  documentBackgroundColorDraft: '',
  savedDocumentBackgroundColor: '',
  tabLabel: 'Character',
  templateIcon: 'mdi-account'
}

export const projectDocumentControlBarTabContextMenuSecondTab: I_faOpenedDocumentTab = {
  displayNameDraft: 'Villain',
  documentId: 'doc-2',
  editState: FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE,
  hasUnsavedChanges: false,
  persistenceState: 'persisted',
  savedDisplayName: 'Villain',
  documentTextColorDraft: '',
  savedDocumentTextColor: '',
  documentBackgroundColorDraft: '',
  savedDocumentBackgroundColor: '',
  tabLabel: 'Character',
  templateIcon: 'mdi-account-outline'
}

export function createProjectDocumentControlBarTabContextMenuListHandlers () {
  return {
    onBrowseSubmenuActivatorEnter: vi.fn(),
    onBrowseSubmenuModelUpdate: vi.fn(),
    onCloseAllTabsWithoutChangesClick: vi.fn(),
    onCloseAllTabsWithoutChangesExceptThisOneClick: vi.fn(),
    onCloseThisTabClick: vi.fn(),
    onCopyBackgroundColorClick: vi.fn(),
    onCopyNameClick: vi.fn(),
    onCopyTextColorClick: vi.fn(),
    onDeleteThisDocumentClick: vi.fn(),
    onForceCloseAllTabsClick: vi.fn(),
    onForceCloseAllTabsExceptThisOneClick: vi.fn(),
    onMoveTabLeftClick: vi.fn(),
    onMoveTabRightClick: vi.fn(),
    onSubmenuActivatorLeave: vi.fn(),
    onSubmenuContentEnter: vi.fn(),
    onSubmenuContentLeave: vi.fn()
  }
}

export function mountProjectDocumentControlBarTabContextMenuList (
  input: {
    handlers?: ReturnType<typeof createProjectDocumentControlBarTabContextMenuListHandlers>
    isBrowseSubmenuOpen?: boolean
    openedDocumentTabs?: readonly I_faOpenedDocumentTab[]
    resolveDocumentTabAppearanceChrome?: (tab: I_faOpenedDocumentTab) => ReturnType<typeof resolveProjectDocumentControlBarTabAppearanceChrome>
    resolveDocumentTabInlineStyle?: (tab: I_faOpenedDocumentTab) => CSSProperties | undefined
    resolveTabWorldIndicatorColor?: (tab: I_faOpenedDocumentTab) => string | null
    showDeleteThisDocument?: boolean
    showWorldTabIndicators?: boolean
  } = {}
) {
  const handlers = input.handlers ?? createProjectDocumentControlBarTabContextMenuListHandlers()
  const resolveDocumentTabAppearanceChrome = input.resolveDocumentTabAppearanceChrome ?? resolveProjectDocumentControlBarTabAppearanceChrome
  const resolveDocumentTabInlineStyle = input.resolveDocumentTabInlineStyle ?? resolveProjectDocumentControlBarTabInlineStyle
  const resolveTabWorldIndicatorColor = input.resolveTabWorldIndicatorColor ?? (() => null)

  return mount(ProjectDocumentControlBarTabContextMenuList, {
    props: {
      activeDocumentTabName: 'doc-1',
      browseOpenedTabsLabel: 'Browse opened tabs',
      closeAllTabsWithoutChangesExceptThisOneLabel: 'Close all except this one',
      closeAllTabsWithoutChangesLabel: 'Close all without changes',
      closeThisTabLabel: 'Close this tab',
      copyBackgroundColorLabel: 'Copy background color',
      copyNameLabel: 'Copy name',
      copyTextColorLabel: 'Copy text color',
      deleteThisDocumentLabel: 'Delete this document',
      forceCloseAllTabsExceptThisOneLabel: 'Force close all except this one',
      forceCloseAllTabsLabel: 'Force close all tabs',
      isBrowseSubmenuOpen: input.isBrowseSubmenuOpen ?? true,
      moveDocumentTabLeftKeybindLabel: 'Ctrl+Left',
      moveDocumentTabRightKeybindLabel: 'Ctrl+Right',
      moveTabLeftLabel: 'Move tab left',
      moveTabRightLabel: 'Move tab right',
      openedDocumentTabs: input.openedDocumentTabs ?? [
        projectDocumentControlBarTabContextMenuSampleTab,
        projectDocumentControlBarTabContextMenuSecondTab
      ],
      resolveBrowseTabLabel: (tab: I_faOpenedDocumentTab) => tab.displayNameDraft,
      resolveBrowseTabRoute: (documentId: string) => `/home/document/${documentId}`,
      resolveDocumentTabAppearanceChrome,
      resolveDocumentTabInlineStyle,
      resolveTabWorldIndicatorColor,
      showDeleteThisDocument: input.showDeleteThisDocument ?? true,
      showWorldTabIndicators: input.showWorldTabIndicators ?? false,
      ...handlers
    },
    global: {
      stubs: {
        QIcon: { template: '<span class="q-icon-stub" />' },
        QItem: {
          emits: ['click', 'mouseenter', 'mouseleave'],
          inheritAttrs: false,
          template: '<div class="q-item-stub" v-bind="$attrs" @click="$emit(\'click\', $event)" @mouseenter="$emit(\'mouseenter\', $event)" @mouseleave="$emit(\'mouseleave\', $event)"><slot /></div>'
        },
        QItemSection: { template: '<div class="q-item-section-stub"><slot /></div>' },
        QList: { template: '<div class="q-list-stub"><slot /></div>' },
        QMenu: {
          emits: ['update:modelValue', 'mouseenter', 'mouseleave'],
          props: ['modelValue'],
          template: `
            <div
              class="q-menu-stub"
              v-if="modelValue"
              @mouseenter="$emit('mouseenter', $event)"
              @mouseleave="$emit('mouseleave', $event)"
            >
              <slot />
            </div>
          `
        },
        QSeparator: { template: '<hr class="q-separator-stub" />' }
      }
    }
  })
}
