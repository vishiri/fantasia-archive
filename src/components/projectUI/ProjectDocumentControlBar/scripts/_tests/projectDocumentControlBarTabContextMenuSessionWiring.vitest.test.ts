import { computed, ref } from 'vue'
import { expect, test, vi } from 'vitest'

import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import { buildProjectDocumentControlBarTabContextMenuSession } from '../projectDocumentControlBarTabContextMenuSessionWiring'

const sampleTab: I_faOpenedDocumentTab = {
  displayNameDraft: 'Hero',
  documentId: 'doc-hero',
  persistenceState: 'persisted',
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
  expect(session.closeAllTabsWithoutChangesLabel.value).toBe('projectUI.projectDocumentControlBar.closeAllTabsWithoutChanges')
  expect(session.closeAllTabsWithoutChangesExceptThisOneLabel.value).toBe('projectUI.projectDocumentControlBar.closeAllTabsWithoutChangesExceptThisOne')
  expect(session.closeThisTabLabel.value).toBe('projectUI.projectDocumentControlBar.closeThisTab')
  expect(session.copyNameLabel.value).toBe('projectUI.projectDocumentControlBar.copyName')
  expect(session.deleteThisDocumentLabel.value).toBe('projectUI.projectDocumentControlBar.deleteThisDocument')
  expect(session.forceCloseAllTabsLabel.value).toBe('projectUI.projectDocumentControlBar.forceCloseAllTabs')
  expect(session.forceCloseAllTabsExceptThisOneLabel.value).toBe('projectUI.projectDocumentControlBar.forceCloseAllTabsExceptThisOne')
  expect(session.moveTabLeftLabel.value).toBe('projectUI.projectDocumentControlBar.moveTabLeft')
  expect(session.moveTabRightLabel.value).toBe('projectUI.projectDocumentControlBar.moveTabRight')
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
  expect(session.showDeleteThisDocument).toBe(true)
})

test('Test that buildProjectDocumentControlBarTabContextMenuSession hides delete for temporary tabs', () => {
  const temporaryTab: I_faOpenedDocumentTab = {
    ...sampleTab,
    documentId: 'doc-temp',
    persistenceState: 'temporary'
  }

  const session = buildProjectDocumentControlBarTabContextMenuSession({
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
  }, {
    moveDocumentTabLeftKeybindLabel: computed(() => null),
    moveDocumentTabRightKeybindLabel: computed(() => null),
    onTabCloseAllWithoutChangesClick: vi.fn(),
    onTabCloseAllWithoutChangesExceptClick: vi.fn(),
    onTabCloseClick: vi.fn(),
    onTabCopyNameClick: vi.fn(async () => undefined),
    onTabDeleteClick: vi.fn(),
    onTabForceCloseAllClick: vi.fn(),
    onTabForceCloseAllExceptClick: vi.fn(),
    onTabMoveClick: vi.fn(),
    openedDocumentTabs: computed(() => [temporaryTab]),
    resolveDocumentTabLabel: () => 'Temp',
    resolveDocumentTabRoute: (documentId: string) => `/home/document/${documentId}`,
    tab: temporaryTab
  })

  expect(session.showDeleteThisDocument).toBe(false)
})
