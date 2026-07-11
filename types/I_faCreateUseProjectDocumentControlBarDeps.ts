import type { I_assembleProjectDocumentControlBarApiInput } from 'app/types/I_faProjectDocumentControlBarDomain'
import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { I_faKeybindsSnapshot, T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { T_projectDocumentControlBarSaveButtonColor } from 'app/types/T_projectDocumentControlBarSaveButtonColor'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { StoreGeneric, T_piniaStoreToRefs } from 'app/types/I_vuePiniaInjected'
import type { T_assembleProjectDocumentControlBarApiFn } from 'app/types/I_faProjectDocumentControlBarDomain'

export interface I_faCreateUseProjectDocumentControlBarDeps {
  assembleProjectDocumentControlBarApi: T_assembleProjectDocumentControlBarApiFn
  buildProjectDocumentControlBarAssembleInput: (input: {
    activeDocumentId: I_computedRef<string | null>
    copyToClipboard: (text: string) => Promise<void>
    enterDocumentEditMode: (documentId: string) => void
    findTabByDocumentId: (documentId: string) => I_faOpenedDocumentTab | null
    formatFaKeybindCommandLabelFromSnapshot: I_assembleProjectDocumentControlBarApiInput['formatFaKeybindCommandLabelFromSnapshot']
    getKeybindsSnapshot: I_assembleProjectDocumentControlBarApiInput['getKeybindsSnapshot']
    isDocumentControlBarDisabled: I_computedRef<boolean>
    isOnDocumentWorkspaceRoute: I_computedRef<boolean>
    moveDocumentTab: (documentId: string, direction: 'left' | 'right') => void
    notifyCreate: I_assembleProjectDocumentControlBarApiInput['notifyCreate']
    closeAllTabsWithoutChanges: () => void | Promise<void>
    closeTabsWithoutChangesExcept: (exceptDocumentId: string) => void | Promise<void>
    requestDeleteDocument: (documentId: string) => void
    forceCloseAllTabs: () => void | Promise<void>
    forceCloseAllTabsExcept: (exceptDocumentId: string) => void | Promise<void>
    requestCloseTab: (documentId: string) => void
    resolveActiveDocumentTabName: I_assembleProjectDocumentControlBarApiInput['resolveActiveDocumentTabName']
    resolveDocumentTabLabelFromOpenedTab: I_assembleProjectDocumentControlBarApiInput['resolveDocumentTabLabelFromOpenedTab']
    resolveShowDocumentControlBarStrip: I_assembleProjectDocumentControlBarApiInput['resolveShowDocumentControlBarStrip']
    resolveShowDocumentTabs: I_assembleProjectDocumentControlBarApiInput['resolveShowDocumentTabs']
    resolveShowProjectDocumentControlBarEditButton: I_assembleProjectDocumentControlBarApiInput['resolveShowProjectDocumentControlBarEditButton']
    resolveShowProjectDocumentControlBarDeleteButton: I_assembleProjectDocumentControlBarApiInput['resolveShowProjectDocumentControlBarDeleteButton']
    resolveShowProjectDocumentControlBarSaveButtons: I_assembleProjectDocumentControlBarApiInput['resolveShowProjectDocumentControlBarSaveButtons']
    resolveProjectDocumentControlBarSaveButtonColor: I_assembleProjectDocumentControlBarApiInput['resolveProjectDocumentControlBarSaveButtonColor']
    runFaAction: I_assembleProjectDocumentControlBarApiInput['runFaAction']
    tabs: I_computedRef<readonly I_faOpenedDocumentTab[]>
    translateCopyNameFailed: () => string
    translateCopyNameSuccess: () => string
    computed: I_assembleProjectDocumentControlBarApiInput['computed']
  }) => I_assembleProjectDocumentControlBarApiInput
  computed: <T>(getter: () => T) => I_computedRef<T>
  resolveActiveDocumentTabName: (input: {
    activeDocumentId: string | null
    openedTabs: readonly { documentId: string }[]
  }) => string | undefined
  resolveDocumentTabLabelFromOpenedTab: (input: {
    displayNameDraft: string
    tabLabel: string
  }) => string
  resolveFaDocumentWorkspaceRouteDocumentId: (routePath: string) => string | null
  resolveShowDocumentControlBarStrip: (input: {
    disableDocumentControlBar: boolean
  }) => boolean
  resolveShowDocumentTabs: (openedTabCount: number) => boolean
  resolveShowProjectDocumentControlBarEditButton: (input: {
    activeDocumentTab: { editState: boolean } | null
    isOnDocumentWorkspaceRoute: boolean
  }) => boolean
  resolveShowProjectDocumentControlBarDeleteButton: (input: {
    activeDocumentTab: Pick<I_faOpenedDocumentTab, 'persistenceState'> | null
    isOnDocumentWorkspaceRoute: boolean
  }) => boolean
  resolveShowProjectDocumentControlBarSaveButtons: (input: {
    activeDocumentTab: { editState: boolean } | null
    isOnDocumentWorkspaceRoute: boolean
  }) => boolean
  resolveProjectDocumentControlBarSaveButtonColor: (input: {
    hasUnsavedChanges: boolean
  }) => T_projectDocumentControlBarSaveButtonColor
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
  S_FaUserSettings: () => StoreGeneric
  storeToRefs: T_piniaStoreToRefs
  useRoute: () => {
    path: string
  }
  useI18n: () => {
    t: (key: string) => string
  }
  copyToClipboard: (text: string) => Promise<void>
  notifyCreate: (options: {
    caption?: string
    color: string
    faSkipNotifyConsoleLog?: boolean
    icon: string
    message: string
    timeout?: number
    type: string
  }) => void
}
