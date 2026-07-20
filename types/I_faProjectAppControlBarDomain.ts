import type { CSSProperties } from 'vue'

import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { I_faDocumentAppearanceChromeStyle } from 'app/types/I_faDocumentAppearanceChromeStyle'
import type { I_faKeybindsSnapshot, T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeWorkspaceWorld } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { T_projectAppControlBarSaveButtonColor } from 'app/types/T_projectAppControlBarSaveButtonColor'

export interface I_projectAppControlBarComposableApi {
  activeDocumentTab: I_computedRef<I_faOpenedDocumentTab | null>
  activeDocumentTabName: I_computedRef<string | undefined>
  editDocumentKeybindLabel: I_computedRef<string | null>
  moveDocumentTabLeftKeybindLabel: I_computedRef<string | null>
  moveDocumentTabRightKeybindLabel: I_computedRef<string | null>
  onEnterEditModeClick: () => void
  onDeleteCurrentDocumentClick: () => void
  onCopyCurrentDocumentClick: () => void
  onAddNewDocumentUnderCurrentClick: () => void
  onSaveDocumentClick: (keepEditMode: boolean) => void
  onTabAuxClick: (documentId: string, event: MouseEvent) => void
  onTabCloseClick: (documentId: string) => void
  onTabCloseAllWithoutChangesClick: () => void
  onTabCloseAllWithoutChangesExceptClick: (documentId: string) => void
  onTabCopyBackgroundColorClick: (documentId: string) => Promise<void>
  onTabCopyDocumentClick: (documentId: string) => Promise<void>
  onTabCopyNameClick: (documentId: string) => Promise<void>
  onTabCopyTextColorClick: (documentId: string) => Promise<void>
  onTabAddNewDocumentUnderThisClick: (documentId: string) => Promise<void>
  onTabDeleteClick: (documentId: string) => void | Promise<void>
  onTabForceCloseAllClick: () => void
  onTabForceCloseAllExceptClick: (documentId: string) => void
  onTabMoveClick: (documentId: string, direction: 'left' | 'right') => void
  openedDocumentTabs: I_computedRef<readonly I_faOpenedDocumentTab[]>
  resolveDocumentTabRoute: (documentId: string) => string
  resolveDocumentTabLabel: (tab: I_faOpenedDocumentTab) => string
  resolveDocumentTabAppearanceChrome: (tab: I_faOpenedDocumentTab) => I_faDocumentAppearanceChromeStyle | undefined
  resolveDocumentTabDisplayIcon: (tab: I_faOpenedDocumentTab) => string
  resolveDocumentTabInlineStyle: (tab: I_faOpenedDocumentTab) => CSSProperties | undefined
  resolveTabWorldIndicatorColor: (tab: I_faOpenedDocumentTab) => string | null
  saveDocumentButtonColor: I_computedRef<T_projectAppControlBarSaveButtonColor>
  saveDocumentKeepEditModeKeybindLabel: I_computedRef<string | null>
  saveDocumentKeybindLabel: I_computedRef<string | null>
  showAppControlBar: I_computedRef<boolean>
  showDocumentTabs: I_computedRef<boolean>
  showEditDocumentButton: I_computedRef<boolean>
  showWorldTabIndicators: I_computedRef<boolean>
  showDeleteDocumentButton: I_computedRef<boolean>
  showDocumentStructureButtons: I_computedRef<boolean>
  showSaveDocumentButtons: I_computedRef<boolean>
  showGuideButtons: I_computedRef<boolean>
  showFunctionButtons: I_computedRef<boolean>
  showContentButtons: I_computedRef<boolean>
  hideHierarchyTree: I_computedRef<boolean>
  advancedSearchGuideKeybindLabel: I_computedRef<string | null>
  keyboardShortcutsKeybindLabel: I_computedRef<string | null>
  toggleAppNoteboardKeybindLabel: I_computedRef<string | null>
  toggleHierarchyTreeKeybindLabel: I_computedRef<string | null>
  toggleProjectNoteboardKeybindLabel: I_computedRef<string | null>
  onAdvancedSearchGuideClick: () => void
  onKeyboardShortcutsClick: () => void
  onQuickAddClick: () => void
  onQuickSearchClick: () => void
  onTipsTricksTriviaClick: () => void
  onToggleAppNoteboardClick: () => void
  onToggleHierarchyTreeClick: () => void
  onToggleProjectNoteboardClick: () => void
}

export interface I_assembleProjectAppControlBarApiInput {
  activeDocumentId: I_computedRef<string | null>
  computed: <T>(getter: () => T) => I_computedRef<T>
  enterDocumentEditMode: (documentId: string) => void
  formatFaKeybindCommandLabelFromSnapshot: (params: {
    commandId: T_faKeybindCommandId | undefined
    snapshot: I_faKeybindsSnapshot | null
  }) => string | null
  getKeybindsSnapshot: () => I_faKeybindsSnapshot | null
  isAppControlBarDisabled: I_computedRef<boolean>
  isOnDocumentWorkspaceRoute: I_computedRef<boolean>
  isAppControlBarGuidesDisabled: I_computedRef<boolean>
  isAppControlBarFunctionButtonsDisabled: I_computedRef<boolean>
  isAppControlBarContentButtonsDisabled: I_computedRef<boolean>
  hideHierarchyTree: I_computedRef<boolean>
  findTabByDocumentId: (documentId: string) => I_faOpenedDocumentTab | null
  moveDocumentTab: (documentId: string, direction: 'left' | 'right') => void
  requestCloseTab: (documentId: string) => void
  requestDeleteDocument: (documentId: string) => void
  closeAllTabsWithoutChanges: () => void | Promise<void>
  closeTabsWithoutChangesExcept: (exceptDocumentId: string) => void | Promise<void>
  forceCloseAllTabs: () => void | Promise<void>
  forceCloseAllTabsExcept: (exceptDocumentId: string) => void | Promise<void>
  resolveActiveDocumentTabName: (input: {
    activeDocumentId: string | null
    openedTabs: readonly { documentId: string }[]
  }) => string | undefined
  resolveDocumentTabLabelFromOpenedTab: (input: {
    displayNameDraft: string
    tabLabel: string
  }) => string
  resolveShowAppControlBarStrip: (input: {
    disableAppControlBar: boolean
  }) => boolean
  resolveShowDocumentTabs: (openedTabCount: number) => boolean
  resolveShowProjectAppControlBarEditButton: (input: {
    activeDocumentTab: { editState: boolean } | null
    isOnDocumentWorkspaceRoute: boolean
  }) => boolean
  resolveShowProjectAppControlBarSaveButtons: (input: {
    activeDocumentTab: { editState: boolean } | null
    isOnDocumentWorkspaceRoute: boolean
  }) => boolean
  resolveShowProjectAppControlBarDeleteButton: (input: {
    activeDocumentTab: Pick<I_faOpenedDocumentTab, 'persistenceState'> | null
    isOnDocumentWorkspaceRoute: boolean
  }) => boolean
  resolveProjectAppControlBarSaveButtonColor: (input: {
    hasUnsavedChanges: boolean
  }) => T_projectAppControlBarSaveButtonColor
  runFaAction: <Id extends T_faActionId>(id: Id, payload: I_faActionPayloadMap[Id]) => void
  projectWorlds: I_computedRef<readonly I_faProjectHierarchyTreeWorkspaceWorld[]>
  tabs: I_computedRef<readonly I_faOpenedDocumentTab[]>
}

export type T_assembleProjectAppControlBarApiFn = (
  input: I_assembleProjectAppControlBarApiInput
) => I_projectAppControlBarComposableApi

export interface I_projectAppControlBarTabContextMenuInput {
  moveDocumentTabLeftKeybindLabel: I_computedRef<string | null>
  moveDocumentTabRightKeybindLabel: I_computedRef<string | null>
  onTabCloseAllWithoutChangesClick: () => void
  onTabCloseAllWithoutChangesExceptClick: (documentId: string) => void
  onTabCloseClick: (documentId: string) => void
  onTabCopyBackgroundColorClick: (documentId: string) => Promise<void>
  onTabCopyDocumentClick: (documentId: string) => Promise<void>
  onTabCopyNameClick: (documentId: string) => Promise<void>
  onTabCopyTextColorClick: (documentId: string) => Promise<void>
  onTabAddNewDocumentUnderThisClick: (documentId: string) => Promise<void>
  onTabDeleteClick: (documentId: string) => void | Promise<void>
  onTabForceCloseAllClick: () => void
  onTabForceCloseAllExceptClick: (documentId: string) => void
  onTabMoveClick: (documentId: string, direction: 'left' | 'right') => void
  openedDocumentTabs: I_computedRef<readonly I_faOpenedDocumentTab[]>
  resolveDocumentTabLabel: (tab: I_faOpenedDocumentTab) => string
  resolveDocumentTabRoute: (documentId: string) => string
  tab: I_faOpenedDocumentTab
}
