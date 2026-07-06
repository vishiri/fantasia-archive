import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { T_projectDocumentControlBarSaveButtonColor } from 'app/types/T_projectDocumentControlBarSaveButtonColor'

export interface I_projectDocumentControlBarComposableApi {
  activeDocumentTab: I_computedRef<I_faOpenedDocumentTab | null>
  activeDocumentTabName: I_computedRef<string | undefined>
  onEnterEditModeClick: () => void
  onSaveDocumentClick: (keepEditMode: boolean) => void
  onTabAuxClick: (documentId: string, event: MouseEvent) => void
  onTabCloseClick: (documentId: string) => void
  openedDocumentTabs: I_computedRef<readonly I_faOpenedDocumentTab[]>
  resolveDocumentTabRoute: (documentId: string) => string
  resolveDocumentTabLabel: (tab: I_faOpenedDocumentTab) => string
  saveDocumentButtonColor: I_computedRef<T_projectDocumentControlBarSaveButtonColor>
  showDocumentControlBar: I_computedRef<boolean>
  showDocumentTabs: I_computedRef<boolean>
  showEditDocumentButton: I_computedRef<boolean>
  showSaveDocumentButtons: I_computedRef<boolean>
}

export interface I_assembleProjectDocumentControlBarApiInput {
  activeDocumentId: I_computedRef<string | null>
  computed: <T>(getter: () => T) => I_computedRef<T>
  enterDocumentEditMode: (documentId: string) => void
  isDocumentControlBarDisabled: I_computedRef<boolean>
  isOnDocumentWorkspaceRoute: I_computedRef<boolean>
  requestCloseTab: (documentId: string) => void
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
  resolveProjectDocumentControlBarSaveButtonColor: (input: {
    hasUnsavedChanges: boolean
  }) => T_projectDocumentControlBarSaveButtonColor
  saveDocumentDisplayName: (
    documentId: string,
    input: { keepEditMode: boolean }
  ) => Promise<boolean>
  tabs: I_computedRef<readonly I_faOpenedDocumentTab[]>
}

export type T_assembleProjectDocumentControlBarApiFn = (
  input: I_assembleProjectDocumentControlBarApiInput
) => I_projectDocumentControlBarComposableApi
