import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type { I_assembleProjectAppControlBarApiInput } from 'app/types/I_faProjectAppControlBarDomain'
import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { I_faKeybindsSnapshot, T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeWorkspaceWorld } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { T_projectAppControlBarSaveButtonColor } from 'app/types/T_projectAppControlBarSaveButtonColor'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { StoreGeneric, T_piniaStoreToRefs } from 'app/types/I_vuePiniaInjected'
import type { T_assembleProjectAppControlBarApiFn } from 'app/types/I_faProjectAppControlBarDomain'

export interface I_faCreateUseProjectAppControlBarDeps {
  assembleProjectAppControlBarApi: T_assembleProjectAppControlBarApiFn
  buildProjectAppControlBarAssembleInput: (input: {
    activeDocumentId: I_computedRef<string | null>
    enterDocumentEditMode: (documentId: string) => void
    findTabByDocumentId: (documentId: string) => I_faOpenedDocumentTab | null
    formatFaKeybindCommandLabelFromSnapshot: I_assembleProjectAppControlBarApiInput['formatFaKeybindCommandLabelFromSnapshot']
    getKeybindsSnapshot: I_assembleProjectAppControlBarApiInput['getKeybindsSnapshot']
    isAppControlBarDisabled: I_computedRef<boolean>
    isAppControlBarGuidesDisabled: I_computedRef<boolean>
    isAppControlBarFunctionButtonsDisabled: I_computedRef<boolean>
    isAppControlBarContentButtonsDisabled: I_computedRef<boolean>
    hideHierarchyTree: I_computedRef<boolean>
    isOnDocumentWorkspaceRoute: I_computedRef<boolean>
    moveDocumentTab: (documentId: string, direction: 'left' | 'right') => void
    closeAllTabsWithoutChanges: () => void | Promise<void>
    closeTabsWithoutChangesExcept: (exceptDocumentId: string) => void | Promise<void>
    requestDeleteDocument: (documentId: string) => void
    forceCloseAllTabs: () => void | Promise<void>
    forceCloseAllTabsExcept: (exceptDocumentId: string) => void | Promise<void>
    requestCloseTab: (documentId: string) => void
    resolveActiveDocumentTabName: I_assembleProjectAppControlBarApiInput['resolveActiveDocumentTabName']
    resolveDocumentTabLabelFromOpenedTab: I_assembleProjectAppControlBarApiInput['resolveDocumentTabLabelFromOpenedTab']
    resolveShowAppControlBarStrip: I_assembleProjectAppControlBarApiInput['resolveShowAppControlBarStrip']
    resolveShowDocumentTabs: I_assembleProjectAppControlBarApiInput['resolveShowDocumentTabs']
    resolveShowProjectAppControlBarEditButton: I_assembleProjectAppControlBarApiInput['resolveShowProjectAppControlBarEditButton']
    resolveShowProjectAppControlBarDeleteButton: I_assembleProjectAppControlBarApiInput['resolveShowProjectAppControlBarDeleteButton']
    resolveShowProjectAppControlBarSaveButtons: I_assembleProjectAppControlBarApiInput['resolveShowProjectAppControlBarSaveButtons']
    resolveProjectAppControlBarSaveButtonColor: I_assembleProjectAppControlBarApiInput['resolveProjectAppControlBarSaveButtonColor']
    runFaAction: I_assembleProjectAppControlBarApiInput['runFaAction']
    projectWorlds: I_computedRef<readonly I_faProjectHierarchyTreeWorkspaceWorld[]>
    tabs: I_computedRef<readonly I_faOpenedDocumentTab[]>
    computed: I_assembleProjectAppControlBarApiInput['computed']
  }) => I_assembleProjectAppControlBarApiInput
  computed: <T>(getter: () => T) => I_computedRef<T>
  resolveHideHierarchyTree: (
    settings: I_faUserSettings | null,
    preview: Partial<I_faUserSettings> | null
  ) => boolean
  resolveActiveDocumentTabName: (input: {
    activeDocumentId: string | null
    openedTabs: readonly { documentId: string }[]
  }) => string | undefined
  resolveDocumentTabLabelFromOpenedTab: (input: {
    displayNameDraft: string
    tabLabel: string
  }) => string
  resolveFaDocumentWorkspaceRouteDocumentId: (routePath: string) => string | null
  resolveShowAppControlBarStrip: (input: {
    disableAppControlBar: boolean
  }) => boolean
  resolveShowDocumentTabs: (openedTabCount: number) => boolean
  resolveShowProjectAppControlBarEditButton: (input: {
    activeDocumentTab: { editState: boolean } | null
    isOnDocumentWorkspaceRoute: boolean
  }) => boolean
  resolveShowProjectAppControlBarDeleteButton: (input: {
    activeDocumentTab: Pick<I_faOpenedDocumentTab, 'persistenceState'> | null
    isOnDocumentWorkspaceRoute: boolean
  }) => boolean
  resolveShowProjectAppControlBarSaveButtons: (input: {
    activeDocumentTab: { editState: boolean } | null
    isOnDocumentWorkspaceRoute: boolean
  }) => boolean
  resolveProjectAppControlBarSaveButtonColor: (input: {
    hasUnsavedChanges: boolean
  }) => T_projectAppControlBarSaveButtonColor
  formatFaKeybindCommandLabelFromSnapshot: (params: {
    commandId: T_faKeybindCommandId | undefined
    snapshot: I_faKeybindsSnapshot | null
  }) => string | null
  getKeybindsSnapshot: () => I_faKeybindsSnapshot | null
  runFaAction: <Id extends T_faActionId>(id: Id, payload: I_faActionPayloadMap[Id]) => void
  S_FaOpenedDocuments: () => StoreGeneric & {
    closeAllTabsWithoutChanges: () => void | Promise<void>
    closeTabsWithoutChangesExcept: (exceptDocumentId: string) => void | Promise<void>
    enterDocumentEditMode: (documentId: string) => void
    findTabByDocumentId: (documentId: string) => I_faOpenedDocumentTab | null
    forceCloseAllTabs: () => void | Promise<void>
    forceCloseAllTabsExcept: (exceptDocumentId: string) => void | Promise<void>
    moveDocumentTab: (documentId: string, direction: 'left' | 'right') => void
    requestCloseTab: (documentId: string) => void
    requestDeleteDocument: (documentId: string) => void
  }
  S_FaProjectHierarchyTree: () => StoreGeneric
  S_FaUserSettings: () => StoreGeneric
  storeToRefs: T_piniaStoreToRefs
  useRoute: () => {
    path: string
  }
}
