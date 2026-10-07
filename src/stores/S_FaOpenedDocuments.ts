import { defineStore } from 'pinia'
import debounce from 'lodash-es/debounce.js'
import { ResultAsync } from 'neverthrow'
import { Notify } from 'quasar'
import { nextTick, readonly, ref, watch } from 'vue'

import type { Ref } from 'vue'

import type {
  I_faOpenedDocumentTab,
  I_faOpenedDocumentTreeOpenMeta,
  I_faTemporaryOpenedDocumentCreateInput,
  T_faOpenedDocumentOpenMode
} from 'app/types/I_faOpenedDocumentsDomain'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import { FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT } from 'app/types/I_faOpenedDocumentsDomain'
import { FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY } from 'app/types/I_faDocumentTreeOrderNumber'
import { i18n } from 'app/i18n/externalFileLoader'
import {
  navigateToOpenedDocumentRoute,
  navigateToWorkspaceHomeRoute
} from 'app/src/scripts/appInternals/faAppRouterSession_manager'
import { refreshOpenedDocumentTabsAfterDeletedParent } from 'app/src/stores/scripts/faOpenedDocumentsParentAfterDeleteWiring'
import { recordFaOpenedDocumentLastOpenedBestEffort } from 'app/src/stores/scripts/faOpenedDocumentsRecordLastOpenedWiring'
import {
  isFaProjectContentMissingRowError,
  throwUnlessFaProjectContentMissingRow,
  reconcileTemporaryOpenedDocumentTabFromSnapshot,
  resolveTemporaryOpenedDocumentParentIdForSave
} from 'app/src/stores/scripts/faOpenedDocumentsTemporarySessionWiring'
import {
  createFaProjectDocumentForRenderer,
  deleteFaProjectDocumentForRenderer,
  getFaProjectDocumentByIdForRenderer,
  getFaProjectDocumentTemplateByIdForRenderer,
  getFaProjectWorldByIdForRenderer,
  hasFaProjectContentEntityReaders,
  hasFaProjectDocumentByIdReader,
  hasFaProjectDocumentCreateWriter,
  hasFaProjectDocumentUpdateWriter,
  listFaProjectDocumentTagsForRenderer,
  listFaProjectPlacementDocumentChildrenForRenderer,
  moveFaProjectDocumentInHierarchyForRenderer,
  updateFaProjectDocumentForRenderer
} from 'app/src/scripts/componentTesting/componentTesting_manager'
import {
  applyFaOpenedDocumentBackgroundColorDraft,
  applyFaOpenedDocumentDisplayNameDraft,
  applyFaOpenedDocumentIsCategoryDraft,
  applyFaOpenedDocumentTabEditState,
  applyFaOpenedDocumentTextColorDraft,
  buildFaOpenedDocumentsSnapshot,
  createFaOpenedDocumentTabFromOpenMeta,
  hydrateFaOpenedDocumentsTabsFromSnapshot
} from 'app/src/stores/scripts/faOpenedDocumentsStoreActions'
import {
  keepOpenedDocumentDraftsTypedDuringSave,
  mergeOpenedDocumentSaveOntoLiveTab,
  resolveOpenedDocumentEditStateAfterSave
} from 'app/src/stores/scripts/faOpenedDocumentsDraftTypedDuringSave'
import {
  mergeOpenedDocumentHydrateReconcileOntoLiveTabs,
  mergeOpenedDocumentHydrateSnapshotOntoLiveTabs
} from 'app/src/stores/scripts/faOpenedDocumentsHydrateReconcileLiveTab'
import { applyFaOpenedDocumentTabAfterDisplayNameSave } from 'app/src/stores/scripts/faOpenedDocumentsDisplayNameSaveStoreActions'
import {
  applyFaOpenedDocumentParentIdDraft,
  applyFaOpenedDocumentParentIdSyncFromHierarchy
} from 'app/src/stores/scripts/faOpenedDocumentsParentIdStoreActions'
import { applyFaOpenedDocumentTreeOrderNumberDraft } from 'app/src/stores/scripts/faOpenedDocumentsTreeOrderNumberStoreActions'
import { applyFaOpenedDocumentExtraClassesDraft } from 'app/src/stores/scripts/faOpenedDocumentsExtraClassesStoreActions'
import {
  applyFaOpenedDocumentTagsDraft,
  persistFaOpenedDocumentTagsAfterSave,
  reconcileOpenedDocumentTabTagsOnHydrate,
  resolveOpenedDocumentTagRefreshNodeIdsAfterSave
} from 'app/src/stores/scripts/faOpenedDocumentsTagsStoreActions'
import {
  applyFaOpenedDocumentIsDeadDraft,
  applyFaOpenedDocumentIsFinishedDraft,
  applyFaOpenedDocumentIsMinorDraft,
  applyTemporaryOpenedDocumentParent,
  buildTemporaryDocumentParentResolveDocumentIds,
  buildTemporaryDocumentParentResolveDocumentIdsFromOpenedTab,
  createTemporaryOpenedDocumentTabCopySeed,
  createTemporaryOpenedDocumentTabSeed,
  duplicateOpenedDocumentTabs,
  findOpenedDocumentTabIndexByDocumentId,
  moveOpenedDocumentTabByOffset,
  normalizeOpenedDocumentAppearanceColorFromDb,
  normalizeOpenedDocumentExtraClassesFromDb,
  normalizeOpenedDocumentParentIdFromDb,
  normalizeOpenedDocumentTreeOrderNumberFromDb,
  promoteTemporaryOpenedDocumentTabAfterCreate,
  recomputeOpenedDocumentTabHasUnsavedChanges,
  remapOpenedDocumentTabDocumentId,
  reorderOpenedDocumentTabsByIndex,
  resolveCopyOfDocumentDisplayName,
  resolveOpenedDocumentAppearanceColorDraftForPersist,
  resolveOpenedDocumentHydrateUnsavedDraft,
  openedDocumentExtraClassesDraftExceedsStorage,
  resolveOpenedDocumentExtraClassesDraftForPersist,
  resolveOpenedDocumentParentIdDraftForPersist,
  resolveOpenedDocumentParentMoveAppendSortOrder,
  resolveOpenedDocumentTabDocumentActionContext,
  resolveOpenedDocumentTabIsTemporary,
  resolveOpenedDocumentTabsAfterBulkCloseWithoutChanges,
  resolveOpenedDocumentTabsAfterForceClose,
  openedDocumentSavedTagIdSetsDiffer,
  resolveOpenedDocumentTagsFingerprint,
  resolveOpenedDocumentTreeOpenMetaForSeed,
  openedDocumentTreeOrderNumberDraftExceedsStorage,
  resolveOpenedDocumentTreeOrderNumberDraftForPersist,
  resolveTemporaryOpenedDocumentDisplayNameForSave,
  resolveTemporaryOpenedDocumentParentDocumentId
} from 'app/src/scripts/openedDocuments/openedDocuments_manager'
import {
  removeFaOpenedDocumentTabAtIndex,
  resolveFaOpenedDocumentOpenFromTree,
  resolveFaOpenedDocumentsActiveDocumentSyncTarget
} from 'app/src/stores/scripts/faOpenedDocumentsTabSessionWiring'
import { resolveFaDocumentWorkspaceRouteDocumentId } from 'app/src/scripts/appRouting/appRouting_manager'
import { collectProjectHierarchyTreeNewDocumentContainerNodeIdsForRefresh, ensureProjectHierarchyTreeDocumentNodeHasChildrenForRefresh, removeProjectHierarchyTreeDocumentNodesByDocumentIds } from 'app/src/components/projectUI/ProjectHierarchyTree/functions/projectHierarchyTreeDocumentParentBucket'
import { collectProjectHierarchyTreeDocumentDeleteRefreshNodeIds } from 'app/src/components/projectUI/ProjectHierarchyTree/scripts/projectHierarchyTreeDocumentRefreshNodeIds'
import { resolveProjectHierarchyTreeNewDocumentDisplayName } from 'app/src/components/projectUI/ProjectHierarchyTree/functions/projectHierarchyTreeAddNewDocumentLabel'
import { resolveFaProjectDocumentTemplateDisplayTitleFromFields } from 'app/src/scripts/documentTemplates/faProjectDocumentTemplateTitle_manager'
import { resolveFaLocaleStringTranslation } from 'app/src/scripts/localeTranslations/faLocaleStringTranslations_manager'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import {
  faOpenedDocumentsPersistSnapshotFromBridge,
  faOpenedDocumentsRefreshSnapshotFromBridge
} from 'app/src/stores/scripts/sFaOpenedDocumentsBridge'

const OPENED_DOCUMENTS_PERSIST_DEBOUNCE_MS = 500

/**
 * Workspace session state for opened document tabs, drafts, and SQLite snapshot persistence.
 */
export const S_FaOpenedDocuments = defineStore('S_FaOpenedDocuments', () => {
  const tabs: Ref<I_faOpenedDocumentTab[]> = ref([])
  const activeDocumentId: Ref<string | null> = ref(null)
  const lastRemovedIndex: Ref<number> = ref(-1)
  const pendingCloseDocumentId: Ref<string | null> = ref(null)
  const pendingDeleteDocumentId: Ref<string | null> = ref(null)
  const hydrationComplete: Ref<boolean> = ref(false)

  let persistInFlight: Promise<boolean> | null = null
  let openedDocumentNavigationSerial = 0

  function claimOpenedDocumentNavigationSerial (): number {
    openedDocumentNavigationSerial += 1
    return openedDocumentNavigationSerial
  }

  function readOpenedDocumentNavigationSerialForMode (
    mode: T_faOpenedDocumentOpenMode | undefined
  ): number {
    if (mode === 'middleBackground') {
      return openedDocumentNavigationSerial
    }
    return claimOpenedDocumentNavigationSerial()
  }

  async function openPreparedDocumentTab (input: {
    documentId: string
    mode: T_faOpenedDocumentOpenMode
    navigationSerialAtStart: number
    newTab: I_faOpenedDocumentTab
  }): Promise<{
    navigated: boolean
    superseded: boolean
  }> {
    const superseded = input.navigationSerialAtStart !== openedDocumentNavigationSerial
    const applyMode = superseded && input.mode !== 'middleBackground'
      ? 'middleBackground'
      : input.mode
    const openResult = resolveFaOpenedDocumentOpenFromTree({
      activeDocumentId,
      documentId: input.documentId,
      mode: applyMode,
      newTab: input.newTab,
      tabs
    })
    queueOpenedDocumentsSnapshotPersist()
    if (openResult.shouldNavigate && openResult.navigateDocumentId !== null) {
      openedDocumentNavigationSerial += 1
      await navigateToOpenedDocumentRoute(openResult.navigateDocumentId)
    }
    const navigated = openResult.shouldNavigate
    return {
      navigated,
      superseded
    }
  }

  function buildCurrentSnapshot () {
    return buildFaOpenedDocumentsSnapshot({
      activeDocumentId: activeDocumentId.value,
      tabs: tabs.value
    })
  }

  let openedDocumentsSnapshotEpochAtSchedule = 0

  const schedulePersistSnapshot = debounce(() => {
    void flushPersistSnapshot({
      epochAtSchedule: openedDocumentsSnapshotEpochAtSchedule
    })
  }, OPENED_DOCUMENTS_PERSIST_DEBOUNCE_MS)

  function queueOpenedDocumentsSnapshotPersist (): void {
    openedDocumentsSnapshotEpochAtSchedule = S_FaActiveProject().readProjectContentEpoch()
    schedulePersistSnapshot()
  }

  async function flushPersistSnapshot (options?: {
    epochAtSchedule?: number
    ignoreReplacementFlight?: boolean
  }): Promise<boolean> {
    const pendingPersist = persistInFlight
    if (pendingPersist !== null) {
      await pendingPersist
    }
    if (!S_FaActiveProject().hasActiveProject) {
      return false
    }
    const epochAtSchedule = options?.epochAtSchedule
    if (
      epochAtSchedule !== undefined &&
      S_FaActiveProject().readProjectContentEpoch() !== epochAtSchedule
    ) {
      return false
    }
    const ignoreReplacementFlight = options?.ignoreReplacementFlight === true
    if (!ignoreReplacementFlight && S_FaActiveProject().isProjectReplacementInFlight()) {
      return false
    }
    const snapshot = buildCurrentSnapshot()
    const write = faOpenedDocumentsPersistSnapshotFromBridge(snapshot)
    persistInFlight = write
    const ok = await write
    if (persistInFlight === write) {
      persistInFlight = null
    }
    return ok
  }

  async function flushPersistSnapshotBeforeProjectReplacement (): Promise<void> {
    schedulePersistSnapshot.cancel()
    if (!S_FaActiveProject().hasActiveProject) {
      return
    }
    await flushPersistSnapshot({
      ignoreReplacementFlight: true
    })
  }

  function resetSessionState (): void {
    tabs.value = []
    activeDocumentId.value = null
    lastRemovedIndex.value = -1
    pendingCloseDocumentId.value = null
    pendingDeleteDocumentId.value = null
    hydrationComplete.value = false
    schedulePersistSnapshot.cancel()
  }

  async function validateAndFilterTabsFromSnapshot (epochAtStart: number): Promise<void> {
    const api = window.faContentBridgeAPIs?.projectContent
    if (typeof api?.getDocumentById !== 'function') {
      return
    }
    const startTabs = tabs.value.slice()
    const reconciledByDocumentId = new Map<string, I_faOpenedDocumentTab>()
    const droppedDocumentIds = new Set<string>()
    for (const tab of startTabs) {
      if (resolveOpenedDocumentTabIsTemporary(tab.persistenceState)) {
        const reconciledTab = await reconcileTemporaryOpenedDocumentTabFromSnapshot(tab, api)
        if (reconciledTab === null) {
          droppedDocumentIds.add(tab.documentId)
        } else {
          reconciledByDocumentId.set(tab.documentId, reconciledTab)
        }
        continue
      }

      const documentResult = await ResultAsync.fromPromise(
        api.getDocumentById(tab.documentId),
        (error): unknown => error
      )
      if (documentResult.isErr()) {
        if (isFaProjectContentMissingRowError(documentResult.error)) {
          droppedDocumentIds.add(tab.documentId)
          continue
        }
        reconciledByDocumentId.set(tab.documentId, tab)
        continue
      }
      const doc = documentResult.value
      const savedDisplayName = doc.displayName
      const savedDocumentTextColor = normalizeOpenedDocumentAppearanceColorFromDb(
        doc.documentTextColor
      )
      const savedDocumentBackgroundColor = normalizeOpenedDocumentAppearanceColorFromDb(
        doc.documentBackgroundColor
      )
      const savedIsCategory = doc.isCategory === true
      const savedIsFinished = doc.isFinished === true
      const savedIsMinor = doc.isMinor === true
      const savedIsDead = doc.isDead === true
      const savedParentDocumentId = normalizeOpenedDocumentParentIdFromDb(doc.parentDocumentId)
      const savedTreeOrderNumber = doc.treeOrderNumber ?? FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY
      const savedExtraClasses = normalizeOpenedDocumentExtraClassesFromDb(doc.extraClasses)
      const displayNameDraft = tab.hasUnsavedChanges ? tab.displayNameDraft : savedDisplayName
      const documentTextColorDraft = resolveOpenedDocumentHydrateUnsavedDraft({
        databaseDraft: savedDocumentTextColor,
        hasUnsavedChanges: tab.hasUnsavedChanges,
        missingDraft: '',
        missingSaved: '',
        snapshotDraft: tab.documentTextColorDraft,
        snapshotSaved: tab.savedDocumentTextColor
      })
      const documentBackgroundColorDraft = resolveOpenedDocumentHydrateUnsavedDraft({
        databaseDraft: savedDocumentBackgroundColor,
        hasUnsavedChanges: tab.hasUnsavedChanges,
        missingDraft: '',
        missingSaved: '',
        snapshotDraft: tab.documentBackgroundColorDraft,
        snapshotSaved: tab.savedDocumentBackgroundColor
      })
      const isCategoryDraft = resolveOpenedDocumentHydrateUnsavedDraft({
        databaseDraft: savedIsCategory,
        hasUnsavedChanges: tab.hasUnsavedChanges,
        missingDraft: false,
        missingSaved: false,
        snapshotDraft: tab.isCategoryDraft,
        snapshotSaved: tab.savedIsCategory
      })
      const isFinishedDraft = resolveOpenedDocumentHydrateUnsavedDraft({
        databaseDraft: savedIsFinished,
        hasUnsavedChanges: tab.hasUnsavedChanges,
        missingDraft: false,
        missingSaved: false,
        snapshotDraft: tab.isFinishedDraft,
        snapshotSaved: tab.savedIsFinished
      })
      const isMinorDraft = resolveOpenedDocumentHydrateUnsavedDraft({
        databaseDraft: savedIsMinor,
        hasUnsavedChanges: tab.hasUnsavedChanges,
        missingDraft: false,
        missingSaved: false,
        snapshotDraft: tab.isMinorDraft,
        snapshotSaved: tab.savedIsMinor
      })
      const isDeadDraft = resolveOpenedDocumentHydrateUnsavedDraft({
        databaseDraft: savedIsDead,
        hasUnsavedChanges: tab.hasUnsavedChanges,
        missingDraft: false,
        missingSaved: false,
        snapshotDraft: tab.isDeadDraft,
        snapshotSaved: tab.savedIsDead
      })
      const parentDocumentIdDraft = resolveOpenedDocumentHydrateUnsavedDraft({
        databaseDraft: savedParentDocumentId,
        hasUnsavedChanges: tab.hasUnsavedChanges,
        missingDraft: '',
        missingSaved: '',
        snapshotDraft: tab.parentDocumentIdDraft,
        snapshotSaved: tab.savedParentDocumentId
      })
      const treeOrderNumberDraft = resolveOpenedDocumentHydrateUnsavedDraft({
        databaseDraft: normalizeOpenedDocumentTreeOrderNumberFromDb(savedTreeOrderNumber),
        hasUnsavedChanges: tab.hasUnsavedChanges,
        missingDraft: '',
        missingSaved: FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY,
        snapshotDraft: tab.treeOrderNumberDraft,
        snapshotSaved: tab.savedTreeOrderNumber
      })
      const extraClassesDraft = resolveOpenedDocumentHydrateUnsavedDraft({
        databaseDraft: savedExtraClasses,
        hasUnsavedChanges: tab.hasUnsavedChanges,
        missingDraft: '',
        missingSaved: '',
        snapshotDraft: tab.extraClassesDraft,
        snapshotSaved: tab.savedExtraClasses
      })
      const tagFields = await reconcileOpenedDocumentTabTagsOnHydrate(tab)
      const savedTags = tagFields.savedTags
      const tagsDraft = tagFields.tagsDraft
      const reconciledTab: I_faOpenedDocumentTab = {
        ...tab,
        displayNameDraft,
        documentBackgroundColorDraft,
        documentTextColorDraft,
        isCategoryDraft,
        isFinishedDraft,
        isMinorDraft,
        isDeadDraft,
        parentDocumentIdDraft,
        treeOrderNumberDraft,
        extraClassesDraft,
        savedDisplayName,
        savedDocumentBackgroundColor,
        savedDocumentTextColor,
        savedIsCategory,
        savedIsFinished,
        savedIsMinor,
        savedIsDead,
        savedParentDocumentId,
        savedTreeOrderNumber,
        savedExtraClasses,
        savedTags,
        tagsDraft,
        worldId: tab.worldId ?? doc.worldId
      }
      reconciledByDocumentId.set(tab.documentId, {
        ...reconciledTab,
        hasUnsavedChanges: recomputeOpenedDocumentTabHasUnsavedChanges(reconciledTab)
      })
    }
    if (S_FaActiveProject().readProjectContentEpoch() !== epochAtStart) {
      return
    }
    const nextTabs = mergeOpenedDocumentHydrateReconcileOntoLiveTabs({
      droppedDocumentIds,
      liveTabs: tabs.value,
      reconciledByDocumentId,
      startTabs
    })
    tabs.value = nextTabs
    if (
      activeDocumentId.value !== null &&
      findOpenedDocumentTabIndexByDocumentId(tabs.value, activeDocumentId.value) === -1
    ) {
      const lastTab = tabs.value[tabs.value.length - 1]
      activeDocumentId.value = lastTab?.documentId ?? null
    }
  }

  async function hydrateFromProjectDatabase (): Promise<void> {
    resetSessionState()
    if (!S_FaActiveProject().hasActiveProject) {
      hydrationComplete.value = true
      return
    }
    const epochAtStart = S_FaActiveProject().readProjectContentEpoch()
    const snapshot = await faOpenedDocumentsRefreshSnapshotFromBridge()
    if (S_FaActiveProject().readProjectContentEpoch() !== epochAtStart) {
      return
    }
    const resolved = snapshot ?? FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT
    const hydrated = hydrateFaOpenedDocumentsTabsFromSnapshot(resolved)
    const liveTabsDuringSnapshotRead = tabs.value.slice()
    const liveActiveDuringSnapshotRead = activeDocumentId.value
    const mergedHydrate = mergeOpenedDocumentHydrateSnapshotOntoLiveTabs({
      liveActiveDocumentId: liveActiveDuringSnapshotRead,
      liveTabs: liveTabsDuringSnapshotRead,
      snapshotActiveDocumentId: hydrated.activeDocumentId,
      snapshotTabs: hydrated.tabs
    })
    tabs.value = mergedHydrate.tabs
    activeDocumentId.value = mergedHydrate.activeDocumentId
    const activeBeforeTabCheck = activeDocumentId.value
    await validateAndFilterTabsFromSnapshot(epochAtStart)
    if (S_FaActiveProject().readProjectContentEpoch() !== epochAtStart) {
      return
    }
    const activeAfterTabCheck = activeDocumentId.value
    const previousFocusStillOpen = activeBeforeTabCheck !== null &&
      findOpenedDocumentTabIndexByDocumentId(tabs.value, activeBeforeTabCheck) !== -1
    const userFocusedDuringTabCheck = activeAfterTabCheck !== null &&
      activeAfterTabCheck !== activeBeforeTabCheck &&
      (activeBeforeTabCheck === null || previousFocusStillOpen)
    const userKeptFocusDuringSnapshotRead = liveActiveDuringSnapshotRead !== null &&
      activeAfterTabCheck === liveActiveDuringSnapshotRead
    if (activeAfterTabCheck !== null && !userKeptFocusDuringSnapshotRead) {
      if (S_FaUserSettings().settings?.autoOpenLastDocument === true) {
        await navigateToOpenedDocumentRoute(activeAfterTabCheck)
      } else if (!userFocusedDuringTabCheck) {
        await navigateToWorkspaceHomeRoute()
      }
    }
    if (S_FaActiveProject().readProjectContentEpoch() !== epochAtStart) {
      return
    }
    hydrationComplete.value = true
  }

  async function clearSession (): Promise<void> {
    schedulePersistSnapshot.cancel()
    if (persistInFlight !== null) {
      await persistInFlight
    }
    resetSessionState()
  }

  async function resolveFallbackTemplateIconForBlankTreeMeta (
    templateId: string | null | undefined,
    treeTemplateIcon: string
  ): Promise<string> {
    if (treeTemplateIcon.trim().length > 0) {
      return ''
    }
    if (templateId === null || templateId === undefined || templateId.length === 0) {
      return ''
    }
    const templateResult = await ResultAsync.fromPromise(
      getFaProjectDocumentTemplateByIdForRenderer(templateId),
      (error): unknown => error
    )
    if (templateResult.isErr()) {
      return ''
    }
    return templateResult.value.icon.trim()
  }

  async function seedDocumentBaselineIfNeeded (
    documentId: string,
    treeMeta: I_faOpenedDocumentTreeOpenMeta
  ): Promise<I_faOpenedDocumentTab | null> {
    if (!hasFaProjectDocumentByIdReader()) {
      return null
    }
    const documentResult = await ResultAsync.fromPromise(
      getFaProjectDocumentByIdForRenderer(documentId),
      (error): unknown => error
    )
    if (documentResult.isErr()) {
      if (isFaProjectContentMissingRowError(documentResult.error)) {
        return null
      }
      throw documentResult.error
    }
    const doc = documentResult.value
    const fallbackTemplateIcon = await resolveFallbackTemplateIconForBlankTreeMeta(
      doc.templateId,
      treeMeta.templateIcon
    )
    const resolvedTreeMeta = resolveOpenedDocumentTreeOpenMetaForSeed(
      treeMeta,
      doc.displayName,
      fallbackTemplateIcon
    )
    let tagsDraft: import('app/types/I_faProjectTagDomain').I_faProjectDocumentTagAssignmentInput[] = []
    let savedTags: import('app/types/I_faProjectTagDomain').I_faProjectDocumentTagRef[] = []
    const tagsResult = await ResultAsync.fromPromise(
      listFaProjectDocumentTagsForRenderer({ documentId }),
      (error): unknown => error
    )
    if (tagsResult.isOk()) {
      savedTags = tagsResult.value.items
      tagsDraft = savedTags.map((tag) => {
        const id = tag.id
        const name = tag.name
        return {
          id,
          name
        }
      })
    }
    const tagsWereLoaded = tagsResult.isOk()
    const seededTab = createFaOpenedDocumentTabFromOpenMeta({
      documentId,
      displayName: doc.displayName,
      documentBackgroundColor: doc.documentBackgroundColor,
      documentTextColor: doc.documentTextColor,
      isCategory: doc.isCategory,
      isFinished: doc.isFinished,
      isMinor: doc.isMinor,
      isDead: doc.isDead,
      parentDocumentId: doc.parentDocumentId,
      treeOrderNumber: doc.treeOrderNumber,
      extraClasses: doc.extraClasses,
      treeMeta: resolvedTreeMeta,
      worldId: doc.worldId
    })
    if (!tagsWereLoaded) {
      const unloadedTags = undefined
      return {
        ...seededTab,
        savedTags: unloadedTags,
        tagsDraft: unloadedTags
      }
    }
    return {
      ...seededTab,
      tagsDraft,
      savedTags
    }
  }

  async function openFromTree (
    documentId: string,
    mode: T_faOpenedDocumentOpenMode,
    treeMeta: I_faOpenedDocumentTreeOpenMeta
  ): Promise<void> {
    const epochAtStart = S_FaActiveProject().readProjectContentEpoch()
    const navigationSerialAtStart = readOpenedDocumentNavigationSerialForMode(mode)
    const existingIndex = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    let newTab: I_faOpenedDocumentTab | null = null
    if (existingIndex === -1) {
      newTab = await seedDocumentBaselineIfNeeded(documentId, treeMeta)
      if (newTab === null) {
        return
      }
    } else {
      newTab = tabs.value[existingIndex] ?? null
      if (newTab === null) {
        return
      }
    }
    if (openedDocumentSaveEpochMoved(epochAtStart)) {
      return
    }
    const opened = await openPreparedDocumentTab({
      documentId,
      mode,
      navigationSerialAtStart,
      newTab
    })
    if (openedDocumentSaveEpochMoved(epochAtStart)) {
      return
    }
    if (opened.superseded && mode !== 'middleBackground') {
      return
    }
    if (opened.navigated && activeDocumentId.value !== documentId) {
      return
    }
    if (!resolveOpenedDocumentTabIsTemporary(newTab.persistenceState)) {
      // Await MRU write before Last opened bump so overview list reload includes this doc.
      // Chart rebuilds only when Last opened empty↔non-empty (see refreshLastOpenedAfterMru).
      await recordFaOpenedDocumentLastOpenedBestEffort(documentId)
      if (openedDocumentSaveEpochMoved(epochAtStart)) {
        return
      }
      S_FaProjectHierarchyTree().bumpDocumentLastOpenedRefreshGeneration()
    }
  }

  function resolvePreferredLanguageCodeForTemporaryDocument (): T_faUserSettingsLanguageCode {
    return S_FaUserSettings().settings?.languageCode ?? 'en-US'
  }

  async function createTemporaryDocument (
    input: I_faTemporaryOpenedDocumentCreateInput,
    navigationSerialAtStart?: number
  ): Promise<string> {
    const epochAtStart = S_FaActiveProject().readProjectContentEpoch()
    if (!hasFaProjectContentEntityReaders()) {
      throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.createTemporaryError'))
    }
    const navigationSerial = navigationSerialAtStart !== undefined
      ? navigationSerialAtStart
      : readOpenedDocumentNavigationSerialForMode(input.openMode)

    const documentId = input.documentId ?? crypto.randomUUID()
    const parentDocumentId = resolveTemporaryOpenedDocumentParentDocumentId(input)
    if (parentDocumentId !== null) {
      const parentTabIndex = findOpenedDocumentTabIndexByDocumentId(tabs.value, parentDocumentId)
      const parentTab = parentTabIndex === -1 ? undefined : tabs.value[parentTabIndex]
      const parentIsOpenTemporary = parentTab !== undefined &&
        resolveOpenedDocumentTabIsTemporary(parentTab.persistenceState)
      if (!parentIsOpenTemporary) {
        await getFaProjectDocumentByIdForRenderer(parentDocumentId)
      }
    }
    await getFaProjectWorldByIdForRenderer(input.worldId)
    const template = await getFaProjectDocumentTemplateByIdForRenderer(input.templateId)
    const preferredLanguageCode = resolvePreferredLanguageCodeForTemporaryDocument()
    const tabLabel = resolveFaProjectDocumentTemplateDisplayTitleFromFields(
      template.titlePluralTranslations,
      template.titleSingularTranslations,
      preferredLanguageCode
    )
    const newTab = createTemporaryOpenedDocumentTabSeed({
      displayName: input.displayName,
      documentId,
      parentDocumentId,
      tabLabel,
      templateIcon: template.icon,
      templateId: input.templateId,
      temporaryParentResolveDocumentIds: input.temporaryParentResolveDocumentIds,
      worldId: input.worldId,
      ...(input.initialTagsDraft === undefined
        ? {}
        : { initialTagsDraft: input.initialTagsDraft }),
      ...(input.placementId === undefined
        ? {}
        : { placementId: input.placementId })
    })
    if (openedDocumentSaveEpochMoved(epochAtStart)) {
      return documentId
    }
    const openMode = input.openMode ?? 'leftNavigate'
    await openPreparedDocumentTab({
      documentId,
      mode: openMode,
      navigationSerialAtStart: navigationSerial,
      newTab
    })
    return documentId
  }

  async function createTemporaryDocumentUnderParentDocument (
    sourceDocumentId: string,
    openMode?: T_faOpenedDocumentOpenMode | undefined
  ): Promise<string | null> {
    const epochAtStart = S_FaActiveProject().readProjectContentEpoch()
    if (!hasFaProjectContentEntityReaders()) {
      throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.createTemporaryError'))
    }
    const navigationSerialAtStart = readOpenedDocumentNavigationSerialForMode(openMode)

    const sourceDocumentResult = await ResultAsync.fromPromise(
      getFaProjectDocumentByIdForRenderer(sourceDocumentId),
      (error): unknown => error
    )
    if (sourceDocumentResult.isErr()) {
      return throwUnlessFaProjectContentMissingRow(sourceDocumentResult.error)
    }
    const sourceDocument = sourceDocumentResult.value

    const templateId = sourceDocument.templateId
    if (templateId === null || templateId === undefined) {
      return null
    }

    const temporaryParentResolveDocumentIds = await buildTemporaryDocumentParentResolveDocumentIds({
      getDocumentById: getFaProjectDocumentByIdForRenderer,
      startDocumentId: sourceDocumentId
    })
    await getFaProjectWorldByIdForRenderer(sourceDocument.worldId)
    const template = await getFaProjectDocumentTemplateByIdForRenderer(templateId)
    const preferredLanguageCode = resolvePreferredLanguageCodeForTemporaryDocument()
    const displayName = resolveProjectHierarchyTreeNewDocumentDisplayName({
      preferredLanguageCode,
      titlePluralTranslations: template.titlePluralTranslations,
      titleSingularTranslations: template.titleSingularTranslations
    })
    if (openedDocumentSaveEpochMoved(epochAtStart)) {
      return null
    }

    const documentId = await createTemporaryDocument({
      displayName,
      openMode,
      parentDocumentId: sourceDocumentId,
      placementId: sourceDocument.placementId,
      templateId,
      temporaryParentResolveDocumentIds,
      worldId: sourceDocument.worldId
    }, navigationSerialAtStart)
    if (openedDocumentSaveEpochMoved(epochAtStart)) {
      return null
    }
    return documentId
  }

  async function createTemporaryDocumentCopyFromSource (
    sourceDocumentId: string,
    openMode?: T_faOpenedDocumentOpenMode | undefined
  ): Promise<string | null> {
    const epochAtStart = S_FaActiveProject().readProjectContentEpoch()
    if (!hasFaProjectContentEntityReaders()) {
      throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.createTemporaryError'))
    }
    const navigationSerialAtStart = readOpenedDocumentNavigationSerialForMode(openMode)

    const sourceDocumentResult = await ResultAsync.fromPromise(
      getFaProjectDocumentByIdForRenderer(sourceDocumentId),
      (error): unknown => error
    )
    if (sourceDocumentResult.isErr()) {
      return throwUnlessFaProjectContentMissingRow(sourceDocumentResult.error)
    }
    const sourceDocument = sourceDocumentResult.value

    const templateId = sourceDocument.templateId
    if (templateId === null || templateId === undefined) {
      return null
    }

    await getFaProjectWorldByIdForRenderer(sourceDocument.worldId)
    const template = await getFaProjectDocumentTemplateByIdForRenderer(templateId)
    const preferredLanguageCode = resolvePreferredLanguageCodeForTemporaryDocument()
    const tabLabel = resolveFaProjectDocumentTemplateDisplayTitleFromFields(
      template.titlePluralTranslations,
      template.titleSingularTranslations,
      preferredLanguageCode
    )
    const documentId = crypto.randomUUID()
    const parentDocumentId = sourceDocument.parentDocumentId
    const temporaryParentResolveDocumentIds = parentDocumentId === null
      ? undefined
      : await buildTemporaryDocumentParentResolveDocumentIds({
        getDocumentById: getFaProjectDocumentByIdForRenderer,
        startDocumentId: parentDocumentId
      })
    const liveSourceResult = await ResultAsync.fromPromise(
      getFaProjectDocumentByIdForRenderer(sourceDocumentId),
      (error): unknown => error
    )
    if (liveSourceResult.isErr()) {
      return throwUnlessFaProjectContentMissingRow(liveSourceResult.error)
    }
    const liveSource = liveSourceResult.value
    const liveTemplateId = liveSource.templateId
    if (liveTemplateId === null || liveTemplateId === undefined) {
      return null
    }
    const liveTemplate = liveTemplateId === templateId
      ? template
      : await getFaProjectDocumentTemplateByIdForRenderer(liveTemplateId)
    const liveTabLabel = liveTemplateId === templateId
      ? tabLabel
      : resolveFaProjectDocumentTemplateDisplayTitleFromFields(
        liveTemplate.titlePluralTranslations,
        liveTemplate.titleSingularTranslations,
        preferredLanguageCode
      )
    if (liveSource.worldId !== sourceDocument.worldId) {
      await getFaProjectWorldByIdForRenderer(liveSource.worldId)
    }
    const liveParentDocumentId = liveSource.parentDocumentId
    const liveTemporaryParentResolveDocumentIds = liveParentDocumentId === parentDocumentId
      ? temporaryParentResolveDocumentIds
      : liveParentDocumentId === null
        ? undefined
        : await buildTemporaryDocumentParentResolveDocumentIds({
          getDocumentById: getFaProjectDocumentByIdForRenderer,
          startDocumentId: liveParentDocumentId
        })
    const displayName = resolveCopyOfDocumentDisplayName({
      formatCopyOfPrefix: (params) => {
        return i18n.global.t(
          'projectUI.projectHierarchyTree.contextMenu.copyOfDocumentNamePrefix',
          params
        )
      },
      originalDisplayName: liveSource.displayName
    })
    const newTab = createTemporaryOpenedDocumentTabCopySeed({
      displayName,
      documentBackgroundColor: liveSource.documentBackgroundColor,
      documentId,
      documentTextColor: liveSource.documentTextColor,
      isCategory: liveSource.isCategory,
      isDead: liveSource.isDead,
      isFinished: liveSource.isFinished,
      isMinor: liveSource.isMinor,
      parentDocumentId: liveParentDocumentId,
      tabLabel: liveTabLabel,
      templateIcon: liveTemplate.icon,
      templateId: liveTemplateId,
      temporaryParentResolveDocumentIds: liveTemporaryParentResolveDocumentIds,
      treeOrderNumber: liveSource.treeOrderNumber,
      extraClasses: liveSource.extraClasses,
      worldId: liveSource.worldId,
      ...(liveSource.placementId === undefined
        ? {}
        : { placementId: liveSource.placementId })
    })
    if (openedDocumentSaveEpochMoved(epochAtStart)) {
      return null
    }
    await openPreparedDocumentTab({
      documentId,
      mode: openMode ?? 'leftNavigate',
      navigationSerialAtStart,
      newTab
    })
    if (openedDocumentSaveEpochMoved(epochAtStart)) {
      return null
    }
    return documentId
  }

  async function createTemporaryDocumentCopyFromOpenedTab (
    sourceDocumentId: string
  ): Promise<string | null> {
    const epochAtStart = S_FaActiveProject().readProjectContentEpoch()
    const sourceTab = findTabByDocumentId(sourceDocumentId)
    if (sourceTab === null) {
      return null
    }

    if (!hasFaProjectContentEntityReaders()) {
      throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.createTemporaryError'))
    }
    const navigationSerialAtStart = readOpenedDocumentNavigationSerialForMode('leftNavigate')

    const actionContext = await resolveOpenedDocumentTabDocumentActionContext({
      ResultAsync,
      getDocumentById: getFaProjectDocumentByIdForRenderer,
      isMissingProjectContentRow: isFaProjectContentMissingRowError,
      sourceTab
    })
    if (actionContext === null) {
      return null
    }

    const { parentDocumentId, templateId, worldId } = actionContext
    await getFaProjectWorldByIdForRenderer(worldId)
    await getFaProjectDocumentTemplateByIdForRenderer(templateId)

    const documentId = crypto.randomUUID()
    const temporaryParentResolveDocumentIds = parentDocumentId === null
      ? undefined
      : await buildTemporaryDocumentParentResolveDocumentIds({
        getDocumentById: getFaProjectDocumentByIdForRenderer,
        startDocumentId: parentDocumentId
      })
    const liveSourceTab = findTabByDocumentId(sourceDocumentId) ?? sourceTab
    const parentEdited = liveSourceTab.parentDocumentIdDraft !== liveSourceTab.savedParentDocumentId
    const liveParentDocumentId = parentEdited
      ? resolveOpenedDocumentParentIdDraftForPersist(liveSourceTab.parentDocumentIdDraft)
      : parentDocumentId
    const liveTemporaryParentResolveDocumentIds = liveParentDocumentId === parentDocumentId
      ? temporaryParentResolveDocumentIds
      : liveParentDocumentId === null
        ? undefined
        : await buildTemporaryDocumentParentResolveDocumentIds({
          getDocumentById: getFaProjectDocumentByIdForRenderer,
          startDocumentId: liveParentDocumentId
        })
    const displayName = resolveCopyOfDocumentDisplayName({
      formatCopyOfPrefix: (params) => {
        return i18n.global.t(
          'projectUI.projectHierarchyTree.contextMenu.copyOfDocumentNamePrefix',
          params
        )
      },
      originalDisplayName: liveSourceTab.displayNameDraft
    })
    const newTab = createTemporaryOpenedDocumentTabCopySeed({
      displayName,
      documentBackgroundColor: liveSourceTab.documentBackgroundColorDraft,
      documentId,
      documentTextColor: liveSourceTab.documentTextColorDraft,
      isCategory: liveSourceTab.isCategoryDraft,
      isDead: liveSourceTab.isDeadDraft,
      isFinished: liveSourceTab.isFinishedDraft,
      isMinor: liveSourceTab.isMinorDraft,
      parentDocumentId: liveParentDocumentId,
      tabLabel: liveSourceTab.tabLabel,
      templateIcon: liveSourceTab.templateIcon,
      templateId,
      temporaryParentResolveDocumentIds: liveTemporaryParentResolveDocumentIds,
      treeOrderNumber: resolveOpenedDocumentTreeOrderNumberDraftForPersist(
        liveSourceTab.treeOrderNumberDraft
      ),
      extraClasses: resolveOpenedDocumentExtraClassesDraftForPersist(
        liveSourceTab.extraClassesDraft
      ),
      worldId,
      ...(actionContext.placementId === undefined
        ? {}
        : { placementId: actionContext.placementId })
    })
    if (openedDocumentSaveEpochMoved(epochAtStart)) {
      return null
    }
    await openPreparedDocumentTab({
      documentId,
      mode: 'leftNavigate',
      navigationSerialAtStart,
      newTab
    })
    if (openedDocumentSaveEpochMoved(epochAtStart)) {
      return null
    }
    return documentId
  }

  async function createTemporaryDocumentUnderParentFromOpenedTab (
    sourceDocumentId: string
  ): Promise<string | null> {
    const epochAtStart = S_FaActiveProject().readProjectContentEpoch()
    const sourceTab = findTabByDocumentId(sourceDocumentId)
    if (sourceTab === null) {
      return null
    }

    if (!hasFaProjectContentEntityReaders()) {
      throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.createTemporaryError'))
    }
    const navigationSerialAtStart = readOpenedDocumentNavigationSerialForMode('leftNavigate')

    const actionContext = await resolveOpenedDocumentTabDocumentActionContext({
      ResultAsync,
      getDocumentById: getFaProjectDocumentByIdForRenderer,
      isMissingProjectContentRow: isFaProjectContentMissingRowError,
      sourceTab
    })
    if (actionContext === null) {
      return null
    }

    const { templateId, worldId } = actionContext
    await getFaProjectWorldByIdForRenderer(worldId)
    const template = await getFaProjectDocumentTemplateByIdForRenderer(templateId)
    const preferredLanguageCode = resolvePreferredLanguageCodeForTemporaryDocument()
    const displayName = resolveProjectHierarchyTreeNewDocumentDisplayName({
      preferredLanguageCode,
      titlePluralTranslations: template.titlePluralTranslations,
      titleSingularTranslations: template.titleSingularTranslations
    })
    const temporaryParentResolveDocumentIds =
      await buildTemporaryDocumentParentResolveDocumentIdsFromOpenedTab({
        getDocumentById: getFaProjectDocumentByIdForRenderer,
        sourceTab
      })
    if (openedDocumentSaveEpochMoved(epochAtStart)) {
      return null
    }

    const documentId = await createTemporaryDocument({
      displayName,
      parentDocumentId: sourceTab.documentId,
      templateId,
      temporaryParentResolveDocumentIds,
      worldId,
      ...(actionContext.placementId === undefined
        ? {}
        : { placementId: actionContext.placementId })
    }, navigationSerialAtStart)
    if (openedDocumentSaveEpochMoved(epochAtStart)) {
      return null
    }
    return documentId
  }

  async function updateTemporaryDocumentParent (
    documentId: string,
    parentDocumentId: string | null
  ): Promise<void> {
    const epochAtStart = S_FaActiveProject().readProjectContentEpoch()
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (index === -1) {
      return
    }
    const current = tabs.value[index]
    if (current === undefined || !resolveOpenedDocumentTabIsTemporary(current.persistenceState)) {
      return
    }
    const api = window.faContentBridgeAPIs?.projectContent
    if (typeof api?.getDocumentById !== 'function') {
      return
    }
    if (parentDocumentId !== null) {
      await api.getDocumentById(parentDocumentId)
    }
    if (openedDocumentSaveEpochMoved(epochAtStart)) {
      return
    }
    const liveIndex = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (liveIndex === -1) {
      return
    }
    const liveTab = tabs.value[liveIndex]
    if (liveTab === undefined || !resolveOpenedDocumentTabIsTemporary(liveTab.persistenceState)) {
      return
    }
    const nextTabs = [...tabs.value]
    nextTabs[liveIndex] = applyTemporaryOpenedDocumentParent(liveTab, parentDocumentId)
    tabs.value = nextTabs
    queueOpenedDocumentsSnapshotPersist()
  }

  async function remapOpenedDocumentTabId (fromId: string, toId: string): Promise<void> {
    const epochAtStart = S_FaActiveProject().readProjectContentEpoch()
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, fromId)
    if (index === -1) {
      return
    }
    const current = tabs.value[index]
    if (current === undefined) {
      return
    }
    const nextTabs = [...tabs.value]
    nextTabs[index] = remapOpenedDocumentTabDocumentId(current, toId)
    tabs.value = nextTabs
    if (activeDocumentId.value === fromId) {
      activeDocumentId.value = toId
      claimOpenedDocumentNavigationSerial()
      await navigateToOpenedDocumentRoute(toId)
    }
    if (openedDocumentSaveEpochMoved(epochAtStart)) {
      return
    }
    queueOpenedDocumentsSnapshotPersist()
  }

  async function focusTab (documentId: string): Promise<void> {
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (index === -1) {
      return
    }
    const epochAtStart = S_FaActiveProject().readProjectContentEpoch()
    if (openedDocumentSaveEpochMoved(epochAtStart)) {
      return
    }
    const tab = tabs.value[index]
    activeDocumentId.value = documentId
    openedDocumentNavigationSerial += 1
    queueOpenedDocumentsSnapshotPersist()
    await navigateToOpenedDocumentRoute(documentId)
    if (openedDocumentSaveEpochMoved(epochAtStart)) {
      return
    }
    if (activeDocumentId.value !== documentId) {
      return
    }
    if (
      tab !== undefined &&
      !resolveOpenedDocumentTabIsTemporary(tab.persistenceState)
    ) {
      await recordFaOpenedDocumentLastOpenedBestEffort(documentId)
      if (openedDocumentSaveEpochMoved(epochAtStart)) {
        return
      }
      if (activeDocumentId.value !== documentId) {
        return
      }
      S_FaProjectHierarchyTree().bumpDocumentLastOpenedRefreshGeneration()
    }
  }

  function updateDisplayNameDraft (documentId: string, value: string): void {
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (index === -1) {
      return
    }
    const current = tabs.value[index]
    if (current === undefined) {
      return
    }
    const nextTabs = [...tabs.value]
    nextTabs[index] = applyFaOpenedDocumentDisplayNameDraft(current, value)
    tabs.value = nextTabs
    queueOpenedDocumentsSnapshotPersist()
  }

  function updateDocumentTextColorDraft (documentId: string, value: string): void {
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (index === -1) {
      return
    }
    const current = tabs.value[index]
    if (current === undefined) {
      return
    }
    const nextTabs = [...tabs.value]
    nextTabs[index] = applyFaOpenedDocumentTextColorDraft(current, value)
    tabs.value = nextTabs
    queueOpenedDocumentsSnapshotPersist()
  }

  function updateDocumentBackgroundColorDraft (documentId: string, value: string): void {
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (index === -1) {
      return
    }
    const current = tabs.value[index]
    if (current === undefined) {
      return
    }
    const nextTabs = [...tabs.value]
    nextTabs[index] = applyFaOpenedDocumentBackgroundColorDraft(current, value)
    tabs.value = nextTabs
    queueOpenedDocumentsSnapshotPersist()
  }

  function updateIsCategoryDraft (documentId: string, value: boolean): void {
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (index === -1) {
      return
    }
    const current = tabs.value[index]
    if (current === undefined) {
      return
    }
    const nextTabs = [...tabs.value]
    nextTabs[index] = applyFaOpenedDocumentIsCategoryDraft(current, value)
    tabs.value = nextTabs
    queueOpenedDocumentsSnapshotPersist()
  }

  function updateIsFinishedDraft (documentId: string, value: boolean): void {
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (index === -1) {
      return
    }
    const current = tabs.value[index]
    if (current === undefined) {
      return
    }
    const nextTabs = [...tabs.value]
    nextTabs[index] = applyFaOpenedDocumentIsFinishedDraft(current, value)
    tabs.value = nextTabs
    queueOpenedDocumentsSnapshotPersist()
  }

  function updateIsMinorDraft (documentId: string, value: boolean): void {
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (index === -1) {
      return
    }
    const current = tabs.value[index]
    if (current === undefined) {
      return
    }
    const nextTabs = [...tabs.value]
    nextTabs[index] = applyFaOpenedDocumentIsMinorDraft(current, value)
    tabs.value = nextTabs
    queueOpenedDocumentsSnapshotPersist()
  }

  function updateIsDeadDraft (documentId: string, value: boolean): void {
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (index === -1) {
      return
    }
    const current = tabs.value[index]
    if (current === undefined) {
      return
    }
    const nextTabs = [...tabs.value]
    nextTabs[index] = applyFaOpenedDocumentIsDeadDraft(current, value)
    tabs.value = nextTabs
    queueOpenedDocumentsSnapshotPersist()
  }

  function updateParentDocumentIdDraft (documentId: string, value: string): void {
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (index === -1) {
      return
    }
    const current = tabs.value[index]
    if (current === undefined) {
      return
    }
    const nextTabs = [...tabs.value]
    nextTabs[index] = applyFaOpenedDocumentParentIdDraft(current, value)
    tabs.value = nextTabs
    queueOpenedDocumentsSnapshotPersist()
  }

  function updateTreeOrderNumberDraft (documentId: string, value: string): void {
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (index === -1) {
      return
    }
    const current = tabs.value[index]
    if (current === undefined) {
      return
    }
    const nextTabs = [...tabs.value]
    nextTabs[index] = applyFaOpenedDocumentTreeOrderNumberDraft(current, value)
    tabs.value = nextTabs
    queueOpenedDocumentsSnapshotPersist()
  }

  function updateExtraClassesDraft (documentId: string, value: string): void {
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (index === -1) {
      return
    }
    const current = tabs.value[index]
    if (current === undefined) {
      return
    }
    const nextTabs = [...tabs.value]
    nextTabs[index] = applyFaOpenedDocumentExtraClassesDraft(current, value)
    tabs.value = nextTabs
    queueOpenedDocumentsSnapshotPersist()
  }

  function updateTagsDraft (
    documentId: string,
    value: import('app/types/I_faProjectTagDomain').I_faProjectDocumentTagAssignmentInput[]
  ): void {
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (index === -1) {
      return
    }
    const current = tabs.value[index]
    if (current === undefined) {
      return
    }
    const nextTabs = [...tabs.value]
    nextTabs[index] = applyFaOpenedDocumentTagsDraft(current, value)
    tabs.value = nextTabs
    queueOpenedDocumentsSnapshotPersist()
  }

  function syncOpenedDocumentParentFromHierarchy (
    documentId: string,
    parentDocumentId: string | null
  ): void {
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (index === -1) {
      return
    }
    const current = tabs.value[index]
    if (current === undefined) {
      return
    }
    const normalizedParentDocumentId = normalizeOpenedDocumentParentIdFromDb(parentDocumentId)
    const nextTabs = [...tabs.value]
    nextTabs[index] = applyFaOpenedDocumentParentIdSyncFromHierarchy(
      current,
      normalizedParentDocumentId
    )
    tabs.value = nextTabs
    queueOpenedDocumentsSnapshotPersist()
  }

  function setDocumentEditState (documentId: string, editState: boolean): void {
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (index === -1) {
      return
    }
    const current = tabs.value[index]
    if (current === undefined) {
      return
    }
    if (current.editState === editState) {
      return
    }
    const nextTabs = [...tabs.value]
    nextTabs[index] = applyFaOpenedDocumentTabEditState(current, editState)
    tabs.value = nextTabs
    queueOpenedDocumentsSnapshotPersist()
  }

  function enterDocumentEditMode (documentId: string): void {
    setDocumentEditState(documentId, true)
  }

  function commitOpenedDocumentSaveToLiveTab (
    saveAppliedTab: I_faOpenedDocumentTab,
    documentId: string,
    draftAtSaveStart: I_faOpenedDocumentTab,
    keepEditMode: boolean
  ): void {
    const liveIndex = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (liveIndex === -1) {
      return
    }
    const liveNow = tabs.value[liveIndex]
    if (liveNow === undefined) {
      return
    }
    const merged = mergeOpenedDocumentSaveOntoLiveTab(
      saveAppliedTab,
      liveNow,
      draftAtSaveStart
    )
    const editState = resolveOpenedDocumentEditStateAfterSave(
      keepEditMode,
      liveNow.editState
    )
    const mergedWithEditState = {
      ...merged,
      editState
    }
    const liveTabs = [...tabs.value]
    liveTabs[liveIndex] = mergedWithEditState
    tabs.value = liveTabs
  }

  function openedDocumentSaveEpochMoved (epochAtStart: number): boolean {
    if (S_FaActiveProject().isProjectReplacementInFlight()) {
      return true
    }
    return S_FaActiveProject().readProjectContentEpoch() !== epochAtStart
  }

  const openedDocumentSaveTailById = new Map<string, Promise<void>>()

  function clearOpenedDocumentSaveTail (
    documentId: string,
    settled: Promise<void>
  ): void {
    if (openedDocumentSaveTailById.get(documentId) === settled) {
      openedDocumentSaveTailById.delete(documentId)
    }
  }

  async function saveDocumentDisplayName (
    documentId: string,
    input: { keepEditMode: boolean }
  ): Promise<void> {
    const previous = openedDocumentSaveTailById.get(documentId)
    const run = previous === undefined
      ? runSaveDocumentDisplayName(documentId, input)
      : previous.then(() => {
        return runSaveDocumentDisplayName(documentId, input)
      })
    const settled = run.then(() => {
      clearOpenedDocumentSaveTail(documentId, settled)
    }, () => {
      clearOpenedDocumentSaveTail(documentId, settled)
    })
    openedDocumentSaveTailById.set(documentId, settled)
    return await run
  }

  async function runSaveDocumentDisplayName (
    documentId: string,
    input: { keepEditMode: boolean }
  ): Promise<void> {
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (index === -1) {
      throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.saveErrorMissingTab'))
    }
    const current = tabs.value[index]
    if (current === undefined) {
      throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.saveErrorMissingTab'))
    }
    if (!input.keepEditMode && typeof document !== 'undefined') {
      const activeElement = document.activeElement
      if (activeElement instanceof HTMLElement) {
        activeElement.blur()
      }
    }
    const epochAtStart = S_FaActiveProject().readProjectContentEpoch()

    if (resolveOpenedDocumentTabIsTemporary(current.persistenceState)) {
      if (
        !hasFaProjectDocumentCreateWriter() ||
        !hasFaProjectContentEntityReaders()
      ) {
        throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.saveError'))
      }
      const worldId = current.worldId
      const templateId = current.templateId
      if (worldId === undefined || templateId === undefined) {
        throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.saveError'))
      }
      if (openedDocumentExtraClassesDraftExceedsStorage(current.extraClassesDraft)) {
        throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.saveError'))
      }
      if (openedDocumentTreeOrderNumberDraftExceedsStorage(current.treeOrderNumberDraft)) {
        throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.saveError'))
      }
      const template = await getFaProjectDocumentTemplateByIdForRenderer(templateId)
      const preferredLanguageCode = resolvePreferredLanguageCodeForTemporaryDocument()
      const templateSingularTitle = resolveFaLocaleStringTranslation(
        template.titleSingularTranslations,
        preferredLanguageCode
      )
      const displayName = resolveTemporaryOpenedDocumentDisplayNameForSave({
        displayNameDraft: current.displayNameDraft,
        formatUnnamedFallback: (templateSingular) => {
          return i18n.global.t('globalFunctionality.faOpenedDocuments.unnamedDocumentFallback', {
            templateSingular
          })
        },
        templateSingularTitle
      })
      const parentResolveChain = current.temporaryParentResolveDocumentIds ?? []
      const draftParentDocumentId = resolveOpenedDocumentParentIdDraftForPersist(
        current.parentDocumentIdDraft
      )
      const resolvedParentDocumentId = await resolveTemporaryOpenedDocumentParentIdForSave({
        draftParentDocumentId,
        getDocumentById: getFaProjectDocumentByIdForRenderer,
        parentResolveChain
      })
      let createPlacementId = current.placementId
      if (resolvedParentDocumentId !== null) {
        const parentPlacementResult = await ResultAsync.fromPromise(
          getFaProjectDocumentByIdForRenderer(resolvedParentDocumentId),
          (error): unknown => error
        )
        if (parentPlacementResult.isErr()) {
          if (!isFaProjectContentMissingRowError(parentPlacementResult.error)) {
            const parentError = parentPlacementResult.error
            throw parentError instanceof Error
              ? parentError
              : new Error(String(parentError))
          }
        } else if (parentPlacementResult.value.placementId !== undefined) {
          createPlacementId = parentPlacementResult.value.placementId
        }
      }
      const temporarySaveResult = await ResultAsync.fromPromise(
        (async () => {
          if (openedDocumentSaveEpochMoved(epochAtStart)) {
            return
          }
          const savedDocument = await createFaProjectDocumentForRenderer({
            displayName,
            documentBackgroundColor: resolveOpenedDocumentAppearanceColorDraftForPersist(
              current.documentBackgroundColorDraft
            ),
            documentTextColor: resolveOpenedDocumentAppearanceColorDraftForPersist(
              current.documentTextColorDraft
            ),
            id: documentId,
            isCategory: current.isCategoryDraft,
            isFinished: current.isFinishedDraft,
            isMinor: current.isMinorDraft,
            isDead: current.isDeadDraft,
            parentDocumentId: resolvedParentDocumentId,
            treeOrderNumber: resolveOpenedDocumentTreeOrderNumberDraftForPersist(
              current.treeOrderNumberDraft
            ),
            extraClasses: resolveOpenedDocumentExtraClassesDraftForPersist(
              current.extraClassesDraft
            ),
            templateId,
            worldId,
            ...(createPlacementId === undefined
              ? {}
              : { placementId: createPlacementId })
          })
          if (openedDocumentSaveEpochMoved(epochAtStart)) {
            return
          }
          if (savedDocument.id !== documentId) {
            await remapOpenedDocumentTabId(documentId, savedDocument.id)
          }
          if (openedDocumentSaveEpochMoved(epochAtStart)) {
            return
          }
          const savedIndex = findOpenedDocumentTabIndexByDocumentId(
            tabs.value,
            savedDocument.id
          )
          const savedTab = savedIndex === -1 ? undefined : tabs.value[savedIndex]
          let temporaryTagSavedTab = current
          if (savedTab !== undefined) {
            const nextTabs = [...tabs.value]
            const promotedTab = promoteTemporaryOpenedDocumentTabAfterCreate(savedTab, {
              documentId: savedDocument.id,
              keepEditMode: input.keepEditMode,
              savedDisplayName: savedDocument.displayName,
              savedDocumentBackgroundColor: savedDocument.documentBackgroundColor,
              savedDocumentTextColor: savedDocument.documentTextColor,
              savedIsCategory: savedDocument.isCategory,
              savedIsFinished: savedDocument.isFinished,
              savedIsMinor: savedDocument.isMinor,
              savedIsDead: savedDocument.isDead,
              savedParentDocumentId: savedDocument.parentDocumentId,
              savedTreeOrderNumber: savedDocument.treeOrderNumber,
              savedExtraClasses: savedDocument.extraClasses
            })
            nextTabs[savedIndex] = keepOpenedDocumentDraftsTypedDuringSave(
              promotedTab,
              savedTab,
              current
            )
            if (openedDocumentSaveEpochMoved(epochAtStart)) {
              return
            }
            const temporaryTagBaseTab = nextTabs[savedIndex]!
            temporaryTagSavedTab = await persistFaOpenedDocumentTagsAfterSave(
              temporaryTagBaseTab,
              savedDocument.id
            )
            if (openedDocumentSaveEpochMoved(epochAtStart)) {
              return
            }
            commitOpenedDocumentSaveToLiveTab(
              temporaryTagSavedTab,
              savedDocument.id,
              current,
              input.keepEditMode
            )
          } else {
            temporaryTagSavedTab = await persistFaOpenedDocumentTagsAfterSave(
              current,
              savedDocument.id
            )
            if (openedDocumentSaveEpochMoved(epochAtStart)) {
              return
            }
          }
          schedulePersistSnapshot.flush()
          await flushPersistSnapshot()
          const hierarchyStore = S_FaProjectHierarchyTree()
          if (resolvedParentDocumentId !== null) {
            ensureProjectHierarchyTreeDocumentNodeHasChildrenForRefresh(
              hierarchyStore.treeData,
              resolvedParentDocumentId
            )
          }
          const treeRefreshNodeIds = collectProjectHierarchyTreeNewDocumentContainerNodeIdsForRefresh(
            hierarchyStore.treeData,
            {
              parentDocumentId: resolvedParentDocumentId,
              templateId,
              worldId
            }
          )
          if (treeRefreshNodeIds.length > 0) {
            hierarchyStore.refreshHierarchyTreeNodes(treeRefreshNodeIds)
          }
          await hierarchyStore.refreshLayout()
          if (openedDocumentSaveEpochMoved(epochAtStart)) {
            return
          }
          const temporaryTagRefreshIndex = findOpenedDocumentTabIndexByDocumentId(
            tabs.value,
            savedDocument.id
          )
          const temporaryTagRefreshTab = temporaryTagRefreshIndex === -1
            ? undefined
            : tabs.value[temporaryTagRefreshIndex]
          const temporarySavedTagsForRefresh = temporaryTagRefreshTab?.savedTags ??
            temporaryTagSavedTab.savedTags
          const temporaryNextSavedTagIds = (temporarySavedTagsForRefresh ?? []).map((tag) => tag.id)
          const temporaryPreviousSavedTagIds = (current.savedTags ?? []).map((tag) => tag.id)
          const temporaryTagRefreshNodeIds = resolveOpenedDocumentTagRefreshNodeIdsAfterSave(
            hierarchyStore.treeData,
            temporaryPreviousSavedTagIds,
            temporaryNextSavedTagIds
          )
          if (temporaryTagRefreshNodeIds !== null) {
            hierarchyStore.refreshHierarchyTreeNodes(temporaryTagRefreshNodeIds)
          }
          // Await MRU write before census bump so Project overview reload includes this doc.
          await recordFaOpenedDocumentLastOpenedBestEffort(savedDocument.id)
          if (openedDocumentSaveEpochMoved(epochAtStart)) {
            return
          }
          hierarchyStore.bumpDocumentCensusRefreshGeneration()
        })(),
        (error): unknown => error
      )
      if (temporarySaveResult.isErr()) {
        const error = temporarySaveResult.error
        console.error('[S_FaOpenedDocuments] saveDocumentDisplayName temporary failed', error)
        throw error instanceof Error
          ? error
          : new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.saveError'))
      }
      return
    }

    if (
      !hasFaProjectDocumentUpdateWriter() ||
      !hasFaProjectDocumentByIdReader()
    ) {
      throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.saveError'))
    }
    const trimmedDraft = current.displayNameDraft.trim()
    if (trimmedDraft.length === 0) {
      throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.saveErrorEmptyDraft'))
    }
    const persistedSaveResult = await ResultAsync.fromPromise(
      (async () => {
        if (openedDocumentSaveEpochMoved(epochAtStart)) {
          return
        }
        if (openedDocumentExtraClassesDraftExceedsStorage(current.extraClassesDraft)) {
          throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.saveError'))
        }
        if (openedDocumentTreeOrderNumberDraftExceedsStorage(current.treeOrderNumberDraft)) {
          throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.saveError'))
        }
        const savedIsCategoryBeforeSave = current.savedIsCategory
        const tagsChanged = current.tagsDraft !== undefined &&
          resolveOpenedDocumentTagsFingerprint(current.tagsDraft) !==
          resolveOpenedDocumentTagsFingerprint(current.savedTags ?? [])
        const previousSavedTagIds = (current.savedTags ?? []).map((tag) => tag.id)
        const parentChanged = current.parentDocumentIdDraft !== current.savedParentDocumentId
        let savedParentDocumentId = current.savedParentDocumentId
        let parentMoveTreeRefreshInput: {
          parentDocumentId: string | null
          templateId: string
          worldId: string
        } | null = null
        if (parentChanged) {
          if (typeof window.faContentBridgeAPIs?.projectContent?.moveDocumentInHierarchy !== 'function') {
            throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.saveError'))
          }
          const existingDocument = await getFaProjectDocumentByIdForRenderer(documentId)
          const placementId = existingDocument.placementId
          if (placementId === null) {
            throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.saveError'))
          }
          const targetParentDocumentId = resolveOpenedDocumentParentIdDraftForPersist(
            current.parentDocumentIdDraft
          )
          const existingParentDocumentId = existingDocument.parentDocumentId ?? null
          if (existingParentDocumentId !== targetParentDocumentId) {
            if (openedDocumentSaveEpochMoved(epochAtStart)) {
              return
            }
            const siblingsResult = await listFaProjectPlacementDocumentChildrenForRenderer({
              placementId,
              parentDocumentId: targetParentDocumentId
            })
            const targetSortOrder = resolveOpenedDocumentParentMoveAppendSortOrder(
              siblingsResult.items,
              documentId
            )
            if (openedDocumentSaveEpochMoved(epochAtStart)) {
              return
            }
            await moveFaProjectDocumentInHierarchyForRenderer({
              documentId,
              targetParentDocumentId,
              targetSortOrder
            })
          }
          savedParentDocumentId = normalizeOpenedDocumentParentIdFromDb(targetParentDocumentId)
          parentMoveTreeRefreshInput = {
            parentDocumentId: targetParentDocumentId,
            templateId: existingDocument.templateId ?? '',
            worldId: existingDocument.worldId
          }
        }
        if (openedDocumentSaveEpochMoved(epochAtStart)) {
          return
        }
        const savedDocument = await updateFaProjectDocumentForRenderer(documentId, {
          displayName: trimmedDraft,
          documentBackgroundColor: resolveOpenedDocumentAppearanceColorDraftForPersist(
            current.documentBackgroundColorDraft
          ),
          documentTextColor: resolveOpenedDocumentAppearanceColorDraftForPersist(
            current.documentTextColorDraft
          ),
          isCategory: current.isCategoryDraft,
          isFinished: current.isFinishedDraft,
          isMinor: current.isMinorDraft,
          isDead: current.isDeadDraft,
          treeOrderNumber: resolveOpenedDocumentTreeOrderNumberDraftForPersist(
            current.treeOrderNumberDraft
          ),
          extraClasses: resolveOpenedDocumentExtraClassesDraftForPersist(
            current.extraClassesDraft
          )
        })
        const savedDocumentTextColor = normalizeOpenedDocumentAppearanceColorFromDb(
          savedDocument.documentTextColor
        )
        const savedDocumentBackgroundColor = normalizeOpenedDocumentAppearanceColorFromDb(
          savedDocument.documentBackgroundColor
        )
        const savedIsCategory = savedDocument.isCategory === true
        const savedIsFinished = savedDocument.isFinished === true
        const savedIsMinor = savedDocument.isMinor === true
        const savedIsDead = savedDocument.isDead === true
        const savedTreeOrderNumber = savedDocument.treeOrderNumber
        const savedExtraClasses = normalizeOpenedDocumentExtraClassesFromDb(savedDocument.extraClasses)
        const nextTabs = [...tabs.value]
        if (openedDocumentSaveEpochMoved(epochAtStart)) {
          return
        }
        const savedIndex = findOpenedDocumentTabIndexByDocumentId(nextTabs, documentId)
        const liveTab = savedIndex === -1 ? undefined : nextTabs[savedIndex]
        let persistedTagSavedTab = current
        if (liveTab !== undefined) {
          nextTabs[savedIndex] = applyFaOpenedDocumentTabAfterDisplayNameSave(liveTab, {
            draftAtSaveStart: current,
            keepEditMode: input.keepEditMode,
            savedDisplayName: savedDocument.displayName,
            savedDocumentBackgroundColor,
            savedDocumentTextColor,
            savedIsCategory,
            savedIsFinished,
            savedIsMinor,
            savedIsDead,
            savedParentDocumentId,
            savedTreeOrderNumber,
            savedExtraClasses
          })
          if (openedDocumentSaveEpochMoved(epochAtStart)) {
            return
          }
          const persistedTagBaseTab = nextTabs[savedIndex]!
          persistedTagSavedTab = await persistFaOpenedDocumentTagsAfterSave(
            persistedTagBaseTab,
            documentId
          )
          if (openedDocumentSaveEpochMoved(epochAtStart)) {
            return
          }
          commitOpenedDocumentSaveToLiveTab(
            persistedTagSavedTab,
            documentId,
            current,
            input.keepEditMode
          )
        } else {
          persistedTagSavedTab = await persistFaOpenedDocumentTagsAfterSave(
            current,
            documentId
          )
          if (openedDocumentSaveEpochMoved(epochAtStart)) {
            return
          }
        }
        schedulePersistSnapshot.flush()
        await flushPersistSnapshot()
        const hierarchyStore = S_FaProjectHierarchyTree()
        const categoryChanged = savedIsCategoryBeforeSave !== savedIsCategory
        const tagRefreshIndex = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
        const tagRefreshTab = tagRefreshIndex === -1 ? undefined : tabs.value[tagRefreshIndex]
        const savedTagsForRefresh = tagRefreshTab?.savedTags ?? persistedTagSavedTab.savedTags
        const nextSavedTagIds = (savedTagsForRefresh ?? []).map((tag) => tag.id)
        const tagsPersistedChanged = openedDocumentSavedTagIdSetsDiffer(
          previousSavedTagIds,
          nextSavedTagIds
        )
        const willRefreshLayout = parentChanged || categoryChanged || tagsChanged || tagsPersistedChanged
        if (willRefreshLayout) {
          await hierarchyStore.refreshLayout()
          if (openedDocumentSaveEpochMoved(epochAtStart)) {
            return
          }
          await nextTick()
        }
        if (openedDocumentSaveEpochMoved(epochAtStart)) {
          return
        }
        if (tagsChanged || tagsPersistedChanged) {
          const loadedTagNodeIds = resolveOpenedDocumentTagRefreshNodeIdsAfterSave(
            hierarchyStore.treeData,
            previousSavedTagIds,
            nextSavedTagIds,
            true
          ) ?? []
          hierarchyStore.refreshHierarchyTreeNodes(loadedTagNodeIds)
        }
        hierarchyStore.refreshDocumentsInTree([documentId])
        if (parentMoveTreeRefreshInput !== null) {
          if (parentMoveTreeRefreshInput.parentDocumentId !== null) {
            ensureProjectHierarchyTreeDocumentNodeHasChildrenForRefresh(
              hierarchyStore.treeData,
              parentMoveTreeRefreshInput.parentDocumentId
            )
          }
          const targetContainerNodeIds = collectProjectHierarchyTreeNewDocumentContainerNodeIdsForRefresh(
            hierarchyStore.treeData,
            parentMoveTreeRefreshInput
          )
          if (targetContainerNodeIds.length > 0) {
            hierarchyStore.refreshHierarchyTreeNodes(targetContainerNodeIds)
          }
        }
      })(),
      (error): unknown => error
    )
    if (persistedSaveResult.isErr()) {
      const error = persistedSaveResult.error
      console.error('[S_FaOpenedDocuments] saveDocumentDisplayName failed', error)
      throw error instanceof Error
        ? error
        : new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.saveError'))
    }
  }

  function requestCloseTab (documentId: string): void {
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (index === -1) {
      return
    }
    const tab = tabs.value[index]
    if (tab === undefined) {
      return
    }
    if (tab.hasUnsavedChanges) {
      pendingCloseDocumentId.value = documentId
      return
    }
    void confirmDiscardAndClose(documentId)
  }

  function dismissPendingClose (): void {
    pendingCloseDocumentId.value = null
  }

  function requestDeleteDocument (documentId: string): void {
    pendingDeleteDocumentId.value = documentId
  }

  function dismissPendingDelete (): void {
    pendingDeleteDocumentId.value = null
  }

  async function confirmDeleteOpenedDocument (documentId: string): Promise<void> {
    try {
      await deleteOpenedDocument(documentId)
    } catch (error: unknown) {
      console.error('[FaOpenedDocuments] delete document failed', error)
      Notify.create({
        faSkipNotifyConsoleLog: true,
        group: false,
        message: i18n.global.t('globalFunctionality.faOpenedDocuments.deleteError'),
        type: 'negative'
      })
      return
    }
    pendingDeleteDocumentId.value = null
  }

  async function confirmDiscardAndClose (documentId: string): Promise<void> {
    const epochAtStart = S_FaActiveProject().readProjectContentEpoch()
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (index === -1) {
      pendingCloseDocumentId.value = null
      return
    }
    const wasActive = activeDocumentId.value === documentId
    const closeResult = removeFaOpenedDocumentTabAtIndex({
      activeDocumentId,
      lastRemovedIndex,
      removedIndex: index,
      tabs
    })
    pendingCloseDocumentId.value = null
    schedulePersistSnapshot.flush()
    if (wasActive) {
      if (closeResult.shouldNavigateHome) {
        claimOpenedDocumentNavigationSerial()
        await navigateToWorkspaceHomeRoute()
      } else if (closeResult.nextActiveDocumentId !== null) {
        claimOpenedDocumentNavigationSerial()
        await navigateToOpenedDocumentRoute(closeResult.nextActiveDocumentId)
      }
    }
    if (openedDocumentSaveEpochMoved(epochAtStart)) {
      return
    }
    await flushPersistSnapshot()
  }

  async function applyOpenedDocumentTabsBulkCloseResult (input: {
    closeResult: {
      nextActiveDocumentId: string | null
      nextTabs: I_faOpenedDocumentTab[]
      shouldNavigateHome: boolean
    }
    previousActiveDocumentId: string | null
    previousTabs: readonly I_faOpenedDocumentTab[]
  }): Promise<void> {
    const epochAtStart = S_FaActiveProject().readProjectContentEpoch()
    if (input.closeResult.nextTabs.length === input.previousTabs.length) {
      return
    }

    tabs.value = input.closeResult.nextTabs
    activeDocumentId.value = input.closeResult.nextActiveDocumentId
    if (
      input.previousActiveDocumentId !== null &&
      input.previousActiveDocumentId !== input.closeResult.nextActiveDocumentId
    ) {
      lastRemovedIndex.value = findOpenedDocumentTabIndexByDocumentId(
        input.previousTabs,
        input.previousActiveDocumentId
      )
    }
    pendingCloseDocumentId.value = null
    schedulePersistSnapshot.flush()
    if (input.previousActiveDocumentId !== input.closeResult.nextActiveDocumentId) {
      if (input.closeResult.shouldNavigateHome) {
        claimOpenedDocumentNavigationSerial()
        await navigateToWorkspaceHomeRoute()
      } else if (input.closeResult.nextActiveDocumentId !== null) {
        claimOpenedDocumentNavigationSerial()
        await navigateToOpenedDocumentRoute(input.closeResult.nextActiveDocumentId)
      }
    }
    if (openedDocumentSaveEpochMoved(epochAtStart)) {
      return
    }
    await flushPersistSnapshot()
  }

  async function closeTabsWithoutChangesExcept (exceptDocumentId: string): Promise<void> {
    await closeTabsWithoutChangesMatching(exceptDocumentId)
  }

  async function closeAllTabsWithoutChanges (): Promise<void> {
    await closeTabsWithoutChangesMatching(null)
  }

  async function closeTabsWithoutChangesMatching (
    exceptDocumentId: string | null
  ): Promise<void> {
    const previousTabs = tabs.value
    const previousActiveDocumentId = activeDocumentId.value
    const closeResult = resolveOpenedDocumentTabsAfterBulkCloseWithoutChanges({
      activeDocumentId: previousActiveDocumentId,
      exceptDocumentId,
      tabs: previousTabs
    })
    await applyOpenedDocumentTabsBulkCloseResult({
      closeResult,
      previousActiveDocumentId,
      previousTabs
    })
  }

  async function forceCloseAllTabsExcept (exceptDocumentId: string): Promise<void> {
    await forceCloseTabsMatching(exceptDocumentId)
  }

  async function forceCloseAllTabs (): Promise<void> {
    await forceCloseTabsMatching(null)
  }

  async function forceCloseTabsMatching (exceptDocumentId: string | null): Promise<void> {
    const previousTabs = tabs.value
    const previousActiveDocumentId = activeDocumentId.value
    const closeResult = resolveOpenedDocumentTabsAfterForceClose({
      activeDocumentId: previousActiveDocumentId,
      exceptDocumentId,
      tabs: previousTabs
    })
    await applyOpenedDocumentTabsBulkCloseResult({
      closeResult,
      previousActiveDocumentId,
      previousTabs
    })
  }

  async function deleteOpenedDocument (documentId: string): Promise<void> {
    const pendingSave = openedDocumentSaveTailById.get(documentId)
    if (pendingSave !== undefined) {
      await pendingSave
    }
    const epochAtStart = S_FaActiveProject().readProjectContentEpoch()
    const hierarchyStore = S_FaProjectHierarchyTree()
    const treeRefreshNodeIds = collectProjectHierarchyTreeDocumentDeleteRefreshNodeIds(
      hierarchyStore.treeData,
      documentId
    )
    const openTab = findTabByDocumentId(documentId)
    const shouldDeletePersistedDocumentRow =
      openTab === null ||
      !resolveOpenedDocumentTabIsTemporary(openTab.persistenceState)
    if (shouldDeletePersistedDocumentRow) {
      await deleteFaProjectDocumentForRenderer(documentId)
    }
    if (openedDocumentSaveEpochMoved(epochAtStart)) {
      return
    }
    removeProjectHierarchyTreeDocumentNodesByDocumentIds(
      hierarchyStore.treeData,
      [documentId]
    )
    if (treeRefreshNodeIds.length > 0) {
      hierarchyStore.refreshHierarchyTreeNodes(treeRefreshNodeIds)
    }
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    const removedOpenTab = index !== -1
    if (removedOpenTab) {
      const wasActive = activeDocumentId.value === documentId
      const closeResult = removeFaOpenedDocumentTabAtIndex({
        activeDocumentId,
        lastRemovedIndex,
        removedIndex: index,
        tabs
      })
      pendingCloseDocumentId.value = null
      pendingDeleteDocumentId.value = null
      schedulePersistSnapshot.flush()
      if (wasActive) {
        if (closeResult.shouldNavigateHome) {
          claimOpenedDocumentNavigationSerial()
          await navigateToWorkspaceHomeRoute()
        } else if (closeResult.nextActiveDocumentId !== null) {
          claimOpenedDocumentNavigationSerial()
          await navigateToOpenedDocumentRoute(closeResult.nextActiveDocumentId)
        }
      }
      if (openedDocumentSaveEpochMoved(epochAtStart)) {
        return
      }
    }
    const parentRefreshTabs = await refreshOpenedDocumentTabsAfterDeletedParent({
      deletedDocumentId: documentId,
      getDocumentById: getFaProjectDocumentByIdForRenderer,
      hasDocumentReader: hasFaProjectDocumentByIdReader(),
      readLiveTabs: () => tabs.value
    })
    if (openedDocumentSaveEpochMoved(epochAtStart)) {
      return
    }
    if (parentRefreshTabs !== null) {
      tabs.value = parentRefreshTabs
      schedulePersistSnapshot.flush()
    }
    if (shouldDeletePersistedDocumentRow) {
      // Same as temp save promote: layout carries placement documentCount / categoryCount.
      await hierarchyStore.refreshLayout()
      if (openedDocumentSaveEpochMoved(epochAtStart)) {
        return
      }
      hierarchyStore.bumpDocumentCensusRefreshGeneration()
    }
    if (removedOpenTab || parentRefreshTabs !== null) {
      await flushPersistSnapshot()
    }
    if (openedDocumentSaveEpochMoved(epochAtStart)) {
      return
    }
    Notify.create({
      group: false,
      message: i18n.global.t('globalFunctionality.faOpenedDocuments.deleteSuccess'),
      type: 'positive'
    })
  }

  function findTabByDocumentId (documentId: string): I_faOpenedDocumentTab | null {
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (index === -1) {
      return null
    }
    return tabs.value[index] ?? null
  }

  function syncActiveDocumentIdFromWorkspaceRoute (routePath: string): void {
    if (!hydrationComplete.value) {
      return
    }
    const nextActiveDocumentId = resolveFaOpenedDocumentsActiveDocumentSyncTarget({
      currentActiveDocumentId: activeDocumentId.value,
      routeDocumentId: resolveFaDocumentWorkspaceRouteDocumentId(routePath),
      routePath,
      tabs: tabs.value
    })
    if (nextActiveDocumentId === activeDocumentId.value) {
      return
    }
    activeDocumentId.value = nextActiveDocumentId
    queueOpenedDocumentsSnapshotPersist()
    if (nextActiveDocumentId === null) {
      return
    }
    const syncedTab = findTabByDocumentId(nextActiveDocumentId)
    if (
      syncedTab === null ||
      resolveOpenedDocumentTabIsTemporary(syncedTab.persistenceState)
    ) {
      return
    }
    const epochAtStart = S_FaActiveProject().readProjectContentEpoch()
    void recordLastOpenedAfterWorkspaceRouteSync(nextActiveDocumentId, epochAtStart)
  }

  async function recordLastOpenedAfterWorkspaceRouteSync (
    documentId: string,
    epochAtStart: number
  ): Promise<void> {
    await recordFaOpenedDocumentLastOpenedBestEffort(documentId)
    if (openedDocumentSaveEpochMoved(epochAtStart)) {
      return
    }
    if (activeDocumentId.value !== documentId) {
      return
    }
    S_FaProjectHierarchyTree().bumpDocumentLastOpenedRefreshGeneration()
  }

  function moveDocumentTab (documentId: string, direction: 'left' | 'right'): void {
    const offset = direction === 'left' ? -1 : 1
    const nextTabs = moveOpenedDocumentTabByOffset(tabs.value, documentId, offset)
    if (nextTabs === null) {
      return
    }

    tabs.value = nextTabs
  }

  function reorderDocumentTabs (fromIndex: number, toIndex: number): void {
    const nextTabs = reorderOpenedDocumentTabsByIndex(tabs.value, fromIndex, toIndex)
    if (nextTabs === null) {
      return
    }

    tabs.value = nextTabs
  }

  function moveActiveDocumentTab (direction: 'left' | 'right'): void {
    const documentId = activeDocumentId.value
    if (documentId === null) {
      return
    }

    moveDocumentTab(documentId, direction)
  }

  function replaceSessionForComponentTesting (input: {
    activeDocumentId: string | null
    tabs: I_faOpenedDocumentTab[]
  }): void {
    tabs.value = duplicateOpenedDocumentTabs(input.tabs)
    activeDocumentId.value = input.activeDocumentId
    hydrationComplete.value = true
  }

  function replaceOpenedDocumentTabs (nextTabs: I_faOpenedDocumentTab[]): void {
    tabs.value = duplicateOpenedDocumentTabs(nextTabs)
  }

  watch(
    () => [tabs.value, activeDocumentId.value] as const,
    () => {
      if (!hydrationComplete.value) {
        return
      }
      queueOpenedDocumentsSnapshotPersist()
    },
    {
      deep: true,
      flush: 'sync'
    }
  )

  const publishedActiveDocumentId = readonly(activeDocumentId)
  const publishedHydrationComplete = readonly(hydrationComplete)
  const publishedPendingCloseDocumentId = readonly(pendingCloseDocumentId)
  const publishedPendingDeleteDocumentId = readonly(pendingDeleteDocumentId)
  const publishedTabs = readonly(tabs)
  return {
    activeDocumentId: publishedActiveDocumentId,
    closeAllTabsWithoutChanges,
    closeTabsWithoutChangesExcept,
    confirmDiscardAndClose,
    confirmDeleteOpenedDocument,
    deleteOpenedDocument,
    dismissPendingClose,
    dismissPendingDelete,
    findTabByDocumentId,
    flushPersistSnapshot,
    flushPersistSnapshotBeforeProjectReplacement,
    focusTab,
    forceCloseAllTabs,
    forceCloseAllTabsExcept,
    hydrateFromProjectDatabase,
    hydrationComplete: publishedHydrationComplete,
    clearSession,
    createTemporaryDocument,
    createTemporaryDocumentCopyFromOpenedTab,
    createTemporaryDocumentCopyFromSource,
    createTemporaryDocumentUnderParentDocument,
    createTemporaryDocumentUnderParentFromOpenedTab,
    enterDocumentEditMode,
    moveActiveDocumentTab,
    moveDocumentTab,
    reorderDocumentTabs,
    replaceOpenedDocumentTabs,
    openFromTree,
    pendingCloseDocumentId: publishedPendingCloseDocumentId,
    pendingDeleteDocumentId: publishedPendingDeleteDocumentId,
    replaceSessionForComponentTesting,
    remapOpenedDocumentTabId,
    requestCloseTab,
    requestDeleteDocument,
    saveDocumentDisplayName,
    setDocumentEditState,
    syncActiveDocumentIdFromWorkspaceRoute,
    syncOpenedDocumentParentFromHierarchy,
    tabs: publishedTabs,
    updateDisplayNameDraft,
    updateDocumentBackgroundColorDraft,
    updateDocumentTextColorDraft,
    updateIsCategoryDraft,
    updateIsFinishedDraft,
    updateIsMinorDraft,
    updateIsDeadDraft,
    updateParentDocumentIdDraft,
    updateTreeOrderNumberDraft,
    updateExtraClassesDraft,
    updateTagsDraft,
    updateTemporaryDocumentParent
  }
})
