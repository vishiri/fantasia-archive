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
  normalizeOpenedDocumentExtraClassesFromDb,
  resolveOpenedDocumentExtraClassesDraftForPersist,
  resolveDocumentWorkspacePageExtraHtmlClassList
} from './functions/openedDocumentExtraClasses'
export {
  normalizeOpenedDocumentParentIdFromDb,
  resolveOpenedDocumentParentIdDraftForPersist,
  resolveOpenedDocumentParentMoveAppendSortOrder
} from './functions/openedDocumentParentId'
export {
  computeOpenedDocumentHasUnsavedChanges,
  normalizeOpenedDocumentAppearanceColorFromDb,
  normalizeOpenedDocumentTabAppearanceColors,
  recomputeOpenedDocumentTabHasUnsavedChanges,
  resolveOpenedDocumentAppearanceColorDraftForPersist
} from './functions/openedDocumentTabAppearance'
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
  normalizeOpenedDocumentTabPersistenceState,
  promoteTemporaryOpenedDocumentTabAfterCreate,
  remapOpenedDocumentTabDocumentId,
  resolveOpenedDocumentTabIsPersisted,
  resolveOpenedDocumentTabIsTemporary,
  resolveTemporaryOpenedDocumentDisplayNameForSave,
  resolveTemporaryOpenedDocumentParentDocumentId
} from './functions/openedDocumentTemporaryDomain'
export {
  buildTemporaryDocumentParentResolveDocumentIds,
  buildTemporaryDocumentParentResolveDocumentIdsFromOpenedTab,
  resolveTemporaryDocumentParentDocumentIdForSave
} from './functions/openedDocumentTemporaryParentResolve'
export {
  createTemporaryOpenedDocumentTabCopySeed,
  createTemporaryOpenedDocumentTabSeed
} from './functions/openedDocumentTemporaryTabSeed'
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
