import { defineStore } from 'pinia'
import debounce from 'lodash-es/debounce.js'
import { Notify } from 'quasar'
import { readonly, ref, watch } from 'vue'

import type { Ref } from 'vue'

import type {
  I_faOpenedDocumentTab,
  I_faOpenedDocumentTreeOpenMeta,
  I_faTemporaryOpenedDocumentCreateInput,
  T_faOpenedDocumentOpenMode
} from 'app/types/I_faOpenedDocumentsDomain'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import { FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT } from 'app/types/I_faOpenedDocumentsDomain'
import { i18n } from 'app/i18n/externalFileLoader'
import {
  navigateToOpenedDocumentRoute,
  navigateToWorkspaceHomeRoute
} from 'app/src/scripts/appInternals/faAppRouterSession_manager'
import {
  applyFaOpenedDocumentBackgroundColorDraft,
  applyFaOpenedDocumentDisplayNameDraft,
  applyFaOpenedDocumentTabAfterDisplayNameSave,
  applyFaOpenedDocumentTabEditState,
  applyFaOpenedDocumentTextColorDraft,
  buildFaOpenedDocumentsSnapshot,
  createFaOpenedDocumentTabFromOpenMeta,
  hydrateFaOpenedDocumentsTabsFromSnapshot,
  removeFaOpenedDocumentTabAtIndex,
  resolveFaOpenedDocumentOpenFromTree,
  resolveFaOpenedDocumentsActiveDocumentSyncTarget
} from 'app/src/stores/scripts/faOpenedDocumentsStoreActions'
import { reconcileTemporaryOpenedDocumentTabFromSnapshot } from 'app/src/stores/scripts/faOpenedDocumentsTemporarySessionWiring'
import {
  duplicateOpenedDocumentTabs,
  findOpenedDocumentTabIndexByDocumentId,
  moveOpenedDocumentTabByOffset,
  resolveOpenedDocumentTabsAfterBulkCloseWithoutChanges,
  resolveOpenedDocumentTabsAfterForceClose
} from 'app/src/scripts/openedDocuments/functions/openedDocumentTabDomain'
import {
  normalizeOpenedDocumentAppearanceColorFromDb,
  recomputeOpenedDocumentTabHasUnsavedChanges,
  resolveOpenedDocumentAppearanceColorDraftForPersist
} from 'app/src/scripts/openedDocuments/openedDocumentTabAppearanceWiring'
import {
  applyTemporaryOpenedDocumentParent,
  buildTemporaryDocumentParentResolveDocumentIds,
  buildTemporaryDocumentParentResolveDocumentIdsFromOpenedTab,
  createTemporaryOpenedDocumentTabCopySeed,
  createTemporaryOpenedDocumentTabSeed,
  promoteTemporaryOpenedDocumentTabAfterCreate,
  remapOpenedDocumentTabDocumentId,
  resolveOpenedDocumentTabIsTemporary,
  resolveTemporaryDocumentParentDocumentIdForSave,
  resolveTemporaryOpenedDocumentDisplayNameForSave,
  resolveTemporaryOpenedDocumentParentDocumentId
} from 'app/src/scripts/openedDocuments/functions/openedDocumentTemporaryDomain'
import { resolveOpenedDocumentTabDocumentActionContext } from 'app/src/scripts/openedDocuments/functions/openedDocumentTabDocumentActionContext'
import { resolveFaDocumentWorkspaceRouteDocumentId } from 'app/src/scripts/appRouting/appRouting_manager'
import { collectProjectHierarchyTreeDocumentDeleteRefreshNodeIds, collectProjectHierarchyTreeNewDocumentContainerNodeIdsForRefresh, ensureProjectHierarchyTreeDocumentNodeHasChildrenForRefresh, removeProjectHierarchyTreeDocumentNodesByDocumentIds } from 'app/src/components/projectUI/ProjectHierarchyTree/functions/projectHierarchyTreeDocumentParentBucket'
import { resolveProjectHierarchyTreeNewDocumentDisplayName } from 'app/src/components/projectUI/ProjectHierarchyTree/functions/projectHierarchyTreeAddNewDocumentLabel'
import { resolveFaProjectDocumentTemplateDisplayTitleFromFields } from 'app/src/scripts/documentTemplates/faProjectDocumentTemplateTitle_manager'
import { resolveFaLocaleStringTranslation } from 'app/src/scripts/localeTranslations/faLocaleStringTranslations_manager'
import { resolveCopyOfDocumentDisplayName } from 'app/src/scripts/openedDocuments/functions/resolveCopyOfDocumentDisplayName'
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

  function buildCurrentSnapshot () {
    return buildFaOpenedDocumentsSnapshot({
      activeDocumentId: activeDocumentId.value,
      tabs: tabs.value
    })
  }

  const schedulePersistSnapshot = debounce(() => {
    void flushPersistSnapshot()
  }, OPENED_DOCUMENTS_PERSIST_DEBOUNCE_MS)

  async function flushPersistSnapshot (): Promise<boolean> {
    if (!S_FaActiveProject().hasActiveProject) {
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

  function resetSessionState (): void {
    tabs.value = []
    activeDocumentId.value = null
    lastRemovedIndex.value = -1
    pendingCloseDocumentId.value = null
    pendingDeleteDocumentId.value = null
    hydrationComplete.value = false
    schedulePersistSnapshot.cancel()
  }

  async function validateAndFilterTabsFromSnapshot (): Promise<void> {
    const api = window.faContentBridgeAPIs?.projectContent
    if (typeof api?.getDocumentById !== 'function') {
      return
    }
    const nextTabs: I_faOpenedDocumentTab[] = []
    for (const tab of tabs.value) {
      if (resolveOpenedDocumentTabIsTemporary(tab.persistenceState)) {
        const reconciledTab = await reconcileTemporaryOpenedDocumentTabFromSnapshot(tab, api)
        if (reconciledTab !== null) {
          nextTabs.push(reconciledTab)
        }
        continue
      }

      try {
        const doc = await api.getDocumentById(tab.documentId)
        const savedDisplayName = doc.displayName
        const savedDocumentTextColor = normalizeOpenedDocumentAppearanceColorFromDb(
          doc.documentTextColor
        )
        const savedDocumentBackgroundColor = normalizeOpenedDocumentAppearanceColorFromDb(
          doc.documentBackgroundColor
        )
        const displayNameDraft = tab.hasUnsavedChanges ? tab.displayNameDraft : savedDisplayName
        const documentTextColorDraft = tab.hasUnsavedChanges
          ? tab.documentTextColorDraft
          : savedDocumentTextColor
        const documentBackgroundColorDraft = tab.hasUnsavedChanges
          ? tab.documentBackgroundColorDraft
          : savedDocumentBackgroundColor
        const reconciledTab: I_faOpenedDocumentTab = {
          ...tab,
          displayNameDraft,
          documentBackgroundColorDraft,
          documentTextColorDraft,
          savedDisplayName,
          savedDocumentBackgroundColor,
          savedDocumentTextColor,
          worldId: tab.worldId ?? doc.worldId
        }
        nextTabs.push({
          ...reconciledTab,
          hasUnsavedChanges: recomputeOpenedDocumentTabHasUnsavedChanges(reconciledTab)
        })
      } catch {
        // Drop tabs whose document row no longer exists.
      }
    }
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
    const snapshot = await faOpenedDocumentsRefreshSnapshotFromBridge()
    const resolved = snapshot ?? FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT
    const hydrated = hydrateFaOpenedDocumentsTabsFromSnapshot(resolved)
    tabs.value = hydrated.tabs
    activeDocumentId.value = hydrated.activeDocumentId
    await validateAndFilterTabsFromSnapshot()
    hydrationComplete.value = true
    if (activeDocumentId.value !== null) {
      await navigateToOpenedDocumentRoute(activeDocumentId.value)
    }
  }

  async function clearSession (): Promise<void> {
    schedulePersistSnapshot.cancel()
    if (persistInFlight !== null) {
      await persistInFlight
    }
    resetSessionState()
  }

  async function seedDocumentBaselineIfNeeded (
    documentId: string,
    treeMeta: I_faOpenedDocumentTreeOpenMeta
  ): Promise<I_faOpenedDocumentTab | null> {
    const api = window.faContentBridgeAPIs?.projectContent
    if (typeof api?.getDocumentById !== 'function') {
      return null
    }
    try {
      const doc = await api.getDocumentById(documentId)
      return createFaOpenedDocumentTabFromOpenMeta({
        documentId,
        displayName: doc.displayName,
        documentBackgroundColor: doc.documentBackgroundColor,
        documentTextColor: doc.documentTextColor,
        treeMeta,
        worldId: doc.worldId
      })
    } catch {
      return null
    }
  }

  async function openFromTree (
    documentId: string,
    mode: T_faOpenedDocumentOpenMode,
    treeMeta: I_faOpenedDocumentTreeOpenMeta
  ): Promise<void> {
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
    const openResult = resolveFaOpenedDocumentOpenFromTree({
      activeDocumentId,
      documentId,
      mode,
      newTab,
      tabs
    })
    schedulePersistSnapshot()
    if (openResult.shouldNavigate && openResult.navigateDocumentId !== null) {
      await navigateToOpenedDocumentRoute(openResult.navigateDocumentId)
    }
  }

  function resolvePreferredLanguageCodeForTemporaryDocument (): T_faUserSettingsLanguageCode {
    return S_FaUserSettings().settings?.languageCode ?? 'en-US'
  }

  async function createTemporaryDocument (
    input: I_faTemporaryOpenedDocumentCreateInput
  ): Promise<string> {
    const api = window.faContentBridgeAPIs?.projectContent
    if (
      typeof api?.getDocumentTemplateById !== 'function' ||
      typeof api?.getWorldById !== 'function' ||
      typeof api?.getDocumentById !== 'function'
    ) {
      throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.createTemporaryError'))
    }

    const documentId = input.documentId ?? crypto.randomUUID()
    const parentDocumentId = resolveTemporaryOpenedDocumentParentDocumentId(input)
    if (parentDocumentId !== null) {
      const parentTabIndex = findOpenedDocumentTabIndexByDocumentId(tabs.value, parentDocumentId)
      const parentTab = parentTabIndex === -1 ? undefined : tabs.value[parentTabIndex]
      const parentIsOpenTemporary = parentTab !== undefined &&
        resolveOpenedDocumentTabIsTemporary(parentTab.persistenceState)
      if (!parentIsOpenTemporary) {
        await api.getDocumentById(parentDocumentId)
      }
    }
    await api.getWorldById(input.worldId)
    const template = await api.getDocumentTemplateById(input.templateId)
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
      worldId: input.worldId
    })
    const openMode = input.openMode ?? 'leftNavigate'
    const openResult = resolveFaOpenedDocumentOpenFromTree({
      activeDocumentId,
      documentId,
      mode: openMode,
      newTab,
      tabs
    })
    schedulePersistSnapshot()
    if (openResult.shouldNavigate && openResult.navigateDocumentId !== null) {
      await navigateToOpenedDocumentRoute(openResult.navigateDocumentId)
    }
    return documentId
  }

  async function createTemporaryDocumentUnderParentDocument (
    sourceDocumentId: string
  ): Promise<string | null> {
    const api = window.faContentBridgeAPIs?.projectContent
    if (
      typeof api?.getDocumentById !== 'function' ||
      typeof api?.getDocumentTemplateById !== 'function' ||
      typeof api?.getWorldById !== 'function'
    ) {
      throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.createTemporaryError'))
    }

    let sourceDocument
    try {
      sourceDocument = await api.getDocumentById(sourceDocumentId)
    } catch {
      return null
    }

    const templateId = sourceDocument.templateId
    if (templateId === null || templateId === undefined) {
      return null
    }

    const temporaryParentResolveDocumentIds = await buildTemporaryDocumentParentResolveDocumentIds({
      getDocumentById: api.getDocumentById,
      startDocumentId: sourceDocumentId
    })
    await api.getWorldById(sourceDocument.worldId)
    const template = await api.getDocumentTemplateById(templateId)
    const preferredLanguageCode = resolvePreferredLanguageCodeForTemporaryDocument()
    const displayName = resolveProjectHierarchyTreeNewDocumentDisplayName({
      preferredLanguageCode,
      titlePluralTranslations: template.titlePluralTranslations,
      titleSingularTranslations: template.titleSingularTranslations
    })

    const documentId = await createTemporaryDocument({
      displayName,
      parentDocumentId: sourceDocumentId,
      templateId,
      temporaryParentResolveDocumentIds,
      worldId: sourceDocument.worldId
    })
    return documentId
  }

  async function createTemporaryDocumentCopyFromSource (
    sourceDocumentId: string
  ): Promise<string | null> {
    const api = window.faContentBridgeAPIs?.projectContent
    if (
      typeof api?.getDocumentById !== 'function' ||
      typeof api?.getDocumentTemplateById !== 'function' ||
      typeof api?.getWorldById !== 'function'
    ) {
      throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.createTemporaryError'))
    }

    let sourceDocument
    try {
      sourceDocument = await api.getDocumentById(sourceDocumentId)
    } catch {
      return null
    }

    const templateId = sourceDocument.templateId
    if (templateId === null || templateId === undefined) {
      return null
    }

    await api.getWorldById(sourceDocument.worldId)
    const template = await api.getDocumentTemplateById(templateId)
    const preferredLanguageCode = resolvePreferredLanguageCodeForTemporaryDocument()
    const tabLabel = resolveFaProjectDocumentTemplateDisplayTitleFromFields(
      template.titlePluralTranslations,
      template.titleSingularTranslations,
      preferredLanguageCode
    )
    const displayName = resolveCopyOfDocumentDisplayName({
      formatCopyOfPrefix: (params) => {
        return i18n.global.t(
          'projectUI.projectHierarchyTree.contextMenu.copyOfDocumentNamePrefix',
          params
        )
      },
      originalDisplayName: sourceDocument.displayName
    })
    const documentId = crypto.randomUUID()
    const parentDocumentId = sourceDocument.parentDocumentId
    const temporaryParentResolveDocumentIds = parentDocumentId === null
      ? undefined
      : await buildTemporaryDocumentParentResolveDocumentIds({
        getDocumentById: api.getDocumentById,
        startDocumentId: parentDocumentId
      })
    const newTab = createTemporaryOpenedDocumentTabCopySeed({
      displayName,
      documentBackgroundColor: sourceDocument.documentBackgroundColor,
      documentId,
      documentTextColor: sourceDocument.documentTextColor,
      parentDocumentId,
      tabLabel,
      templateIcon: template.icon,
      templateId,
      temporaryParentResolveDocumentIds,
      worldId: sourceDocument.worldId
    })
    const openResult = resolveFaOpenedDocumentOpenFromTree({
      activeDocumentId,
      documentId,
      mode: 'leftNavigate',
      newTab,
      tabs
    })
    schedulePersistSnapshot()
    if (openResult.shouldNavigate && openResult.navigateDocumentId !== null) {
      await navigateToOpenedDocumentRoute(openResult.navigateDocumentId)
    }
    return documentId
  }

  async function createTemporaryDocumentCopyFromOpenedTab (
    sourceDocumentId: string
  ): Promise<string | null> {
    const sourceTab = findTabByDocumentId(sourceDocumentId)
    if (sourceTab === null) {
      return null
    }

    const api = window.faContentBridgeAPIs?.projectContent
    if (
      typeof api?.getDocumentById !== 'function' ||
      typeof api?.getDocumentTemplateById !== 'function' ||
      typeof api?.getWorldById !== 'function'
    ) {
      throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.createTemporaryError'))
    }

    const actionContext = await resolveOpenedDocumentTabDocumentActionContext({
      getDocumentById: api.getDocumentById,
      sourceTab
    })
    if (actionContext === null) {
      return null
    }

    const { parentDocumentId, templateId, worldId } = actionContext
    await api.getWorldById(worldId)
    await api.getDocumentTemplateById(templateId)

    const displayName = resolveCopyOfDocumentDisplayName({
      formatCopyOfPrefix: (params) => {
        return i18n.global.t(
          'projectUI.projectHierarchyTree.contextMenu.copyOfDocumentNamePrefix',
          params
        )
      },
      originalDisplayName: sourceTab.displayNameDraft
    })
    const documentId = crypto.randomUUID()
    const temporaryParentResolveDocumentIds = parentDocumentId === null
      ? undefined
      : await buildTemporaryDocumentParentResolveDocumentIds({
        getDocumentById: api.getDocumentById,
        startDocumentId: parentDocumentId
      })
    const newTab = createTemporaryOpenedDocumentTabCopySeed({
      displayName,
      documentBackgroundColor: sourceTab.documentBackgroundColorDraft,
      documentId,
      documentTextColor: sourceTab.documentTextColorDraft,
      parentDocumentId,
      tabLabel: sourceTab.tabLabel,
      templateIcon: sourceTab.templateIcon,
      templateId,
      temporaryParentResolveDocumentIds,
      worldId
    })
    const openResult = resolveFaOpenedDocumentOpenFromTree({
      activeDocumentId,
      documentId,
      mode: 'leftNavigate',
      newTab,
      tabs
    })
    schedulePersistSnapshot()
    if (openResult.shouldNavigate && openResult.navigateDocumentId !== null) {
      await navigateToOpenedDocumentRoute(openResult.navigateDocumentId)
    }
    return documentId
  }

  async function createTemporaryDocumentUnderParentFromOpenedTab (
    sourceDocumentId: string
  ): Promise<string | null> {
    const sourceTab = findTabByDocumentId(sourceDocumentId)
    if (sourceTab === null) {
      return null
    }

    const api = window.faContentBridgeAPIs?.projectContent
    if (
      typeof api?.getDocumentById !== 'function' ||
      typeof api?.getDocumentTemplateById !== 'function' ||
      typeof api?.getWorldById !== 'function'
    ) {
      throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.createTemporaryError'))
    }

    const actionContext = await resolveOpenedDocumentTabDocumentActionContext({
      getDocumentById: api.getDocumentById,
      sourceTab
    })
    if (actionContext === null) {
      return null
    }

    const { templateId, worldId } = actionContext
    await api.getWorldById(worldId)
    const template = await api.getDocumentTemplateById(templateId)
    const preferredLanguageCode = resolvePreferredLanguageCodeForTemporaryDocument()
    const displayName = resolveProjectHierarchyTreeNewDocumentDisplayName({
      preferredLanguageCode,
      titlePluralTranslations: template.titlePluralTranslations,
      titleSingularTranslations: template.titleSingularTranslations
    })
    const temporaryParentResolveDocumentIds =
      await buildTemporaryDocumentParentResolveDocumentIdsFromOpenedTab({
        getDocumentById: api.getDocumentById,
        sourceTab
      })

    const documentId = await createTemporaryDocument({
      displayName,
      parentDocumentId: sourceTab.documentId,
      templateId,
      temporaryParentResolveDocumentIds,
      worldId
    })
    return documentId
  }

  async function updateTemporaryDocumentParent (
    documentId: string,
    parentDocumentId: string | null
  ): Promise<void> {
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
    const nextTabs = [...tabs.value]
    nextTabs[index] = applyTemporaryOpenedDocumentParent(current, parentDocumentId)
    tabs.value = nextTabs
    schedulePersistSnapshot()
  }

  async function remapOpenedDocumentTabId (fromId: string, toId: string): Promise<void> {
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
      await navigateToOpenedDocumentRoute(toId)
    }
    schedulePersistSnapshot()
  }

  async function focusTab (documentId: string): Promise<void> {
    if (findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId) === -1) {
      return
    }
    activeDocumentId.value = documentId
    schedulePersistSnapshot()
    await navigateToOpenedDocumentRoute(documentId)
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
    schedulePersistSnapshot()
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
    schedulePersistSnapshot()
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
    schedulePersistSnapshot()
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
    schedulePersistSnapshot()
  }

  function enterDocumentEditMode (documentId: string): void {
    setDocumentEditState(documentId, true)
  }

  async function saveDocumentDisplayName (
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
    const api = window.faContentBridgeAPIs?.projectContent
    if (!input.keepEditMode && typeof document !== 'undefined') {
      const activeElement = document.activeElement
      if (activeElement instanceof HTMLElement) {
        activeElement.blur()
      }
    }

    if (resolveOpenedDocumentTabIsTemporary(current.persistenceState)) {
      if (
        typeof api?.createDocument !== 'function' ||
        typeof api?.getDocumentTemplateById !== 'function'
      ) {
        throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.saveError'))
      }
      const worldId = current.worldId
      const templateId = current.templateId
      if (worldId === undefined || templateId === undefined) {
        throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.saveError'))
      }
      const template = await api.getDocumentTemplateById(templateId)
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
      const availableDocumentIds = new Set<string>()
      for (const documentId of parentResolveChain) {
        try {
          await api.getDocumentById(documentId)
          availableDocumentIds.add(documentId)
        } catch {
          continue
        }
      }
      const resolvedParentDocumentId = resolveTemporaryDocumentParentDocumentIdForSave({
        chain: parentResolveChain,
        isDocumentIdAvailable: (documentId) => availableDocumentIds.has(documentId)
      })
      try {
        const savedDocument = await api.createDocument({
          displayName,
          documentBackgroundColor: resolveOpenedDocumentAppearanceColorDraftForPersist(
            current.documentBackgroundColorDraft
          ),
          documentTextColor: resolveOpenedDocumentAppearanceColorDraftForPersist(
            current.documentTextColorDraft
          ),
          id: documentId,
          parentDocumentId: resolvedParentDocumentId,
          templateId,
          worldId
        })
        if (savedDocument.id !== documentId) {
          await remapOpenedDocumentTabId(documentId, savedDocument.id)
        }
        const savedIndex = findOpenedDocumentTabIndexByDocumentId(
          tabs.value,
          savedDocument.id
        )
        if (savedIndex === -1) {
          throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.saveErrorMissingTab'))
        }
        const savedTab = tabs.value[savedIndex]
        if (savedTab === undefined) {
          throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.saveErrorMissingTab'))
        }
        const nextTabs = [...tabs.value]
        nextTabs[savedIndex] = promoteTemporaryOpenedDocumentTabAfterCreate(savedTab, {
          documentId: savedDocument.id,
          keepEditMode: input.keepEditMode,
          savedDisplayName: savedDocument.displayName,
          savedDocumentBackgroundColor: savedDocument.documentBackgroundColor,
          savedDocumentTextColor: savedDocument.documentTextColor
        })
        tabs.value = nextTabs
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
      } catch (error) {
        console.error('[S_FaOpenedDocuments] saveDocumentDisplayName temporary failed', error)
        throw error instanceof Error
          ? error
          : new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.saveError'))
      }
      return
    }

    if (typeof api?.updateDocument !== 'function') {
      throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.saveError'))
    }
    const trimmedDraft = current.displayNameDraft.trim()
    if (trimmedDraft.length === 0) {
      throw new Error(i18n.global.t('globalFunctionality.faOpenedDocuments.saveErrorEmptyDraft'))
    }
    try {
      const savedDocument = await api.updateDocument(documentId, {
        displayName: trimmedDraft,
        documentBackgroundColor: resolveOpenedDocumentAppearanceColorDraftForPersist(
          current.documentBackgroundColorDraft
        ),
        documentTextColor: resolveOpenedDocumentAppearanceColorDraftForPersist(
          current.documentTextColorDraft
        )
      })
      const savedDocumentTextColor = normalizeOpenedDocumentAppearanceColorFromDb(
        savedDocument.documentTextColor
      )
      const savedDocumentBackgroundColor = normalizeOpenedDocumentAppearanceColorFromDb(
        savedDocument.documentBackgroundColor
      )
      const nextTabs = [...tabs.value]
      nextTabs[index] = applyFaOpenedDocumentTabAfterDisplayNameSave(current, {
        keepEditMode: input.keepEditMode,
        savedDisplayName: savedDocument.displayName,
        savedDocumentBackgroundColor,
        savedDocumentTextColor
      })
      tabs.value = nextTabs
      schedulePersistSnapshot.flush()
      await flushPersistSnapshot()
      S_FaProjectHierarchyTree().refreshDocumentsInTree([documentId])
    } catch (error) {
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
    pendingDeleteDocumentId.value = null
    await deleteOpenedDocument(documentId)
  }

  async function confirmDiscardAndClose (documentId: string): Promise<void> {
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
        await navigateToWorkspaceHomeRoute()
      } else if (closeResult.nextActiveDocumentId !== null) {
        await navigateToOpenedDocumentRoute(closeResult.nextActiveDocumentId)
      }
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
        await navigateToWorkspaceHomeRoute()
      } else if (input.closeResult.nextActiveDocumentId !== null) {
        await navigateToOpenedDocumentRoute(input.closeResult.nextActiveDocumentId)
      }
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
      await window.faContentBridgeAPIs.projectContent.deleteDocument(documentId)
    }
    removeProjectHierarchyTreeDocumentNodesByDocumentIds(
      hierarchyStore.treeData,
      [documentId]
    )
    if (treeRefreshNodeIds.length > 0) {
      hierarchyStore.refreshHierarchyTreeNodes(treeRefreshNodeIds)
    }
    const index = findOpenedDocumentTabIndexByDocumentId(tabs.value, documentId)
    if (index !== -1) {
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
          await navigateToWorkspaceHomeRoute()
        } else if (closeResult.nextActiveDocumentId !== null) {
          await navigateToOpenedDocumentRoute(closeResult.nextActiveDocumentId)
        }
      }
      await flushPersistSnapshot()
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
    schedulePersistSnapshot()
  }

  function moveDocumentTab (documentId: string, direction: 'left' | 'right'): void {
    const offset = direction === 'left' ? -1 : 1
    const nextTabs = moveOpenedDocumentTabByOffset(tabs.value, documentId, offset)
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

  watch(
    () => [tabs.value, activeDocumentId.value] as const,
    () => {
      if (!hydrationComplete.value) {
        return
      }
      schedulePersistSnapshot()
    },
    { deep: true }
  )

  return {
    activeDocumentId: readonly(activeDocumentId),
    closeAllTabsWithoutChanges,
    closeTabsWithoutChangesExcept,
    confirmDiscardAndClose,
    confirmDeleteOpenedDocument,
    deleteOpenedDocument,
    dismissPendingClose,
    dismissPendingDelete,
    findTabByDocumentId,
    flushPersistSnapshot,
    focusTab,
    forceCloseAllTabs,
    forceCloseAllTabsExcept,
    hydrateFromProjectDatabase,
    hydrationComplete: readonly(hydrationComplete),
    clearSession,
    createTemporaryDocument,
    createTemporaryDocumentCopyFromOpenedTab,
    createTemporaryDocumentCopyFromSource,
    createTemporaryDocumentUnderParentDocument,
    createTemporaryDocumentUnderParentFromOpenedTab,
    enterDocumentEditMode,
    moveActiveDocumentTab,
    moveDocumentTab,
    openFromTree,
    pendingCloseDocumentId: readonly(pendingCloseDocumentId),
    pendingDeleteDocumentId: readonly(pendingDeleteDocumentId),
    replaceSessionForComponentTesting,
    remapOpenedDocumentTabId,
    requestCloseTab,
    requestDeleteDocument,
    saveDocumentDisplayName,
    setDocumentEditState,
    syncActiveDocumentIdFromWorkspaceRoute,
    tabs: readonly(tabs),
    updateDisplayNameDraft,
    updateDocumentBackgroundColorDraft,
    updateDocumentTextColorDraft,
    updateTemporaryDocumentParent
  }
})
