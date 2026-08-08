export {
  applyFaOpenedDocumentIsDeadDraft,
  applyFaOpenedDocumentIsFinishedDraft,
  applyFaOpenedDocumentIsMinorDraft
} from './openedDocumentTabStatusFlagDraftWiring'
export {
  resolveOpenedDocumentTabIsInEditMode,
  resolveOpenedDocumentTabIsInPreviewMode,
  normalizeOpenedDocumentTabEditState,
  resolveOpenedDocumentDisplayNameFromTab
} from './functions/openedDocumentEditStateDomain'
export {
  normalizeOpenedDocumentAppearanceColorFromDb,
  normalizeOpenedDocumentExtraClassesFromDb,
  normalizeOpenedDocumentNullableStringFromDb,
  normalizeOpenedDocumentParentIdFromDb
} from './functions/openedDocumentNullableStringFromDb'
export {
  resolveOpenedDocumentExtraClassesDraftForPersist,
  resolveDocumentWorkspacePageExtraHtmlClassList
} from './functions/openedDocumentExtraClasses'
export {
  resolveOpenedDocumentParentIdDraftForPersist,
  resolveOpenedDocumentParentMoveAppendSortOrder
} from './functions/openedDocumentParentId'
export {
  mapOpenedDocumentSavedTagsToDraft,
  mapOpenedDocumentTagsDraftToSetInput,
  resolveOpenedDocumentTagsFingerprint
} from './functions/openedDocumentTagsDomain'
export {
  applyOpenedDocumentTagDeleteAcrossTabs,
  applyOpenedDocumentTagRenameAcrossTabs
} from './openedDocumentTagMutationAcrossTabsWiring'
export {
  computeOpenedDocumentHasUnsavedChanges,
  normalizeOpenedDocumentTabAppearanceColors,
  recomputeOpenedDocumentTabHasUnsavedChanges,
  resolveOpenedDocumentAppearanceColorDraftForPersist
} from './openedDocumentTabAppearanceWiring'
export {
  appendOpenedDocumentTabToRight,
  duplicateOpenedDocumentTab,
  duplicateOpenedDocumentTabs,
  filterOpenedDocumentTabsKeepingExceptDocumentOnly,
  filterOpenedDocumentTabsKeepingUnsavedAndExceptDocument,
  findOpenedDocumentTabIndexByDocumentId,
  moveOpenedDocumentTabByOffset,
  removeOpenedDocumentTabAtIndex,
  resolveAdjacentOpenedDocumentTabId,
  resolveOpenedDocumentTabFocusIndexAfterClose,
  resolveOpenedDocumentTabsAfterBulkCloseWithoutChanges,
  resolveOpenedDocumentTabsAfterForceClose
} from './functions/openedDocumentTabDomain'
export { resolveOpenedDocumentTabDocumentActionContext } from './functions/openedDocumentTabDocumentActionContext'
export { reorderOpenedDocumentTabsByIndex } from './functions/openedDocumentTabReorder'
export {
  applyTemporaryOpenedDocumentParent,
  createTemporaryOpenedDocumentTabCopySeed,
  createTemporaryOpenedDocumentTabSeed,
  normalizeOpenedDocumentTabPersistenceState,
  promoteTemporaryOpenedDocumentTabAfterCreate,
  remapOpenedDocumentTabDocumentId,
  resolveOpenedDocumentTabIsPersisted,
  resolveOpenedDocumentTabIsTemporary,
  resolveTemporaryOpenedDocumentDisplayNameForSave,
  resolveTemporaryOpenedDocumentParentDocumentId
} from './openedDocumentTemporaryDomainWiring'
export {
  buildTemporaryDocumentParentResolveDocumentIds,
  buildTemporaryDocumentParentResolveDocumentIdsFromOpenedTab,
  resolveTemporaryDocumentParentDocumentIdForSave
} from './functions/openedDocumentTemporaryParentResolve'
export {
  isFaDocumentTreeOrderNumberEmpty,
  normalizeOpenedDocumentTreeOrderNumberFromDb,
  resolveFaDocumentTreeOrderNumberBadgeLabel,
  resolveOpenedDocumentTreeOrderNumberDraftForPersist
} from './functions/openedDocumentTreeOrderNumber'
export {
  resolveActiveOpenedDocumentTab,
  resolveCanEditActiveDocumentViaKeybind,
  resolveCanSaveActiveDocumentViaKeybind,
  resolveIsOnDocumentWorkspaceRoute
} from './functions/openedDocumentWorkspaceKeybindGuards'
export { resolveCopyOfDocumentDisplayName } from './functions/resolveCopyOfDocumentDisplayName'
export { resolveHierarchyTreeDocumentOpenEditSteps } from './functions/resolveHierarchyTreeDocumentOpenEditSteps'
