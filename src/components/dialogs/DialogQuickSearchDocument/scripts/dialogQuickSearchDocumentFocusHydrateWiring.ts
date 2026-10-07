import type { I_createUseDialogQuickSearchDocumentDeps } from 'app/types/I_createUseDialogQuickSearchDocument'
import type { I_dialogQuickSearchDocumentFaSelectInputLike } from 'app/types/I_createUseDialogQuickSearchDocument'
import type { I_dialogQuickSearchDocumentSession } from 'app/types/I_createUseDialogQuickSearchDocument'
import type { I_dialogQuickSearchDocumentDocumentSource } from 'app/types/I_dialogQuickSearchDocument'
import type { I_dialogQuickSearchDocumentTemplateIconSource } from 'app/types/I_dialogQuickSearchDocument'
import type { I_dialogQuickSearchDocumentWorldSource } from 'app/types/I_dialogQuickSearchDocument'
import type { I_ref } from 'app/types/I_vueCompositionShims'

/**
 * True when the value exposes FaSelectInput openPopup (document auto-open).
 */
export function isDialogQuickSearchDocumentFaSelectInputLike (
  value: unknown
): value is I_dialogQuickSearchDocumentFaSelectInputLike {
  if (value === null || typeof value !== 'object') {
    return false
  }
  const candidate = value as {
    openPopup?: unknown
  }
  return typeof candidate.openPopup === 'function'
}

/**
 * Bumps focus generation so in-flight nextTick/sleep focus work is ignored.
 */
export function cancelDialogQuickSearchDocumentFocus (
  session: Pick<I_dialogQuickSearchDocumentSession, 'focusGeneration'>
): void {
  session.focusGeneration.value += 1
}

/**
 * FA 1.0 ExistingDocument timing (nextTick + sleep) + opt-in FaSelectInput openPopup.
 */
export async function focusDialogQuickSearchDocumentSelectAfterShow (
  deps: Pick<I_createUseDialogQuickSearchDocumentDeps, 'nextTick' | 'sleep' | 'documentFocusMs'>,
  session: Pick<
    I_dialogQuickSearchDocumentSession,
    'dialogModel' | 'focusGeneration' | 'documentSelectRef'
  >,
  focusGeneration: number
): Promise<void> {
  await deps.nextTick()
  await deps.sleep(deps.documentFocusMs)
  if (session.focusGeneration.value !== focusGeneration) {
    return
  }
  if (session.dialogModel.value !== true) {
    return
  }
  const select = session.documentSelectRef.value
  if (!isDialogQuickSearchDocumentFaSelectInputLike(select)) {
    return
  }
  select.openPopup()
}

/**
 * Starts a cancellable FA 1.0 ExistingDocument-timed open sequence; returns the generation used for this run.
 */
export function scheduleDialogQuickSearchDocumentFocus (
  deps: Pick<I_createUseDialogQuickSearchDocumentDeps, 'nextTick' | 'sleep' | 'documentFocusMs'>,
  session: Pick<
    I_dialogQuickSearchDocumentSession,
    'dialogModel' | 'focusGeneration' | 'documentSelectRef'
  >
): number {
  session.focusGeneration.value += 1
  const focusGeneration = session.focusGeneration.value
  void focusDialogQuickSearchDocumentSelectAfterShow(deps, session, focusGeneration)
  return focusGeneration
}

/**
 * Template `:ref` binder — keeps session.documentSelectRef on FaSelectInput expose.
 */
export function bindDialogQuickSearchDocumentSelectRef (
  documentSelectRef: I_ref<I_dialogQuickSearchDocumentFaSelectInputLike | null>,
  el: unknown
): void {
  if (!isDialogQuickSearchDocumentFaSelectInputLike(el)) {
    documentSelectRef.value = null
    return
  }
  documentSelectRef.value = el
}

/**
 * Loads worlds/templates and picks saved last world. Does not load documents
 * (document select hydrates after the dialog is open).
 */
export async function hydrateDialogQuickSearchDocumentWorlds (
  deps: I_createUseDialogQuickSearchDocumentDeps,
  session: {
    focusGeneration: I_ref<number>
    selectedDocumentId: I_ref<string | null>
    selectedWorldId: I_ref<string | null>
    templateIconsById: I_ref<Map<string, I_dialogQuickSearchDocumentTemplateIconSource>>
    worlds: I_ref<I_dialogQuickSearchDocumentWorldSource[]>
  }
): Promise<void> {
  const focusGeneration = session.focusGeneration.value
  const sources = await deps.loadQuickSearchDocumentSources()
  const savedWorldId = await deps.readLastSelectedWorldId()
  if (session.focusGeneration.value !== focusGeneration) {
    return
  }
  const nextMap = new Map<string, I_dialogQuickSearchDocumentTemplateIconSource>()
  for (const template of sources.templates) {
    nextMap.set(template.id, template)
  }
  session.worlds.value = sources.worlds
  session.templateIconsById.value = nextMap
  session.selectedDocumentId.value = null
  session.selectedWorldId.value = deps.pickWorldIdWithSavedPreference({
    worlds: sources.worlds,
    savedWorldId,
    pickFirstWorldId: deps.pickFirstWorldId
  })
}

const quickSearchDocumentHydrateSerialByList = new WeakMap<
  I_ref<I_dialogQuickSearchDocumentDocumentSource[]>,
  { current: number }
>()

const quickSearchDocumentListWorldIdByList = new WeakMap<
  I_ref<I_dialogQuickSearchDocumentDocumentSource[]>,
  string | null
>()

function syncQuickSearchDocumentListWorld (
  documents: I_ref<I_dialogQuickSearchDocumentDocumentSource[]>,
  worldId: string | null
): void {
  const previousWorldId = quickSearchDocumentListWorldIdByList.get(documents)
  if (worldId === null || previousWorldId !== worldId) {
    documents.value = []
  }
  quickSearchDocumentListWorldIdByList.set(documents, worldId)
}

function beginQuickSearchDocumentHydrate (
  documents: I_ref<I_dialogQuickSearchDocumentDocumentSource[]>
): {
    requestSerial: number
    requestSerialBox: { current: number }
  } {
  const existing = quickSearchDocumentHydrateSerialByList.get(documents)
  const requestSerialBox = existing ?? { current: 0 }
  if (existing === undefined) {
    quickSearchDocumentHydrateSerialByList.set(documents, requestSerialBox)
  }
  requestSerialBox.current += 1
  const requestSerial = requestSerialBox.current
  return {
    requestSerial,
    requestSerialBox
  }
}

/**
 * Loads documents for the session selected world (empty list when none selected).
 */
export async function hydrateDialogQuickSearchDocumentDocuments (
  deps: I_createUseDialogQuickSearchDocumentDeps,
  session: {
    documents: I_ref<I_dialogQuickSearchDocumentDocumentSource[]>
    selectedWorldId: I_ref<string | null>
  }
): Promise<void> {
  const hydrateSerial = beginQuickSearchDocumentHydrate(session.documents)
  const selectedWorldId = session.selectedWorldId.value
  const worldId = selectedWorldId === null || selectedWorldId.length === 0
    ? null
    : selectedWorldId
  syncQuickSearchDocumentListWorld(session.documents, worldId)
  if (worldId === null) {
    return
  }
  const documents = await deps.loadDocumentsForWorld(worldId)
  if (hydrateSerial.requestSerialBox.current !== hydrateSerial.requestSerial) {
    return
  }
  if (session.selectedWorldId.value !== worldId) {
    return
  }
  session.documents.value = documents
}

/**
 * Reloads documents after a world pick and reopens the document menu only when that world is still selected.
 */
export async function reloadDialogQuickSearchDocumentDocumentsForSelectedWorld (
  deps: I_createUseDialogQuickSearchDocumentDeps,
  session: {
    dialogModel: I_ref<boolean>
    documentSelectRef: I_ref<I_dialogQuickSearchDocumentFaSelectInputLike | null>
    documents: I_ref<I_dialogQuickSearchDocumentDocumentSource[]>
    focusGeneration: I_ref<number>
    selectedWorldId: I_ref<string | null>
  },
  worldId: string | null
): Promise<void> {
  if (worldId === null || worldId.length === 0) {
    session.documents.value = []
    return
  }
  await hydrateDialogQuickSearchDocumentDocuments(deps, session)
  if (session.selectedWorldId.value !== worldId) {
    return
  }
  scheduleDialogQuickSearchDocumentFocus(deps, session)
}

/**
 * Full hydrate: worlds first, then documents for the picked world.
 */
export async function hydrateDialogQuickSearchDocumentSources (
  deps: I_createUseDialogQuickSearchDocumentDeps,
  session: {
    documents: I_ref<I_dialogQuickSearchDocumentDocumentSource[]>
    focusGeneration: I_ref<number>
    selectedDocumentId: I_ref<string | null>
    selectedWorldId: I_ref<string | null>
    templateIconsById: I_ref<Map<string, I_dialogQuickSearchDocumentTemplateIconSource>>
    worlds: I_ref<I_dialogQuickSearchDocumentWorldSource[]>
  }
): Promise<void> {
  const focusGeneration = session.focusGeneration.value
  await hydrateDialogQuickSearchDocumentWorlds(deps, session)
  if (session.focusGeneration.value !== focusGeneration) {
    return
  }
  await hydrateDialogQuickSearchDocumentDocuments(deps, session)
}
