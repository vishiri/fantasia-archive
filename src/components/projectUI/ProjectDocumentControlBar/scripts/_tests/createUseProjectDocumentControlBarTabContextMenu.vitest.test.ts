import { computed, ref } from 'vue'
import { expect, test, vi } from 'vitest'

import type { I_computedRef } from 'app/types/I_vueCompositionShims'

import { createUseProjectDocumentControlBarTabContextMenu } from '../createUseProjectDocumentControlBarTabContextMenu'

test('Test that createUseProjectDocumentControlBarTabContextMenu delegates to session wiring', () => {
  const useTabContextMenu = createUseProjectDocumentControlBarTabContextMenu({
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    createAppControlSingleMenuSubmenuHover: () => ({
      onRootMenuHide: vi.fn(),
      onSubmenuActivatorEnter: vi.fn(),
      onSubmenuActivatorLeave: vi.fn(),
      onSubmenuContentEnter: vi.fn(),
      onSubmenuContentLeave: vi.fn(),
      onSubmenuModelUpdate: vi.fn(),
      openSubmenuRowIndex: ref<number | null>(null)
    }),
    useI18n: () => ({
      t: (key: string) => key
    }) as never
  })

  const session = useTabContextMenu({
    moveDocumentTabLeftKeybindLabel: computed(() => 'Left'),
    moveDocumentTabRightKeybindLabel: computed(() => 'Right'),
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
    openedDocumentTabs: computed(() => []),
    resolveDocumentTabLabel: () => 'Hero',
    resolveDocumentTabRoute: (documentId: string) => `/home/document/${documentId}`,
    tab: {
      displayNameDraft: 'Hero',
      documentId: 'doc-a',
      persistenceState: 'persisted',
      editState: false,
      hasUnsavedChanges: false,
      savedDisplayName: 'Hero',
      documentTextColorDraft: '',
      savedDocumentTextColor: '',
      documentBackgroundColorDraft: '',
      savedDocumentBackgroundColor: '',
      tabLabel: 'Character',
      templateIcon: 'mdi-account'
    }
  })

  expect(session.closeThisTabLabel.value).toBe('projectUI.projectDocumentControlBar.closeThisTab')
})
