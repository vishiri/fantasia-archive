import type {
  T_createUseDocumentWorkspacePageDeps
} from 'app/types/I_documentWorkspacePage'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'

export function wireDocumentWorkspacePageStatusFlagToggles (input: {
  deps: T_createUseDocumentWorkspacePageDeps
  documentTab: I_computedRef<I_faOpenedDocumentTab | null>
  openedDocumentsStore: ReturnType<T_createUseDocumentWorkspacePageDeps['S_FaOpenedDocuments']>
  routeDocumentId: I_computedRef<string>
}) {
  const isFinishedToggle = input.deps.createDocumentWorkspacePageDocumentBooleanToggle({
    computed: input.deps.computed,
    descriptionI18nKey: 'documentWorkspacePage.isFinishedDescription',
    documentTab: input.documentTab,
    draftField: 'isFinishedDraft',
    i18n: input.deps.i18n,
    resolveOpenedDocumentTabIsInPreviewMode: input.deps.resolveOpenedDocumentTabIsInPreviewMode,
    routeDocumentId: input.routeDocumentId,
    titleI18nKey: 'documentWorkspacePage.isFinishedTitle',
    updateDraft: input.openedDocumentsStore.updateIsFinishedDraft.bind(input.openedDocumentsStore)
  })

  const isMinorToggle = input.deps.createDocumentWorkspacePageDocumentBooleanToggle({
    computed: input.deps.computed,
    descriptionI18nKey: 'documentWorkspacePage.isMinorDescription',
    documentTab: input.documentTab,
    draftField: 'isMinorDraft',
    i18n: input.deps.i18n,
    resolveOpenedDocumentTabIsInPreviewMode: input.deps.resolveOpenedDocumentTabIsInPreviewMode,
    routeDocumentId: input.routeDocumentId,
    titleI18nKey: 'documentWorkspacePage.isMinorTitle',
    updateDraft: input.openedDocumentsStore.updateIsMinorDraft.bind(input.openedDocumentsStore)
  })

  const isDeadToggle = input.deps.createDocumentWorkspacePageDocumentBooleanToggle({
    computed: input.deps.computed,
    descriptionI18nKey: 'documentWorkspacePage.isDeadDescription',
    documentTab: input.documentTab,
    draftField: 'isDeadDraft',
    i18n: input.deps.i18n,
    resolveOpenedDocumentTabIsInPreviewMode: input.deps.resolveOpenedDocumentTabIsInPreviewMode,
    routeDocumentId: input.routeDocumentId,
    titleI18nKey: 'documentWorkspacePage.isDeadTitle',
    updateDraft: input.openedDocumentsStore.updateIsDeadDraft.bind(input.openedDocumentsStore)
  })

  return {
    isDeadDescription: isDeadToggle.description,
    isDeadModel: isDeadToggle.model,
    isDeadTitle: isDeadToggle.title,
    isDeadToggleReadOnly: isDeadToggle.readOnly,
    isFinishedDescription: isFinishedToggle.description,
    isFinishedModel: isFinishedToggle.model,
    isFinishedTitle: isFinishedToggle.title,
    isFinishedToggleReadOnly: isFinishedToggle.readOnly,
    isMinorDescription: isMinorToggle.description,
    isMinorModel: isMinorToggle.model,
    isMinorTitle: isMinorToggle.title,
    isMinorToggleReadOnly: isMinorToggle.readOnly
  }
}
