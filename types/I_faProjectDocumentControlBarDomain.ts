import type { CSSProperties } from 'vue'

import type { I_faDocumentAppearanceChromeStyle } from 'app/types/I_faDocumentAppearanceChromeStyle'
import type { I_faKeybindsSnapshot, T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeWorkspaceWorld } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { T_projectDocumentControlBarSaveButtonColor } from 'app/types/T_projectDocumentControlBarSaveButtonColor'

export interface I_projectDocumentControlBarComposableApi {
  activeDocumentTab: I_computedRef<I_faOpenedDocumentTab | null>
  activeDocumentTabName: I_computedRef<string | undefined>
  editDocumentKeybindLabel: I_computedRef<string | null>
  moveDocumentTabLeftKeybindLabel: I_computedRef<string | null>
  moveDocumentTabRightKeybindLabel: I_computedRef<string | null>
  onEnterEditModeClick: () => void
  onDeleteCurrentDocumentClick: () => void
  onSaveDocumentClick: (keepEditMode: boolean) => void
  onTabAuxClick: (documentId: string, event: MouseEvent) => void
  onTabCloseClick: (documentId: string) => void
  onTabCloseAllWithoutChangesClick: () => void
  onTabCloseAllWithoutChangesExceptClick: (documentId: string) => void
  onTabCopyNameClick: (documentId: string) => Promise<void>
  onTabDeleteClick: (documentId: string) => void | Promise<void>
  onTabForceCloseAllClick: () => void
  onTabForceCloseAllExceptClick: (documentId: string) => void
  onTabMoveClick: (documentId: string, direction: 'left' | 'right') => void
  openedDocumentTabs: I_computedRef<readonly I_faOpenedDocumentTab[]>
  resolveDocumentTabRoute: (documentId: string) => string
  resolveDocumentTabLabel: (tab: I_faOpenedDocumentTab) => string
  resolveDocumentTabAppearanceChrome: (tab: I_faOpenedDocumentTab) => I_faDocumentAppearanceChromeStyle | undefined
  resolveDocumentTabInlineStyle: (tab: I_faOpenedDocumentTab) => CSSProperties | undefined
  resolveTabWorldIndicatorColor: (tab: I_faOpenedDocumentTab) => string | null
  saveDocumentButtonColor: I_computedRef<T_projectDocumentControlBarSaveButtonColor>
  saveDocumentKeepEditModeKeybindLabel: I_computedRef<string | null>
  saveDocumentKeybindLabel: I_computedRef<string | null>
  showDocumentControlBar: I_computedRef<boolean>
  showDocumentTabs: I_computedRef<boolean>
  showEditDocumentButton: I_computedRef<boolean>
  showWorldTabIndicators: I_computedRef<boolean>
  showDeleteDocumentButton: I_computedRef<boolean>
  showSaveDocumentButtons: I_computedRef<boolean>
}

export interface I_assembleProjectDocumentControlBarApiInput {
  activeDocumentId: I_computedRef<string | null>
  computed: <T>(getter: () => T) => I_computedRef<T>
  enterDocumentEditMode: (documentId: string) => void
  formatFaKeybindCommandLabelFromSnapshot: (params: {
    commandId: T_faKeybindCommandId | undefined
    snapshot: I_faKeybindsSnapshot | null
  }) => string | null
  getKeybindsSnapshot: () => I_faKeybindsSnapshot | null
  isDocumentControlBarDisabled: I_computedRef<boolean>
  isOnDocumentWorkspaceRoute: I_computedRef<boolean>
  copyToClipboard: (text: string) => Promise<void>
  findTabByDocumentId: (documentId: string) => I_faOpenedDocumentTab | null
  moveDocumentTab: (documentId: string, direction: 'left' | 'right') => void
  notifyCreate: (options: {
    caption?: string
    color: string
    faSkipNotifyConsoleLog?: boolean
    icon: string
    message: string
    timeout?: number
    type: string
  }) => void
  requestCloseTab: (documentId: string) => void
  requestDeleteDocument: (documentId: string) => void
  closeAllTabsWithoutChanges: () => void | Promise<void>
  closeTabsWithoutChangesExcept: (exceptDocumentId: string) => void | Promise<void>
  forceCloseAllTabs: () => void | Promise<void>
  forceCloseAllTabsExcept: (exceptDocumentId: string) => void | Promise<void>
  translateCopyNameFailed: () => string
  translateCopyNameSuccess: () => string
  resolveActiveDocumentTabName: (input: {
    activeDocumentId: string | null
    openedTabs: readonly { documentId: string }[]
  }) => string | undefined
  resolveDocumentTabLabelFromOpenedTab: (input: {
    displayNameDraft: string
    tabLabel: string
  }) => string
  resolveShowDocumentControlBarStrip: (input: {
    disableDocumentControlBar: boolean
  }) => boolean
  resolveShowDocumentTabs: (openedTabCount: number) => boolean
  resolveShowProjectDocumentControlBarEditButton: (input: {
    activeDocumentTab: { editState: boolean } | null
    isOnDocumentWorkspaceRoute: boolean
  }) => boolean
  resolveShowProjectDocumentControlBarSaveButtons: (input: {
    activeDocumentTab: { editState: boolean } | null
    isOnDocumentWorkspaceRoute: boolean
  }) => boolean
  resolveShowProjectDocumentControlBarDeleteButton: (input: {
    activeDocumentTab: Pick<I_faOpenedDocumentTab, 'persistenceState'> | null
    isOnDocumentWorkspaceRoute: boolean
  }) => boolean
  resolveProjectDocumentControlBarSaveButtonColor: (input: {
    hasUnsavedChanges: boolean
  }) => T_projectDocumentControlBarSaveButtonColor
  runFaAction: (
    id: 'saveOpenedDocumentDisplayName',
    payload: { documentId: string, keepEditMode: boolean }
  ) => void
  projectWorlds: I_computedRef<readonly I_faProjectHierarchyTreeWorkspaceWorld[]>
  tabs: I_computedRef<readonly I_faOpenedDocumentTab[]>
}

export type T_assembleProjectDocumentControlBarApiFn = (
  input: I_assembleProjectDocumentControlBarApiInput
) => I_projectDocumentControlBarComposableApi

export interface I_projectDocumentControlBarTabContextMenuInput {
  moveDocumentTabLeftKeybindLabel: I_computedRef<string | null>
  moveDocumentTabRightKeybindLabel: I_computedRef<string | null>
  onTabCloseAllWithoutChangesClick: () => void
  onTabCloseAllWithoutChangesExceptClick: (documentId: string) => void
  onTabCloseClick: (documentId: string) => void
  onTabCopyNameClick: (documentId: string) => Promise<void>
  onTabDeleteClick: (documentId: string) => void | Promise<void>
  onTabForceCloseAllClick: () => void
  onTabForceCloseAllExceptClick: (documentId: string) => void
  onTabMoveClick: (documentId: string, direction: 'left' | 'right') => void
  openedDocumentTabs: I_computedRef<readonly I_faOpenedDocumentTab[]>
  resolveDocumentTabLabel: (tab: I_faOpenedDocumentTab) => string
  resolveDocumentTabRoute: (documentId: string) => string
  tab: I_faOpenedDocumentTab
}
