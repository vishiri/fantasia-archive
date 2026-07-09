import { computed, ref } from 'vue'
import { expect, test, vi } from 'vitest'

import type { I_computedRef } from 'app/types/I_vueCompositionShims'

import { buildProjectDocumentControlBarTabContextMenuSession } from '../projectDocumentControlBarTabContextMenuSessionWiring'

const sampleTab = {
  displayNameDraft: 'Hero',
  documentId: 'doc-hero',
  editState: false,
  hasUnsavedChanges: false,
  savedDisplayName: 'Hero',
  tabLabel: 'Character',
  templateIcon: 'mdi-account'
}

test('Test that buildProjectDocumentControlBarTabContextMenuSession wires labels, handlers, and browse submenu state', () => {
  const openSubmenuRowIndex = ref<number | null>(null)
  const onSubmenuActivatorEnter = vi.fn((index: number) => {
    openSubmenuRowIndex.value = index
  })
  const onSubmenuModelUpdate = vi.fn((index: number, shown: boolean) => {
    openSubmenuRowIndex.value = shown ? index : null
  })

  const session = buildProjectDocumentControlBarTabContextMenuSession({
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    createAppControlSingleMenuSubmenuHover: () => ({
      onRootMenuHide: vi.fn(),
      onSubmenuActivatorEnter,
      onSubmenuActivatorLeave: vi.fn(),
      onSubmenuContentEnter: vi.fn(),
      onSubmenuContentLeave: vi.fn(),
      onSubmenuModelUpdate,
      openSubmenuRowIndex
    }),
    useI18n: () => ({
      t: (key: string) => key
    }) as never
  }, {
    moveDocumentTabLeftKeybindLabel: computed(() => 'Alt+Shift+Left'),
    moveDocumentTabRightKeybindLabel: computed(() => 'Alt+Shift+Right'),
    onTabCloseAllWithoutChangesClick: vi.fn(),
    onTabCloseAllWithoutChangesExceptClick: vi.fn(),
    onTabCloseClick: vi.fn(),
    onTabCopyNameClick: vi.fn(async () => undefined),
    onTabDeleteClick: vi.fn(),
    onTabForceCloseAllClick: vi.fn(),
    onTabForceCloseAllExceptClick: vi.fn(),
    onTabMoveClick: vi.fn(),
    openedDocumentTabs: computed(() => [sampleTab]),
    resolveDocumentTabLabel: () => 'Hero',
    resolveDocumentTabRoute: (documentId: string) => `/home/document/${documentId}`,
    tab: sampleTab
  })

  expect(session.browseOpenedTabsLabel.value).toBe('projectUI.projectDocumentControlBar.browseOpenedTabs')
  expect(session.openedDocumentTabs.value).toEqual([sampleTab])
  expect(session.moveDocumentTabLeftKeybindLabel.value).toBe('Alt+Shift+Left')
  expect(session.isBrowseSubmenuOpen.value).toBe(false)

  session.onBrowseSubmenuActivatorEnter()
  expect(session.isBrowseSubmenuOpen.value).toBe(true)

  session.onBrowseSubmenuModelUpdate(false)
  expect(session.isBrowseSubmenuOpen.value).toBe(false)
  expect(onSubmenuModelUpdate).toHaveBeenCalledWith(0, false)

  expect(session.resolveBrowseTabLabel(sampleTab)).toBe('Hero')
  expect(session.resolveBrowseTabRoute('doc-hero')).toBe('/home/document/doc-hero')
})
