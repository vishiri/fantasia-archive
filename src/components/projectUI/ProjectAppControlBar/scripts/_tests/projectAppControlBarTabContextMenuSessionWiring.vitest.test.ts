import { computed, ref } from 'vue'
import { expect, test, vi } from 'vitest'

import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import { buildProjectAppControlBarTabContextMenuSession } from '../projectAppControlBarTabContextMenuSessionWiring'

const sampleTab: I_faOpenedDocumentTab = {
  displayNameDraft: 'Hero',
  documentId: 'doc-hero',
  persistenceState: 'persisted',
  editState: false,
  hasUnsavedChanges: false,
  savedDisplayName: 'Hero',
  documentTextColorDraft: '',
  savedDocumentTextColor: '',
  documentBackgroundColorDraft: '',
  savedDocumentBackgroundColor: '',
  isCategoryDraft: false,
  savedIsCategory: false,
  isFinishedDraft: false,
  isMinorDraft: false,
  isDeadDraft: false,
  savedIsFinished: false,
  savedIsMinor: false,
  savedIsDead: false,
  parentDocumentIdDraft: '',
  savedParentDocumentId: '',
  treeOrderNumberDraft: '',
  savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
  tabLabel: 'Character',
  templateIcon: 'mdi-account'
}

test('Test that buildProjectAppControlBarTabContextMenuSession wires labels, handlers, and browse submenu state', () => {
  const openSubmenuRowIndex = ref<number | null>(null)
  const onSubmenuActivatorEnter = vi.fn((index: number) => {
    openSubmenuRowIndex.value = index
  })
  const onSubmenuModelUpdate = vi.fn((index: number, shown: boolean) => {
    openSubmenuRowIndex.value = shown ? index : null
  })

  const session = buildProjectAppControlBarTabContextMenuSession({
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
    onTabCopyBackgroundColorClick: vi.fn(async () => undefined),
    onTabCopyDocumentClick: vi.fn(async () => undefined),
    onTabCopyNameClick: vi.fn(async () => undefined),
    onTabCopyTextColorClick: vi.fn(async () => undefined),
    onTabAddNewDocumentUnderThisClick: vi.fn(async () => undefined),
    onTabDeleteClick: vi.fn(),
    onTabForceCloseAllClick: vi.fn(),
    onTabForceCloseAllExceptClick: vi.fn(),
    onTabMoveClick: vi.fn(),
    openedDocumentTabs: computed(() => [sampleTab]),
    resolveDocumentTabLabel: () => 'Hero',
    resolveDocumentTabRoute: (documentId: string) => `/home/document/${documentId}`,
    tab: sampleTab
  })

  expect(session.browseOpenedTabsLabel.value).toBe('projectUI.projectAppControlBar.browseOpenedTabs')
  expect(session.closeAllTabsWithoutChangesLabel.value).toBe('projectUI.projectAppControlBar.closeAllTabsWithoutChanges')
  expect(session.closeAllTabsWithoutChangesExceptThisOneLabel.value).toBe('projectUI.projectAppControlBar.closeAllTabsWithoutChangesExceptThisOne')
  expect(session.closeThisTabLabel.value).toBe('projectUI.projectAppControlBar.closeThisTab')
  expect(session.copyBackgroundColorLabel.value).toBe('projectUI.projectAppControlBar.copyBackgroundColor')
  expect(session.copyDocumentLabel.value).toBe('projectUI.projectHierarchyTree.contextMenu.copyDocument')
  expect(session.copyNameLabel.value).toBe('projectUI.projectAppControlBar.copyName')
  expect(session.copyTextColorLabel.value).toBe('projectUI.projectAppControlBar.copyTextColor')
  expect(session.addNewDocumentUnderThisLabel.value).toBe('projectUI.projectHierarchyTree.contextMenu.addNewDocumentUnderThis')
  expect(session.deleteThisDocumentLabel.value).toBe('projectUI.projectAppControlBar.deleteThisDocument')
  expect(session.forceCloseAllTabsLabel.value).toBe('projectUI.projectAppControlBar.forceCloseAllTabs')
  expect(session.forceCloseAllTabsExceptThisOneLabel.value).toBe('projectUI.projectAppControlBar.forceCloseAllTabsExceptThisOne')
  expect(session.moveTabLeftLabel.value).toBe('projectUI.projectAppControlBar.moveTabLeft')
  expect(session.moveTabRightLabel.value).toBe('projectUI.projectAppControlBar.moveTabRight')
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

test('Test that buildProjectAppControlBarTabContextMenuSession hides delete for temporary tabs', () => {
  const temporaryTab: I_faOpenedDocumentTab = {
    ...sampleTab,
    documentId: 'doc-temp',
    persistenceState: 'temporary'
  }

  const session = buildProjectAppControlBarTabContextMenuSession({
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
    onTabCopyBackgroundColorClick: vi.fn(async () => undefined),
    onTabCopyDocumentClick: vi.fn(async () => undefined),
    onTabCopyNameClick: vi.fn(async () => undefined),
    onTabCopyTextColorClick: vi.fn(async () => undefined),
    onTabAddNewDocumentUnderThisClick: vi.fn(async () => undefined),
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
